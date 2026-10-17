import './globals.css';
import './auth.css';
import './modules.css';
import Session from './session';
export const metadata={title:'HeavyMonitor IoT',description:'Monitoreo de condición de maquinaria pesada'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body><Session>{children}</Session></body></html>}
