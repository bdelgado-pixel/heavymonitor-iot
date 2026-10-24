import {BadRequestException} from '@nestjs/common';

export type GasReading={gas:string;value:number;unit:string};
export type GasLimit={gas:string;unit:string;warning:number;critical:number};
export const gasUnits=['ppm','%vol','mg/m3'] as const;
export const numericRanges:Record<string,readonly [number,number]>={
 temperature_c:[-50,200],vibration_rms_ms2:[0,100],vibration_x:[-200,200],vibration_y:[-200,200],vibration_z:[-200,200],pressure_bar:[0,1000],rpm:[0,20000],
 operating_hours:[0,10000000],hydraulic_level_pct:[0,100],gps_latitude:[-90,90],gps_longitude:[-180,180],gps_altitude_m:[-1000,20000],gps_speed_kmh:[0,1000],gps_accuracy_m:[0,100000],gps_satellites:[0,1000]
};
export const extraNumericKeys=['operating_hours','hydraulic_level_pct','gps_latitude','gps_longitude','gps_altitude_m','gps_speed_kmh','gps_accuracy_m','gps_satellites'] as const;
export function gases(value:unknown,limits=false):GasReading[]|GasLimit[]{
 if(value==null)return [];
 if(!Array.isArray(value)||value.length>16)throw new BadRequestException('Se permiten hasta 16 lecturas o límites de gases');
 const seen=new Set<string>();
 const rows=value.map(item=>{
  if(!item||typeof item!=='object'||typeof item.gas!=='string'||!/^[A-Z][A-Z0-9_]{0,23}$/.test(item.gas)||!gasUnits.includes(item.unit))throw new BadRequestException('Gas o unidad inválidos: usa ppm, %vol o mg/m3');
  const key=item.gas+':'+item.unit;if(seen.has(key))throw new BadRequestException('Gas y unidad duplicados');seen.add(key);
  const max=item.unit==='%vol'?100:1000000000;
  for(const k of limits?['warning','critical']:['value'])if(typeof item[k]!=='number'||!Number.isFinite(item[k])||item[k]<0||item[k]>max)throw new BadRequestException('Valor de gas inválido');
  if(limits&&item.warning>=item.critical)throw new BadRequestException('El límite crítico del gas debe superar la advertencia');
  return limits?{gas:item.gas,unit:item.unit,warning:item.warning,critical:item.critical}:{gas:item.gas,unit:item.unit,value:item.value};
 });
 return rows.sort((a,b)=>(a.gas+':'+a.unit).localeCompare(b.gas+':'+b.unit)) as GasReading[]|GasLimit[];
}
export function validateValues(r:Record<string,any>){
 for(const [key,[min,max]]of Object.entries(numericRanges)){const n=r[key];if(n!=null&&(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max))throw new BadRequestException('Valor inválido: '+key);}
 if(r.gps_satellites!=null&&!Number.isInteger(r.gps_satellites))throw new BadRequestException('Número de satélites inválido');
 for(const k of ['storage_ok','sensors_ok','operating','gps_fix'])if(r[k]!=null&&typeof r[k]!=='boolean')throw new BadRequestException('Estado inválido: '+k);
 const hasLat=r.gps_latitude!=null,hasLon=r.gps_longitude!=null;
 if(hasLat!==hasLon||(hasLat&&r.gps_fix!==true)||(r.gps_fix===true&&!hasLat))throw new BadRequestException('GPS: envía latitud y longitud juntas con gps_fix=true; sin señal envía gps_fix=false y omite coordenadas');
 if(!hasLat&&['gps_altitude_m','gps_speed_kmh','gps_accuracy_m'].some(k=>r[k]!=null))throw new BadRequestException('GPS: los datos de posición requieren una ubicación válida');
 const gas=gases(r.gas_readings) as GasReading[];
 if(!Object.keys(numericRanges).some(k=>r[k]!=null)&&!gas.length&&r.gps_fix==null)throw new BadRequestException('La medición debe contener al menos una variable');
 return gas;
}
export const gasText=(readings:GasReading[]|undefined|null)=>(readings||[]).map(g=>`${g.gas}: ${g.value} ${g.unit}`).join('; ');
