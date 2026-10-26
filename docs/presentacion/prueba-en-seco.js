const fs=require('fs');
const fuera=[]; let slideN=0, textos=0;
const cadena=()=>{const f=function(){return p};const p=new Proxy(f,{get:(t,k)=>k==='getId'?()=>'ID':p,apply:()=>p});return p;};
const chk=(tipo,x,y,w,h,txt)=>{ if(x<-0.5||y<-0.5||x+w>720.5||y+h>405.5) fuera.push(`slide ${slideN} ${tipo} "${String(txt||'').slice(0,34)}" x=${(x/0.5625).toFixed(0)} y=${(y/0.5625).toFixed(0)} w=${(w/0.5625).toFixed(0)} h=${(h/0.5625).toFixed(0)}`); };
const mkSlide=()=>{slideN++; return new Proxy({}, {get:(t,k)=>{
  if(k==='insertTextBox') return (s,x,y,w,h)=>{textos++; chk('texto',x,y,w,h,s); return cadena();};
  if(k==='insertShape') return (tp,x,y,w,h)=>{chk('forma',x,y,w,h); return cadena();};
  if(k==='insertImage') return (b,x,y,w,h)=>{chk('imagen',x,y,w,h); return cadena();};
  if(k==='insertLine') return (c,x1,y1,x2,y2)=>{chk('linea',Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1)); return cadena();};
  return ()=>cadena();
}})};
global.SlidesApp={create:()=>new Proxy({}, {get:(t,k)=>k==='appendSlide'?mkSlide:(k==='getId'?()=>'ID':(k==='getSlides'?()=>[cadena()]:()=>cadena()))}),
  PredefinedLayout:{},ShapeType:{},ParagraphAlignment:{},ContentAlignment:{},LineCategory:{}};
global.DriveApp=cadena();
global.Utilities={formatDate:(d,tz,f)=>{d=new Date(d);const M=d.getMonth()+1,D=d.getDate();return f.replace('yyyy',d.getFullYear()).replace('MM',String(M).padStart(2,'0')).replace('dd',String(D).padStart(2,'0')).replace(/^M$/,String(M)).replace(/^d$/,String(D));}};
global.formatearWhatsApp=x=>x;
const orig=console.log; const logs=[]; console.log=(...a)=>logs.push(a.join(' ')); console.warn=()=>{};
eval(fs.readFileSync(require('path').join(__dirname,'..','apps-script','Deck.gs'),'utf8')+';global.crearDeck=crearDeck;global.probarDeck=probarDeck;global.ORDEN_CADENA=ORDEN_CADENA;');
// 1) probarDeck
probarDeck(); orig('probarDeck -> slides:',slideN,'textos:',textos);
// 2) cada eslabón como el más flojo, y un empate
const base=JSON.parse(JSON.stringify({leadId:'X',timestamp:'2026-09-14T12:00:00Z',nombre:'',whatsapp:'5491100000000',negocio:'',rubro:'gastronomia',score:24,maxScore:36,eslabones:[],respuestas:[]}));
const preguntas=['¿Tenés algún indicador que seguís regularmente (crecimiento de ventas, contribución marginal, punto de equilibrio)?','¿Tenés un cierre mensual que te muestre ventas, costos, estructura, impuestos y ganancia neta?','¿Sabés con anticipación cuándo van a ser tus próximos gastos fuertes?'];
const casos=[[3,6,7,8],[8,3,6,7],[7,8,3,6],[6,7,8,3],[8,5,6,5]];
casos.forEach((sc,ci)=>{ slideN=0; const d=JSON.parse(JSON.stringify(base));
  d.eslabones=ORDEN_CADENA.map((n,i)=>({nombre:n,score:sc[i],estado:sc[i]>=8?'Sólido':sc[i]<=3?'Crítico':'A mejorar'}));
  ORDEN_CADENA.forEach((n,i)=>{ let rest=sc[i]; for(let k=0;k<3;k++){ const v=Math.min(3,Math.max(1,rest-(2-k))); rest-=v; d.respuestas.push({'eslabónNombre':n,pregunta:preguntas[k],letra:'B',respuesta:'Algunos sí, otros me agarran de sorpresa',score:v}); } });
  crearDeck(d); orig('caso',ci+1,'puntajes',sc.join('/'),'-> slides:',slideN);
});
orig(fuera.length? 'FUERA DE LA HOJA:\n'+[...new Set(fuera)].join('\n') : 'nada fuera de la hoja');
orig(logs.join('\n'));