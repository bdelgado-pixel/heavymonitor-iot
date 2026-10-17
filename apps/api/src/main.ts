import 'reflect-metadata';
import 'dotenv/config';
import {Body,Controller,Get,Post,Headers,Module,Injectable,OnModuleDestroy,OnModuleInit,BadRequestException,UnauthorizedException,ServiceUnavailableException,Inject,UseGuards,Req,Res,Patch,Param} from '@nestjs/common';
import {Security} from './security';
import {Operations} from './operations';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {resolve} from 'node:path';
import {initializeDatabase} from './bootstrap-database';
import {DataService,Reading} from './telemetry';
import {WebSocketServer} from 'ws';
import {applyProductionConfig} from './production';
import mqtt,{MqttClient} from 'mqtt';
import {timingSafeEqual,randomUUID} from 'node:crypto';
@Controller('api')
class ApiController{
 constructor(@Inject(DataService)private readonly data:DataService,@Inject(Security)private readonly security:Security){}
 @Post('auth/login')async login(@Body()body:any,@Req()req:any,@Res({passthrough:true})res:any){const result=await this.security.login(body?.email,body?.password,req.ip);res.cookie('hm_session',result.token,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',maxAge:8*3600000,path:'/api'});return result.user}
 @Post('auth/logout')async logout(@Req()req:any,@Res({passthrough:true})res:any){await this.security.logout(req);res.clearCookie('hm_session',{path:'/api'});return {ok:true}}
 @Get('auth/me')@UseGuards(Security)me(@Req()req:any){return req.user}
 @Post('users')@UseGuards(Security)createUser(@Req()req:any,@Body()body:any){return this.security.createUser(req.user,body)}
 @Post('auth/password')@UseGuards(Security)password(@Req()req:any,@Body()body:any){return this.security.changePassword(req.user,body)}
 @Patch('users/:id')@UseGuards(Security)manageUser(@Req()req:any,@Param('id')id:string,@Body()body:any){return this.security.manageUser(req.user,id,body)}
 @Post('users/:id/password')@UseGuards(Security)resetPassword(@Req()req:any,@Param('id')id:string,@Body()body:any){return this.security.resetPassword(req.user,id,body)}
 @Get('users')@UseGuards(Security)async users(@Req()req:any){this.security.assertRole(req.user,['administrator']);return (await this.data.pool.query('SELECT id,email,role,enabled,created_at FROM app_users ORDER BY email')).rows}
 @Patch('alerts/:id/acknowledge')@UseGuards(Security)async acknowledge(@Param('id')id:string,@Body()body:any,@Req()req:any){this.security.assertRole(req.user,['administrator','technician','supervisor']);if(!/^\d+$/.test(id)||typeof body.note!=='string'||body.note.length>2000)throw new BadRequestException('Acción inválida');const result=await this.data.pool.query('UPDATE alerts SET acknowledged_at=now(),action_note=$1 WHERE id=$2 RETURNING id',[body.note,id]);if(!result.rowCount)throw new BadRequestException('Alerta no encontrada');return {ok:true}}

 @Get('state')@UseGuards(Security)state(){return this.data.state()}
 @Get('health')async health(){await this.data.pool.query('SELECT 1');return {status:'ok'}}
 @Post('device/heartbeat')async heartbeat(@Headers('authorization')auth:string,@Body()body:any){await this.data.authorize(body?.device_id,auth?.startsWith('Bearer ')?auth.slice(7):'');for(const key of ['storage_ok','sensors_ok'])if(body[key]!=null&&typeof body[key]!=='boolean')throw new BadRequestException('Estado inválido');const result=await this.data.pool.query('UPDATE devices SET last_seen_at=now(),status=$2 WHERE id=$1 RETURNING interval_ms,timeout_seconds,component_id',[body.device_id,JSON.stringify({storage_ok:body.storage_ok??null,sensors_ok:body.sensors_ok??null})]);return {...result.rows[0],server_time:new Date().toISOString()}}
 @Post('measurements')async ingest(@Headers('authorization')auth:string,@Body()r:Reading&{simulated?:boolean}){await this.data.authorize(r?.device_id,auth?.startsWith('Bearer ')?auth.slice(7):'');if(r.simulated!=null&&typeof r.simulated!=='boolean')throw new BadRequestException('Origen inválido');try{return await this.data.ingest(r,r.simulated?'simulation':'device')}catch(e){if(e instanceof BadRequestException)await this.data.invalidData(r.device_id);throw e}}

}
@Module({controllers:[ApiController,Operations],providers:[DataService,Security]})class AppModule{}
async function bootstrap(){const app=await NestFactory.create<NestExpressApplication>(AppModule);if(!process.env.APP_ORIGIN&&process.env.RENDER_EXTERNAL_URL)process.env.APP_ORIGIN=process.env.RENDER_EXTERNAL_URL;applyProductionConfig();await initializeDatabase(app.get(DataService).pool);if(process.env.NODE_ENV==='production')app.getHttpAdapter().getInstance().set('trust proxy',1);await app.get(Security).initialize();app.use((req:any,res:any,next:any)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.once('finish',()=>{if(req.user&&!['GET','HEAD','OPTIONS'].includes(req.method)&&res.statusCode<400)app.get(Security).pool.query('INSERT INTO audit_log(user_id,action,target) VALUES($1,$2,$3)',[req.user.id,req.method,String(req.path).slice(0,200)]).catch(()=>console.error('Auditoría: escritura fallida'))});if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin&&req.headers.origin!==process.env.APP_ORIGIN&&(process.env.NODE_ENV==='production'||!['http://127.0.0.1:3000','http://localhost:3000'].includes(req.headers.origin)))return res.status(403).json({error:'Origen no permitido'});next()});if(process.env.SERVE_WEB==='true'){app.useStaticAssets(resolve(__dirname,'../../web/out'));}app.enableShutdownHooks();const sockets=new WebSocketServer({noServer:true,maxPayload:1024});app.getHttpServer().on('upgrade',async(req:any,socket:any,head:any)=>{try{if(req.url!=='/api/live'||sockets.clients.size>=50)throw Error();const origin=req.headers.origin;const allowed=process.env.APP_ORIGIN||'http://127.0.0.1:3000';if(origin!==allowed&&!(process.env.NODE_ENV!=='production'&&origin==='http://localhost:3000'))throw Error();await app.get(Security).user(req);sockets.handleUpgrade(req,socket,head,ws=>{ws.on('error',()=>{});const expires=setTimeout(()=>ws.close(1008,'Renovar sesión'),60000);ws.on('close',()=>clearTimeout(expires));ws.send(JSON.stringify({type:'connected'}))})}catch{socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');socket.destroy()}});let broadcasting=false;const liveTimer=setInterval(async()=>{if(broadcasting||sockets.clients.size===0)return;broadcasting=true;try{const snapshot=JSON.stringify({type:'state',data:await app.get(DataService).state()});for(const ws of sockets.clients)if(ws.readyState===1&&ws.bufferedAmount<500000)ws.send(snapshot)}catch{}finally{broadcasting=false}},2000);app.getHttpServer().on('close',()=>{clearInterval(liveTimer);for(const ws of sockets.clients)ws.terminate();sockets.close()});await app.listen(Number(process.env.PORT||4000),process.env.API_HOST||'127.0.0.1')}
bootstrap().catch(()=>{console.error('No se pudo iniciar la API. Revisa PostgreSQL y la configuración.');process.exitCode=1});
