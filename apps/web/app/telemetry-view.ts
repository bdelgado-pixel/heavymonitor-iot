// Packets may contain different variables at different sampling frequencies.
export function lastReported<T>(rows:T[],key:keyof T):T|undefined{
 for(let i=rows.length-1;i>=0;i--)if(rows[i][key]!=null)return rows[i];
 return undefined;
}
export type GasValue={gas:string;unit:string;value:number};
export function lastGases<T extends {measured_at:string;source?:string;gas_readings?:GasValue[]}>(rows:T[]){
 const byGas=new Map<string,GasValue&{measured_at:string;source?:string}>();
 for(const row of rows)for(const g of row.gas_readings||[])byGas.set(g.gas+'|'+g.unit,{...g,measured_at:row.measured_at,source:row.source});
 return [...byGas.values()].sort((a,b)=>(a.gas+'|'+a.unit).localeCompare(b.gas+'|'+b.unit));
}
