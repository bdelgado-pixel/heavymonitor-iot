const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const {lastReported,lastGases}=await import(pathToFileURL(path.join(__dirname,'apps/web/app/telemetry-view.ts')).href);
 const rows=[{measured_at:'2026-10-24T12:00:00Z',temperature_c:58,operating_hours:1250,hydraulic_level_pct:0,gas_readings:[{gas:'CO',unit:'ppm',value:12},{gas:'CO2',unit:'%vol',value:.5}],gps_fix:true,gps_latitude:0,gps_longitude:0},
 {measured_at:'2026-10-24T12:00:01Z',gps_fix:false},
 {measured_at:'2026-10-24T12:00:02Z',gas_readings:[{gas:'CO',unit:'ppm',value:13}]}];
 assert.equal(lastReported(rows,'temperature_c').temperature_c,58);assert.equal(lastReported(rows,'operating_hours').operating_hours,1250);assert.equal(lastReported(rows,'hydraulic_level_pct').hydraulic_level_pct,0);
 assert.equal(lastReported(rows,'gps_fix').gps_fix,false);assert.equal(lastReported(rows,'temperature_c').measured_at,rows[0].measured_at);assert.equal(lastReported(rows,'rpm'),undefined);
 const gas=lastGases(rows);assert.equal(gas.length,2);assert.equal(gas.find(g=>g.gas==='CO').value,13);assert.equal(gas.find(g=>g.gas==='CO2').value,.5);assert.equal(gas.find(g=>g.gas==='CO2').measured_at,rows[0].measured_at);
 assert.equal(lastReported([],'temperature_c'),undefined);assert.deepEqual(lastGases([]),[]);
 console.log('PASS: paquetes parciales conservan valores y fechas; gases independientes, cero válido y pérdida GPS explícita.');
})().catch(e=>{console.error(e);process.exitCode=1;});
