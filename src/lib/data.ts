export type Mode = 'Bus' | 'Jeepney' | 'Minibus';
export type Point = [number, number];
export type RouteOption = { id:string; name:string; mode:Mode; from:string; to:string; color:string; wait:number; travel:number; walk:number; transfer:number; fare:number; arrival:number; occupancy:string; fill:number; capacity:number; geometry:Point[]; stops:string[]; recommended?:boolean };
export const locations=['Laoag City Terminal','Gilbert Bridge','MMSU Batac Main Campus','San Nicolas','MMSU Laoag Campus','MMSU Currimao Campus','MMSU Dingras Campus'] as const;
export const campuses=[locations[2],locations[4],locations[5],locations[6]];
const points: Record<string,Point> = {[locations[0]]:[120.593,18.197],[locations[1]]:[120.625,18.198],[locations[2]]:[120.817,18.13],[locations[3]]:[120.654,18.217],[locations[4]]:[120.572,18.17],[locations[5]]:[120.49,18.02],[locations[6]]:[120.696,18.1]};
const main:RouteOption[]=[
 {id:'green',name:'Demo Green Line 01',mode:'Bus',from:locations[0],to:locations[2],color:'#247d4c',wait:3,travel:35,walk:5,transfer:0,fare:65,arrival:3,occupancy:'Seats available',fill:48,capacity:28,geometry:[[120.593,18.197],[120.625,18.198],[120.662,18.187],[120.695,18.176],[120.731,18.15],[120.77,18.133],[120.817,18.13]],stops:[locations[0],locations[1],'Demo Batac Road Stop',locations[2]],recommended:true},
 {id:'gold',name:'Demo Jeepney 02',mode:'Jeepney',from:locations[0],to:locations[2],color:'#bf8b18',wait:6,travel:40,walk:5,transfer:0,fare:45,arrival:6,occupancy:'Moderate occupancy',fill:69,capacity:16,geometry:[[120.593,18.197],[120.639,18.217],[120.678,18.197],[120.731,18.15],[120.77,18.133],[120.817,18.13]],stops:[locations[0],'San Nicolas Junction','Demo Batac Road Stop',locations[2]]},
 {id:'blue',name:'Demo Minibus 03',mode:'Minibus',from:locations[0],to:locations[2],color:'#477ca1',wait:5,travel:30,walk:5,transfer:0,fare:85,arrival:5,occupancy:'Many seats available',fill:27,capacity:20,geometry:[[120.593,18.197],[120.625,18.198],[120.69,18.165],[120.731,18.15],[120.778,18.12],[120.817,18.13]],stops:[locations[0],locations[1],'Demo Batac Road Stop',locations[2]]},
 {id:'transfer',name:'Demo City Connector',mode:'Jeepney',from:locations[0],to:locations[2],color:'#8660a8',wait:4,travel:33,walk:6,transfer:8,fare:38,arrival:4,occupancy:'Almost full',fill:89,capacity:16,geometry:[[120.593,18.197],[120.65,18.207],[120.696,18.179],[120.738,18.153],[120.817,18.13]],stops:[locations[0],'San Nicolas Junction','Demo transfer point',locations[2]]}
];
const pairs:[number,number][]=[[2,0],[3,2],[2,3],[0,4],[4,0],[2,5],[5,2],[2,6],[6,2]];
export const routes:RouteOption[]=[...main,...pairs.flatMap(([a,b])=>main.slice(0,3).map((r,i)=>{const from=locations[a],to=locations[b],start=points[from],end=points[to];const mid:Point=[(start[0]+end[0])/2+(i===1?.012:0),(start[1]+end[1])/2+(i===1?.018:0)];return {...r,id:`${r.id}-${a}-${b}`,name:`${r.mode==='Bus'?'Demo Campus Connector':r.name} · ${to.replace('MMSU ','')}`,from,to,geometry:[start,mid,end] as Point[],stops:[from,'Approximate demo corridor',to]}}))];
export const routeById=(id:string)=>routes.find(r=>r.id===id);
export const routesFor=(from:string,to:string)=>routes.filter(r=>r.from===from&&r.to===to);
export const duration=(r:RouteOption)=>r.wait+r.travel+r.walk+r.transfer;
export const money=(n:number)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:0}).format(n);
export const formatMinutes=(n:number)=>n>=60?`${Math.floor(n/60)} hr ${n%60} min`:`${n} min`;
export const alerts=[{title:'Busy corridor',routeId:'green',severity:'Moderate',description:'Example traffic delay along the Laoag to Batac demonstration corridor.'},{title:'Terminal crowding',routeId:'gold',severity:'High',description:'Example crowding at the demonstration terminal.'},{title:'Service information',routeId:'blue',severity:'Low',description:'Example service update for the demo minibus.'}];
export const categories=['Long passenger queue','Crowded vehicle','Vehicle almost full','Delayed departure','Service interruption','Normal conditions'];
