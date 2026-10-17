import type {NextConfig} from 'next';
const staticExport=process.env.HM_STATIC_EXPORT==='true';
const config:NextConfig=staticExport?{output:'export',images:{unoptimized:true}}:{async rewrites(){return [{source:'/api/:path*',destination:(process.env.API_URL||'http://127.0.0.1:4000')+'/api/:path*'}]}};export default config;
