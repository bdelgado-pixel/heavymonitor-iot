import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {gasText} from './extended-telemetry';
export const reportColumns=[['id','ID'],['device_id','Dispositivo'],['component_id','Componente'],['measured_at','Hora de medición UTC'],['received_at','Hora de recepción UTC'],['temperature_c','Temperatura °C'],['vibration_rms_ms2','Vibración RMS m/s²'],['vibration_x','X m/s²'],['vibration_y','Y m/s²'],['vibration_z','Z m/s²'],['pressure_bar','Presión bar'],['rpm','RPM'],['operating_hours','Horómetro h'],['hydraulic_level_pct','Nivel hidráulico %'],['gas_readings','Gases y unidades'],['gps_fix','GPS con señal'],['gps_latitude','GPS latitud'],['gps_longitude','GPS longitud'],['gps_altitude_m','GPS altitud m'],['gps_speed_kmh','GPS velocidad km/h'],['gps_accuracy_m','GPS precisión m'],['gps_satellites','GPS satélites'],['source','Origen']] as const;
const cell=(row:any,key:string)=>key==='gas_readings'?gasText(row.gas_readings):row[key] instanceof Date?row[key].toISOString():row[key];
export async function excelReport(result:any){
 const book=new ExcelJS.Workbook();book.creator='HeavyMonitor IoT';const sheet=book.addWorksheet('Mediciones');
 sheet.columns=reportColumns.map(([key,header])=>({key,header,width:key==='gas_readings'?60:key.includes('_at')?27:22}));
 for(const r of result.rows)sheet.addRow(Object.fromEntries(reportColumns.map(([key])=>[key,cell(r,key)])));
 sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF10263F'}};sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter={from:{row:1,column:1},to:{row:1,column:reportColumns.length}};
 const summary=book.addWorksheet('Resumen');summary.addRow(['HeavyMonitor IoT','Resumen del rango consultado']);
 for(const [key,value]of Object.entries(result.stats))if(key!=='gases')summary.addRow([key,value]);
 for(const g of result.stats.gases||[])summary.addRow([`${g.gas} (${g.unit})`,`Mín: ${g.min}; Máx: ${g.max}; Promedio: ${g.avg}; Lecturas: ${g.count}`]);
 summary.addRow(['Filas exportadas',result.rows.length]);summary.addRow(['Límite de exportación',result.limit]);summary.addRow(['Observación','Anomalías no equivalen a fallas confirmadas. Los gases no acreditan cumplimiento normativo. Datos simulados identificados en Origen.']);summary.getColumn(1).width=30;summary.getColumn(2).width=100;
 return book.xlsx.writeBuffer();
}
export async function pdfReport(result:any,machine:string){
 const doc=new PDFDocument({size:'A4',margin:40,bufferPages:true});const chunks:Buffer[]=[];
 const done=new Promise<Buffer>((resolve,reject)=>{doc.on('data',b=>chunks.push(b));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
 const number=(v:any,digits=2)=>typeof v==='number'?v.toFixed(digits):'Sin datos';
 function line(text:string,bold=false){doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(8);const height=doc.heightOfString(text,{width:510});if(doc.y+height>749)doc.addPage();doc.text(text,{width:510});}
 doc.fontSize(20).fillColor('#10263f').text('HeavyMonitor IoT');doc.fontSize(12).text('Reporte de condición · '+machine);doc.fontSize(9).fillColor('#333333').text('Generado: '+new Date().toISOString());doc.moveDown();
 line('Las anomalías requieren inspección; no confirman una falla. Los gases no acreditan cumplimiento normativo.');line('Los datos simulados están identificados en cada medición.');line(`Registros del rango: ${result.stats.count}. Filas incluidas: ${result.rows.length} (límite ${result.limit}).`);
 for(const [key,label]of [['temp_min','Temperatura mínima °C'],['temp_max','Temperatura máxima °C'],['temp_avg','Temperatura promedio °C'],['vib_max','Vibración máxima m/s²'],['pressure_max','Presión máxima bar'],['rpm_max','RPM máxima'],['hours_max','Horómetro máximo h'],['hydraulic_level_min','Nivel hidráulico mínimo %'],['hydraulic_level_avg','Nivel hidráulico promedio %'],['gps_count','Lecturas con posición GPS']])line(label+': '+number(result.stats[key]));
 for(const g of result.stats.gases||[])line(`${g.gas} (${g.unit}) - Mín: ${number(g.min)} / Máx: ${number(g.max)} / Prom: ${number(g.avg)}`);
 doc.moveDown();for(const row of result.rows){
  if(doc.y>650)doc.addPage();
  line(`${new Date(row.measured_at).toISOString()} | ${String(row.device_id).slice(0,80)} | ${row.source==='simulation'?'SIMULADO':'Dispositivo'}`,true);
  line(`Temp: ${number(row.temperature_c,1)} °C | RMS: ${number(row.vibration_rms_ms2)} m/s² | Presión: ${number(row.pressure_bar,1)} bar | RPM: ${number(row.rpm,0)}`);
  line(`X/Y/Z: ${[row.vibration_x,row.vibration_y,row.vibration_z].map(v=>number(v)).join(' / ')} m/s² | Horómetro: ${number(row.operating_hours)} h | Nivel hidráulico: ${number(row.hydraulic_level_pct,1)} %`);
  line('Gases: '+((row.gas_readings||[]).map((g:any)=>g.gas+': '+number(g.value,3)+' '+g.unit).join('; ')||'Sin datos'));
  line(row.gps_fix===true?`GPS: ${number(row.gps_latitude,6)}, ${number(row.gps_longitude,6)} | Altitud: ${number(row.gps_altitude_m)} m | Velocidad: ${number(row.gps_speed_kmh)} km/h | Precisión: ${number(row.gps_accuracy_m)} m | Satélites: ${number(row.gps_satellites,0)}`:row.gps_fix===false?'GPS: sin señal válida':'GPS: sin datos');doc.moveDown(.5);
 }
 const pages=doc.bufferedPageRange();for(let i=0;i<pages.count;i++){doc.switchToPage(i);doc.fontSize(8).fillColor('#64748b').text(`HeavyMonitor IoT | Página ${i+1} de ${pages.count}`,40,790,{align:'right',width:510,lineBreak:false});}doc.end();return done;
}
