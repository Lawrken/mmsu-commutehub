'use client';
/* eslint-disable react-hooks/set-state-in-effect -- Restore and persist browser storage after hydration. */
import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {z} from 'zod';
import {campuses, duration, routeById, routes, type RouteOption} from './data';

const routeSchema=z.object({id:z.string(),name:z.string(),mode:z.enum(['Bus','Jeepney','Minibus']),from:z.string(),to:z.string(),color:z.string(),wait:z.number(),travel:z.number(),walk:z.number(),transfer:z.number(),fare:z.number(),arrival:z.number(),occupancy:z.string(),fill:z.number(),capacity:z.number(),geometry:z.array(z.tuple([z.number(),z.number()])),stops:z.array(z.string()),recommended:z.boolean().optional()});
const reportSchema=z.object({id:z.string(),category:z.string(),routeId:z.string(),location:z.string(),description:z.string(),time:z.string(),origin:z.enum(['Demo report','Community report'])});
const tripSchema=z.object({id:z.string(),routeName:z.string(),from:z.string(),to:z.string(),minutes:z.number(),completed:z.string(),itinerary:routeSchema.optional()});
const activeSchema=z.object({id:z.string(),itinerary:routeSchema,stage:z.number().int().min(0).max(3)});
const stateSchema=z.object({version:z.literal(2),name:z.string(),campus:z.string(),favorites:z.array(z.string()),reports:z.array(reportSchema),trips:z.array(tripSchema),active:activeSchema.nullable()});
export type Report=z.infer<typeof reportSchema>; export type Trip=z.infer<typeof tripSchema>; export type State=z.infer<typeof stateSchema>;
const seed:State={version:2,name:'MMSU Commuter',campus:campuses[0],favorites:['green'],reports:[{id:'seed1',category:'Long passenger queue',routeId:'green',location:'Laoag City Terminal',description:'Sample report for presentation.',time:'Example',origin:'Demo report'},{id:'seed2',category:'Normal conditions',routeId:'gold',location:'San Nicolas Junction',description:'Sample report for presentation.',time:'Example',origin:'Demo report'}],trips:[],active:null};
function migrate(raw:unknown):State {const current=stateSchema.safeParse(raw);if(current.success)return current.data; const old=z.object({version:z.literal(1),name:z.unknown().optional(),campus:z.unknown().optional(),favorites:z.unknown().optional(),reports:z.unknown().optional(),trips:z.unknown().optional(),active:z.unknown().optional()}).safeParse(raw);if(!old.success)return seed;const v=old.data;
 const reports=Array.isArray(v.reports)?v.reports.flatMap((item:unknown)=>{const r=z.object({id:z.string(),category:z.string(),route:z.string(),location:z.string(),description:z.string(),time:z.string(),origin:z.enum(['Demo report','Community report'])}).safeParse(item);if(!r.success)return [];return [{...r.data,routeId:routes.find(x=>x.name===r.data.route)?.id??'green'}]}):seed.reports;
 const trips=Array.isArray(v.trips)?v.trips.flatMap((item:unknown)=>{const t=z.object({id:z.string(),route:z.string(),from:z.string(),to:z.string(),minutes:z.number(),completed:z.string()}).safeParse(item);if(!t.success)return [];const itinerary=routes.find(r=>r.name===t.data.route&&r.from===t.data.from&&r.to===t.data.to);return [{...t.data,routeName:t.data.route,itinerary}]}):[];
 const prev=z.object({id:z.string(),route:z.string(),stage:z.number().int().min(0).max(3),from:z.string(),to:z.string()}).safeParse(v.active);const found=prev.success?routeById(prev.data.route):undefined;
 return {version:2,name:typeof v.name==='string'?v.name:seed.name,campus:typeof v.campus==='string'&&campuses.includes(v.campus as typeof campuses[number])?v.campus:seed.campus,favorites:Array.isArray(v.favorites)?v.favorites.filter((id):id is string=>typeof id==='string'&&!!routeById(id)):seed.favorites,reports,trips,active:prev.success&&found?{id:prev.data.id,itinerary:found,stage:prev.data.stage}:null};}
type Store={data:State; ready:boolean; notice:string; setNotice:(value:string)=>void; update:(fn:(s:State)=>State)=>void; toggleFavorite:(id:string)=>void; start:(r:RouteOption)=>void; advance:()=>void; reset:()=>void};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}){const [data,setData]=useState<State>(seed);const [ready,setReady]=useState(false);const [notice,setNotice]=useState('');
 useEffect(()=>{try{const value=localStorage.getItem('mmsu-commutehub-v2')??localStorage.getItem('mmsu-commutehub-v1');if(value)setData(migrate(JSON.parse(value)))}catch{setNotice('Saved data could not be read. Starting with demo information.')}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('mmsu-commutehub-v2',JSON.stringify(data))}catch{setNotice('Changes could not be saved on this device.')}},[data,ready]);
 const update=useCallback((fn:(s:State)=>State)=>setData(fn),[]);
 const toggleFavorite=(id:string)=>update(s=>({...s,favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]}));
 const start=(r:RouteOption)=>update(s=>({...s,active:{id:crypto.randomUUID(),itinerary:r,stage:0}}));
 const advance=()=>update(s=>{if(!s.active)return s;if(s.active.stage<3)return {...s,active:{...s.active,stage:s.active.stage+1}};const a=s.active;return {...s,active:null,trips:s.trips.some(t=>t.id===a.id)?s.trips:[{id:a.id,routeName:a.itinerary.name,from:a.itinerary.from,to:a.itinerary.to,minutes:duration(a.itinerary),completed:new Date().toISOString(),itinerary:a.itinerary},...s.trips]}});
 const reset=()=>{try{localStorage.removeItem('mmsu-commutehub-v1');localStorage.removeItem('mmsu-commutehub-v2')}catch{}setData(seed);setNotice('Demo information has been reset.')};
 return <Context.Provider value={{data,ready,notice,setNotice,update,toggleFavorite,start,advance,reset}}>{children}</Context.Provider>}
export function useStore(){const store=useContext(Context);if(!store)throw new Error('StoreProvider is missing');return store}
