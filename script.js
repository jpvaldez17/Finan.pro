'use strict';
const $=s=>document.querySelector(s);
const CATS={'Alimentación':['🍽️','#E88A19'],'Transporte':['🚌','#2670CE'],'Educación':['🎓','#3D9297'],'Vivienda':['🏠','#92704F'],'Salud':['❤️','#C52B40'],'Compras':['🛍️','#7B5EA7'],'Entretenimiento':['🎮','#18A66A'],'Servicios':['💡','#316D73'],'Suscripciones':['📺','#D0527A'],'Otros':['📦','#8A97A0']};
const ICATS=['Salario','Negocios','Trabajos independientes','Becas','Devoluciones','Otros'];
const TYPES={gasto:'Gasto',ingreso:'Ingreso',transferencia:'Transferencia',prestamo:'Préstamo',devolucion:'Devolución',reembolso:'Reembolso'};
const IN=['ingreso','devolucion','reembolso'],OUT=['gasto','prestamo'];
const METHODS=['Efectivo','Tarjeta de débito','Tarjeta de crédito','QR','Transferencia','Otros'];
const sv=p=>`<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS={inicio:sv('<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>'),mov:sv('<path d="M7 4h10v16l-2.5-1.8L12 20l-2.5-1.8L7 20z"/><path d="M10 9h4M10 13h4"/>'),stats:sv('<path d="M5 20V11M12 20V4M19 20v-6"/>'),metas:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>'),mas:sv('<path d="M5 7h14M5 12h14M5 17h14"/>'),eye:sv('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),eyeoff:sv('<path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>')};
const NAVS=[['inicio','inicio','Inicio','#316D73'],['mov','mov','Movimientos','#C52B40'],['stats','stats','Estadísticas','#2670CE'],['metas','metas','Metas','#18A66A'],['mas','mas','Más','#92704F']];
let hide=localStorage.getItem('fp_hide')==='1',hr=30;
const mny=n=>hide?'Bs •••':fmt(n);
function toggleHide(){hide=!hide;localStorage.setItem('fp_hide',hide?'1':'0');render()}window.toggleHide=toggleHide;
const SMALL=20;
let S,tab='inicio',per='month',charts=[],q={t:'',type:'',cat:''};
/* ---------- IndexedDB ---------- */
const dbp=new Promise(r=>{const o=indexedDB.open('finanpro',1);o.onupgradeneeded=()=>o.result.createObjectStore('kv');o.onsuccess=()=>r(o.result)});
async function kv(m,v){const d=await dbp;return new Promise(r=>{const st=d.transaction('kv',m?'readwrite':'readonly').objectStore('kv');const x=m?st.put(v,'state'):st.get('state');x.onsuccess=()=>r(x.result)})}
const save=()=>kv(1,S);
/* ---------- utilidades ---------- */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmt=n=>'Bs '+(+n||0).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(t){const e=$('#toast');e.textContent=t;e.className='s';setTimeout(()=>e.className='',3200)}
function range(p){const n=new Date(),s=new Date(n.getFullYear(),n.getMonth(),n.getDate());
 if(p==='today');else if(p==='week')s.setDate(s.getDate()-((s.getDay()+6)%7));else if(p==='month')s.setDate(1);
 else if(p==='3m'){s.setDate(1);s.setMonth(s.getMonth()-2)}else if(p==='year'){s.setMonth(0,1)}
 return [s,new Date(n.getFullYear(),n.getMonth(),n.getDate()+1)]}
const inR=(m,[a,b])=>{const d=new Date(m.date);return d>=a&&d<b};
const sum=(l,f)=>l.filter(f).reduce((a,m)=>a+m.amount,0);
const exp=l=>l.filter(m=>m.type==='gasto'),inc=l=>l.filter(m=>m.type==='ingreso');
function bal(a){let b=a.initial;S.moves.forEach(m=>{if(m.acc===a.id){if(IN.includes(m.type))b+=m.amount;else b-=m.amount}if(m.type==='transferencia'&&m.acc2===a.id)b+=m.amount});return b}
const cinfo=c=>CATS[c]||['💰','#18A66A'];
/* ---------- demo ---------- */
function demo(){const mv=[],now=new Date();let s=7;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
 const G=[['Pasaje','Transporte',2],['Refresco','Alimentación',5],['Desayuno','Alimentación',10],['Fotocopias','Educación',3],['Taxi','Transporte',15],['Almuerzo','Alimentación',18],['Cine','Entretenimiento',35],['Internet','Servicios',90],['Medicina','Salud',40],['Ropa','Compras',120]];
 for(let i=89;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i,9+Math.floor(rnd()*10));
  for(let k=0;k<1+Math.floor(rnd()*3);k++){const g=G[Math.floor(rnd()*G.length)];mv.push({id:uid(),type:'gasto',amount:g[2],desc:g[0],cat:g[1],date:d.toISOString(),method:'Efectivo',acc:'a1',demo:1})}
  if(d.getDate()===1||d.getDate()===15)mv.push({id:uid(),type:'ingreso',amount:1500,desc:'Pago quincenal',cat:'Salario',date:d.toISOString(),method:'Transferencia',acc:'a2',demo:1})}
 return {accounts:[{id:'a1',name:'Efectivo',initial:200},{id:'a2',name:'Banco',initial:500},{id:'a3',name:'Caja de ahorros',initial:300}],moves:mv,budgets:{'Alimentación':600,'Transporte':250},goals:[{id:uid(),name:'Computadora',target:6000,saved:1500,date:'2027-06-30',hist:[{d:dkey(now),a:1500}],demo:1}],demo:true}}
function empty(){return {accounts:[{id:'a1',name:'Efectivo',initial:0},{id:'a2',name:'Banco',initial:0},{id:'a3',name:'Caja de ahorros',initial:0}],moves:[],budgets:{},goals:[],demo:false}}
/* ---------- navegación ---------- */
function go(t){tab=t;render()}window.go=go;
function render(){charts.forEach(c=>c.destroy());charts=[];
 $('#nav').innerHTML=NAVS.map(n=>`<button class="${tab===n[0]?'on':''}" style="--c:${n[3]}" onclick="go('${n[0]}')"><span>${ICONS[n[1]]}</span>${n[2]}</button>`).join('');
 ({inicio:vInicio,mov:vMov,stats:vStats,metas:vMetas,mas:vMas})[tab]();window.scrollTo(0,0)}
const perSel=()=>`<select onchange="per=this.value;render()">${[['today','Hoy'],['week','Esta semana'],['month','Este mes'],['3m','Últimos 3 meses'],['year','Este año']].map(p=>`<option value="${p[0]}" ${per===p[0]?'selected':''}>${p[1]}</option>`).join('')}</select>`;
const movRow=m=>{const[i,c]=cinfo(m.cat),a=S.accounts.find(x=>x.id===m.acc);const pos=IN.includes(m.type);
 return `<div class="row"><div class="dot" style="background:${c}">${i}</div><div class="f"><b>${esc(m.desc||m.cat)}${m.demo?' <span class="chip">demo</span>':''}</b><span class="mu">${new Date(m.date).toLocaleString('es-BO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(a?.name)} · ${TYPES[m.type]}</span></div><b class="${m.type==='transferencia'?'bl':pos?'g':'r'}">${pos?'+':m.type==='transferencia'?'':'-'}${fmt(m.amount)}</b></div>`};
/* ---------- Inicio ---------- */
function vInicio(){const mr=range('month'),M=S.moves.filter(m=>inR(m,mr)),tr=range('today'),T=S.moves.filter(m=>inR(m,tr));
 const total=S.accounts.reduce((a,x)=>a+bal(x),0),ing=sum(inc(M),()=>1),gas=sum(exp(M),()=>1);
 const days=new Date().getDate(),pr=new Date(mr[0].getFullYear(),mr[0].getMonth()-1,1),pe=new Date(mr[0]),PM=S.moves.filter(m=>m.type==='gasto'&&new Date(m.date)>=pr&&new Date(m.date)<pe),pg=sum(PM,()=>1);
 const bc={};exp(M).forEach(m=>bc[m.cat]=(bc[m.cat]||0)+m.amount);const top=Object.entries(bc).sort((a,b)=>b[1]-a[1])[0];
 const sm=exp(M).filter(m=>m.amount<=SMALL),smw=sum(exp(S.moves.filter(m=>inR(m,range('week')))).filter(m=>m.amount<=SMALL),()=>1);
 const cash=S.accounts.find(a=>a.name==='Efectivo'),cashB=cash?bal(cash):0;
 $('#app').innerHTML=`${S.demo?`<div class="card" style="background:#fff3e0"><span class="chip">DATOS DE DEMOSTRACIÓN</span> <p class="mu">Estás viendo movimientos ficticios.</p><button class="btn sm" onclick="clearDemo()">Borrar demo y empezar vacío</button></div>`:''}
 <div class="grid"><div class="card hero"><div style="display:flex;justify-content:space-between;align-items:center"><div class="mu">Dinero total disponible</div><button class="eye" onclick="toggleHide()" aria-label="${hide?'Mostrar dinero':'Ocultar dinero'}">${hide?ICONS.eyeoff:ICONS.eye}</button></div><div class="big">${mny(total)}</div><div class="mu">Suma de todas tus cuentas</div></div>
 <div class="card"><div class="mu">⬆️ Ingresos del mes</div><div class="big g">${fmt(ing)}</div></div>
 <div class="card"><div class="mu">⬇️ Gastos del mes</div><div class="big r">${fmt(gas)}</div></div>
 <div class="card"><div class="mu">🐷 Ahorro del mes</div><div class="big ${ing-gas<0?'r':'g'}">${fmt(ing-gas)}</div></div>
 <div class="card"><div class="mu">💵 En efectivo</div><div class="big">${mny(cashB)}</div></div>
 <div class="card"><div class="mu">🏦 En cuentas</div><div class="big bl">${mny(total-cashB)}</div></div></div>
 <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3>Comportamiento del dinero</h3><div class="seg">${[7,30,90].map(d=>`<button class="${hr===d?'on':''}" onclick="hr=${d};render()">${d} d</button>`).join('')}</div></div><div class="mu">Saldo total día a día. Toca un punto.</div><div class="chart"><canvas id="ch"></canvas></div></div>
 <div class="card"><h3>Hoy y este mes</h3><div class="row"><div class="f">Gastos de hoy</div><b class="r">${fmt(sum(exp(T),()=>1))}</b></div>
 <div class="row"><div class="f">Promedio diario</div><b>${fmt(gas/days)}</b></div>
 <div class="row"><div class="f">Categoría con más gasto</div><b>${top?cinfo(top[0])[0]+' '+top[0]:'—'}</b></div>
 <div class="row"><div class="f">Vs. mes anterior</div><b class="${gas>pg?'r':'g'}">${pg?((gas-pg)/pg*100).toFixed(0)+'%':'—'}</b></div></div>
 <div class="card" style="border-left:6px solid var(--o)"><h3>Gastos pequeños (≤ Bs ${SMALL})</h3><div class="mu">Compras cotidianas acumuladas</div><div class="row"><div class="f">Esta semana</div><b>${fmt(smw)}</b></div><div class="row"><div class="f">Este mes (${gas?(sum(sm,()=>1)/gas*100).toFixed(0):0}% del gasto)</div><b>${fmt(sum(sm,()=>1))}</b></div></div>
 <div class="card"><h3>Últimos movimientos</h3>${S.moves.length?[...S.moves].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(movRow).join(''):'<p class="mu">Aún no registras nada. Toca + para empezar.</p>'}</div>`;homeChart()}
function homeChart(){const now=new Date(),days=[...Array(hr)].map((_,i)=>new Date(now.getFullYear(),now.getMonth(),now.getDate()-hr+1+i));
 const tot=S.accounts.reduce((a,x)=>a+bal(x),0),after=d=>S.moves.filter(m=>new Date(m.date)>=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)&&m.type!=='transferencia').reduce((a,m)=>a+(IN.includes(m.type)?m.amount:-m.amount),0);
 charts.push(new Chart($('#ch'),{type:'line',data:{labels:days.map(d=>d.getDate()+'/'+(d.getMonth()+1)),datasets:[{label:'Saldo',data:days.map(d=>tot-after(d)),borderColor:'#3D9297',backgroundColor:'#3D929733',fill:true,tension:.35,borderWidth:3,pointRadius:hr>30?0:3,pointHoverRadius:7}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:600},interaction:{intersect:false,mode:'index'},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>mny(c.raw)}}},scales:{x:{ticks:{maxTicksLimit:6},grid:{display:false}},y:{ticks:{display:!hide},grid:{color:'#0001'}}}}}))}
/* ---------- Movimientos ---------- */
function vMov(){let L=[...S.moves].sort((a,b)=>b.date.localeCompare(a.date)).filter(m=>(!q.type||m.type===q.type)&&(!q.cat||m.cat===q.cat)&&(!q.t||(m.desc+m.cat).toLowerCase().includes(q.t.toLowerCase())));
 let h='',last='';L.slice(0,150).forEach(m=>{const k=new Date(m.date).toLocaleDateString('es-BO',{month:'long',year:'numeric'});if(k!==last){h+=`<h3 style="margin-top:12px">${k}</h3>`;last=k}
  h+=`<div onclick="openForm('${m.id}')">${movRow(m)}</div>`});
 $('#app').innerHTML=`<h2>MOVIMIENTOS</h2><div class="card"><input placeholder="🔍 Buscar" value="${esc(q.t)}" oninput="q.t=this.value;clearTimeout(window._t);window._t=setTimeout(()=>{vMov();$('#app input').focus()},350)">
 <select onchange="q.type=this.value;render()"><option value="">Todos los tipos</option>${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${q.type===k?'selected':''}>${v}</option>`)}</select>
 <select onchange="q.cat=this.value;render()"><option value="">Todas las categorías</option>${[...Object.keys(CATS),...ICATS].filter((c,i,a)=>a.indexOf(c)===i).map(c=>`<option ${q.cat===c?'selected':''}>${c}</option>`)}</select>
 <button class="btn tq sm" onclick="csv()">Exportar CSV</button></div><div class="card">${h||'<p class="mu">Sin resultados.</p>'}<p class="mu">Toca un movimiento para editarlo o eliminarlo.</p></div>`}
/* ---------- Estadísticas ---------- */
function vStats(){$('#app').innerHTML=`<h2>ESTADÍSTICAS</h2>${perSel()}
 <div class="card"><h3>Ingresos vs gastos</h3><div class="mu">Últimos 6 meses. Toca una barra.</div><div class="chart"><canvas id="c1"></canvas></div></div>
 <div class="card"><h3>Distribución de gastos</h3><div class="mu">Del período seleccionado</div><div class="chart"><canvas id="c2"></canvas><div class="dc"><div><div class="mu">Total</div><b id="dct"></b></div></div></div></div>
 <div class="card"><h3>Evolución del saldo</h3><div class="mu">Últimos 30 días</div><div class="chart"><canvas id="c3"></canvas></div></div>
 <div class="card"><h3>Gastos diarios</h3><div class="mu">Los días más altos en rojo</div><div class="chart"><canvas id="c4"></canvas></div></div>`;
 const opt={responsive:true,maintainAspectRatio:false,animation:{duration:600}};
 const now=new Date(),ms=[...Array(6)].map((_,i)=>new Date(now.getFullYear(),now.getMonth()-5+i,1));
 const mt=(d,f)=>sum(S.moves,m=>{const x=new Date(m.date);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()&&m.type===f});
 charts.push(new Chart($('#c1'),{type:'bar',data:{labels:ms.map(d=>d.toLocaleDateString('es-BO',{month:'short'})),datasets:[{label:'Ingresos',data:ms.map(d=>mt(d,'ingreso')),backgroundColor:'#18A66A',borderRadius:8},{label:'Gastos',data:ms.map(d=>mt(d,'gasto')),backgroundColor:'#C52B40',borderRadius:8}]},options:{...opt,plugins:{tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmt(c.raw)}`}}}}}));
 const r=range(per),E=exp(S.moves.filter(m=>inR(m,r))),bc={};E.forEach(m=>bc[m.cat]=(bc[m.cat]||0)+m.amount);const ks=Object.keys(bc),tot=E.reduce((a,m)=>a+m.amount,0);$('#dct').textContent=fmt(tot);
 charts.push(new Chart($('#c2'),{type:'doughnut',data:{labels:ks,datasets:[{data:ks.map(k=>bc[k]),backgroundColor:ks.map(k=>cinfo(k)[1]),borderWidth:2}]},options:{...opt,cutout:'66%',plugins:{legend:{position:'bottom',labels:{boxWidth:12}},tooltip:{callbacks:{label:c=>`${c.label}: ${fmt(c.raw)} (${(c.raw/tot*100).toFixed(1)}%)`}}}}}));
 const days=[...Array(30)].map((_,i)=>new Date(now.getFullYear(),now.getMonth(),now.getDate()-29+i));let run=S.accounts.reduce((a,x)=>a+bal(x),0);
 const after=d=>S.moves.filter(m=>new Date(m.date)>=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)&&m.type!=='transferencia').reduce((a,m)=>a+(IN.includes(m.type)?m.amount:-m.amount),0);
 const sd=days.map(d=>run-after(d));
 charts.push(new Chart($('#c3'),{type:'line',data:{labels:days.map(d=>d.getDate()+'/'+(d.getMonth()+1)),datasets:[{label:'Saldo',data:sd,borderColor:'#3D9297',backgroundColor:'#3D929733',fill:true,tension:.35,pointRadius:3,pointHoverRadius:7}]},options:{...opt,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.raw)}}},scales:{x:{ticks:{maxTicksLimit:6}}}}}));
 const dd=days.map(d=>sum(exp(S.moves),m=>dkey(new Date(m.date))===dkey(d))),mx=Math.max(...dd);
 charts.push(new Chart($('#c4'),{type:'bar',data:{labels:days.map(d=>d.getDate()),datasets:[{data:dd,backgroundColor:dd.map(v=>v===mx&&v>0?'#C52B40':'#2670CE'),borderRadius:4}]},options:{...opt,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.raw)}}}}}))}
/* ---------- Metas ---------- */
function vMetas(){$('#app').innerHTML=`<h2>METAS DE AHORRO</h2>${S.goals.map(g=>{const p=Math.min(100,g.saved/g.target*100),mo=Math.max(1,Math.ceil((new Date(g.date)-new Date())/2.6e9));
 return `<div class="card"><h3>${esc(g.name)} ${g.demo?'<span class="chip">demo</span>':''}</h3><div class="mu">${fmt(g.saved)} de ${fmt(g.target)} · límite ${g.date}</div><div class="bar" style="margin:8px 0"><i style="width:${p}%;background:var(--g)"></i></div>
 <b>${p.toFixed(0)}%</b> <span class="mu">· Para llegar: ${fmt(Math.max(0,g.target-g.saved)/mo)} / mes</span><div style="margin-top:8px"><button class="btn g2 sm" onclick="contrib('${g.id}')">+ Aporte</button> <button class="btn sm" onclick="delGoal('${g.id}')">Eliminar</button></div>
 <div class="mu" style="margin-top:6px">Aportes: ${g.hist.slice(-5).map(h=>h.d+' '+fmt(h.a)).join(' · ')||'—'}</div></div>`}).join('')||'<p class="mu">Aún no tienes metas.</p>'}
<button class="btn" onclick="newGoal()">+ Nueva meta</button>`}
function newGoal(){dlg(`<h3>Nueva meta</h3><label>Nombre</label><input id="gn"><label>Cantidad objetivo (Bs)</label><input id="gt" type="number" step="0.01" min="0"><label>Fecha límite</label><input id="gd" type="date">`,()=>{const n=$('#gn').value.trim(),t=+$('#gt').value,d=$('#gd').value;if(!n||!(t>0)||!d)return toast('Completa nombre, objetivo y fecha');S.goals.push({id:uid(),name:n,target:t,saved:0,date:d,hist:[]});save();render()})}
function contrib(id){dlg(`<h3>Aporte</h3><label>Importe (Bs)</label><input id="ga" type="number" step="0.01" min="0">`,()=>{const a=+$('#ga').value;if(!(a>0))return toast('Importe inválido');const g=S.goals.find(x=>x.id===id);g.saved+=a;g.hist.push({d:dkey(new Date()),a});save();render()})}
function delGoal(id){if(confirm('¿Eliminar meta?')){S.goals=S.goals.filter(g=>g.id!==id);save();render()}}
/* ---------- Más ---------- */
function vMas(){const mr=range('month'),E=exp(S.moves.filter(m=>inR(m,mr))),bc={};E.forEach(m=>bc[m.cat]=(bc[m.cat]||0)+m.amount);
 $('#app').innerHTML=`<h2>MÁS</h2>
 <div class="card"><h3>🏦 Mis cuentas</h3>${S.accounts.map(a=>`<div class="row"><div class="f"><b>${esc(a.name)}</b><span class="mu">Saldo inicial ${fmt(a.initial)}</span></div><b>${fmt(bal(a))}</b><button class="btn sm" onclick="editAcc('${a.id}')">Editar</button></div>`).join('')}<button class="btn tq sm" onclick="editAcc()">+ Cuenta</button></div>
 <div class="card"><h3>📏 Presupuestos del mes</h3>${Object.keys(CATS).map(c=>{const l=S.budgets[c],g=bc[c]||0,p=l?g/l*100:0,col=p>=100?'#C52B40':p>=90?'#E88A19':p>=70?'#92704F':'#18A66A';
  return `<div style="margin:10px 0"><div class="row" style="border:0;padding:0"><div class="f">${cinfo(c)[0]} ${c} <span class="mu">${l?fmt(g)+' / '+fmt(l)+' · resta '+fmt(Math.max(0,l-g)):'sin límite'}</span></div><button class="btn sm" onclick="setBud('${c}')">Límite</button></div>${l?`<div class="bar"><i style="width:${Math.min(100,p)}%;background:${col}"></i></div><span class="mu">${p.toFixed(0)}%${p>=100?' · ¡límite superado!':p>=90?' · ¡alerta 90%!':p>=70?' · aviso 70%':''}</span>`:''}</div>`}).join('')}</div>
 <div class="card"><h3>🤖 Chat IA (local)</h3><div id="chat" class="mu" style="min-height:40px">Pregunta sobre tus datos: “¿cuánto gasté este mes?”, “¿en qué categoría gasto más?”, “gastos pequeños”, “¿qué días gasto más?”, “¿puedo ahorrar?”.</div><input id="cq" placeholder="Escribe tu pregunta" onkeydown="if(event.key==='Enter')ask()"><button class="btn sm" onclick="ask()">Preguntar</button></div>
 <div class="card"><h3>💾 Datos</h3><button class="btn sm" onclick="backup()">Exportar copia JSON</button> <button class="btn sm" onclick="$('#imp').click()">Importar JSON</button><input id="imp" type="file" accept=".json" hidden onchange="imp(this.files[0])"><br><br><button class="btn sm tq" onclick="csv()">Exportar CSV</button> ${S.demo?'<button class="btn sm" onclick="clearDemo()">Borrar datos demo</button>':''}<p class="mu">Todo se guarda solo en este dispositivo (IndexedDB). Sin bancos, sin credenciales.</p></div>`}
function setBud(c){dlg(`<h3>Límite mensual: ${c}</h3><label>Bs (0 para quitar)</label><input id="bv" type="number" step="0.01" min="0" value="${S.budgets[c]||''}">`,()=>{const v=+$('#bv').value;if(v>0)S.budgets[c]=v;else delete S.budgets[c];save();render()})}
function editAcc(id){const a=S.accounts.find(x=>x.id===id)||{name:'',initial:0};dlg(`<h3>${id?'Editar':'Nueva'} cuenta</h3><label>Nombre</label><input id="an" value="${esc(a.name)}"><label>Saldo inicial (Bs)</label><input id="ai" type="number" step="0.01" value="${a.initial}">`,()=>{const n=$('#an').value.trim();if(!n)return toast('Pon un nombre');if(id){a.name=n;a.initial=+$('#ai').value||0}else S.accounts.push({id:uid(),name:n,initial:+$('#ai').value||0});save();render()},id?()=>{if(S.moves.some(m=>m.acc===id||m.acc2===id))return toast('Tiene movimientos: no se puede eliminar');S.accounts=S.accounts.filter(x=>x.id!==id);save();render()}:null)}
/* ---------- Chat IA local (arquitectura lista para API vía proxy propio) ---------- */
function ask(){const t=$('#cq').value.toLowerCase();if(!t)return;const mr=range('month'),M=S.moves.filter(m=>inR(m,mr)),E=exp(M),g=sum(E,()=>1),i=sum(inc(M),()=>1);let a;
 const bc={};E.forEach(m=>bc[m.cat]=(bc[m.cat]||0)+m.amount);const top=Object.entries(bc).sort((x,y)=>y[1]-x[1]);
 if(!S.moves.length)a='Aún no hay movimientos registrados.';
 else if(/transporte|alimentaci|educaci|salud|compras|servicios|vivienda/.test(t)){const c=Object.keys(CATS).find(k=>t.includes(k.toLowerCase().slice(0,7)));a=`En ${c} gastaste ${fmt(bc[c]||0)} este mes.`}
 else if(/peque/.test(t)){const s=sum(E,m=>m.amount<=SMALL);a=`Tus gastos pequeños (≤ Bs ${SMALL}) suman ${fmt(s)} este mes: ${g?(s/g*100).toFixed(0):0}% de tu gasto.`}
 else if(/d[ií]a/.test(t)){const d={};exp(S.moves).forEach(m=>{const k=new Date(m.date).toLocaleDateString('es-BO',{weekday:'long'});d[k]=(d[k]||0)+m.amount});const e=Object.entries(d).sort((x,y)=>y[1]-x[1])[0];a=e?`El día de la semana con más gasto acumulado es ${e[0]} (${fmt(e[1])}).`:'Sin datos.'}
 else if(/categor/.test(t))a=top[0]?`Gastas más en ${top[0][0]}: ${fmt(top[0][1])} (${(top[0][1]/g*100).toFixed(0)}%).`:'Sin gastos este mes.';
 else if(/ahorr|organiz|ingres/.test(t))a=`Este mes ingresaste ${fmt(i)} y gastaste ${fmt(g)}. ${i>=g?`Ahorro actual: ${fmt(i-g)}.`:'Estás gastando más de lo que ingresas.'} ${top[0]?`Revisa ${top[0][0]}, tu mayor gasto.`:''}`;
 else a=`Este mes gastaste ${fmt(g)} e ingresaste ${fmt(i)}.`;
 $('#chat').innerHTML=`<b>Tú:</b> ${esc($('#cq').value)}<br><b>FinanPro:</b> ${esc(a)}`;$('#cq').value=''}
/* ---------- Formulario ---------- */
function dlg(html,ok,del){const d=$('#dlg');d.innerHTML=html+`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn g2" id="ok">Guardar</button><button class="btn tq" id="cx">Cancelar</button>${del?'<button class="btn" id="dl" style="background:var(--r)">Eliminar</button>':''}</div>`;
 $('#ok').onclick=()=>{if(ok()!==false)d.close()};$('#cx').onclick=()=>d.close();if(del)$('#dl').onclick=()=>{if(confirm('¿Eliminar?')){del();d.close()}};d.showModal()}
function openForm(id){const m=S.moves.find(x=>x.id===id)||{type:'gasto',amount:'',desc:'',cat:'Alimentación',date:new Date().toISOString(),method:'Efectivo',acc:S.accounts[0].id,acc2:S.accounts[1]?.id,note:''};
 const ld=new Date(new Date(m.date)-new Date(m.date).getTimezoneOffset()*6e4).toISOString().slice(0,16);
 const opts=a=>a.map(x=>`<option ${x===m.cat?'selected':''}>${x}</option>`).join('');
 const catList=()=>IN.includes($('#ft').value)?ICATS:Object.keys(CATS);
 dlg(`<h3>${id?'Editar':'Nuevo'} movimiento</h3><label>Tipo</label><select id="ft" onchange="$('#fc').innerHTML=(IN.includes(this.value)?ICATS:Object.keys(CATS)).map(c=>'<option>'+c+'</option>').join('');$('#f2').style.display=this.value==='transferencia'?'block':'none'">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${m.type===k?'selected':''}>${v}</option>`)}</select>
 <label>Importe (Bs)</label><input id="fa" type="number" inputmode="decimal" step="0.01" min="0.01" value="${m.amount}" placeholder="0,50"><label>Descripción</label><input id="fd" value="${esc(m.desc)}">
 <label>Categoría</label><select id="fc">${opts(IN.includes(m.type)?ICATS:Object.keys(CATS))}</select><label>Fecha y hora</label><input id="fx" type="datetime-local" value="${ld}">
 <label>Método de pago</label><select id="fm">${METHODS.map(x=>`<option ${x===m.method?'selected':''}>${x}</option>`)}</select>
 <label>Cuenta (origen)</label><select id="fo">${S.accounts.map(a=>`<option value="${a.id}" ${a.id===m.acc?'selected':''}>${esc(a.name)}</option>`)}</select>
 <div id="f2" style="display:${m.type==='transferencia'?'block':'none'}"><label>Cuenta destino</label><select id="fe">${S.accounts.map(a=>`<option value="${a.id}" ${a.id===m.acc2?'selected':''}>${esc(a.name)}</option>`)}</select></div>
 <label>Observaciones</label><textarea id="fn" rows="2">${esc(m.note||'')}</textarea>`,()=>{
  const a=+$('#fa').value.replace?.(',','.')||+$('#fa').value,t=$('#ft').value;if(!(a>0))return toast('Ingresa un importe mayor a 0'),false;
  if(t==='transferencia'&&$('#fo').value===$('#fe').value)return toast('Origen y destino deben ser distintos'),false;
  const n={id:m.id||uid(),type:t,amount:Math.round(a*100)/100,desc:$('#fd').value.trim(),cat:t==='transferencia'?'Transferencia':$('#fc').value,date:new Date($('#fx').value||Date.now()).toISOString(),method:$('#fm').value,acc:$('#fo').value,acc2:t==='transferencia'?$('#fe').value:null,note:$('#fn').value,demo:m.demo};
  if(id)S.moves[S.moves.findIndex(x=>x.id===id)]=n;else S.moves.push(n);save();render();budAlert(n)},id?()=>{S.moves=S.moves.filter(x=>x.id!==id);save();render()}:null)}
window.openForm=openForm;
function budAlert(m){if(m.type!=='gasto'||!S.budgets[m.cat])return;const E=sum(exp(S.moves.filter(x=>inR(x,range('month')))),x=>x.cat===m.cat),p=E/S.budgets[m.cat]*100;
 if(p>=100)toast(`⛔ ${m.cat}: superaste el presupuesto (${p.toFixed(0)}%)`);else if(p>=90)toast(`🟠 ${m.cat}: ya usaste ${p.toFixed(0)}%`);else if(p>=70)toast(`🟡 ${m.cat}: llevas ${p.toFixed(0)}%`)}
/* ---------- Exportar / importar ---------- */
function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
const backup=()=>dl('finanpro-copia.json',JSON.stringify(S),'application/json');
const csv=()=>dl('finanpro-movimientos.csv','Fecha,Tipo,Categoria,Descripcion,Importe,Metodo,Cuenta\n'+S.moves.map(m=>[m.date,TYPES[m.type],m.cat,'"'+(m.desc||'').replace(/"/g,'""')+'"',m.amount,m.method,S.accounts.find(a=>a.id===m.acc)?.name].join(',')).join('\n'),'text/csv');
function imp(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.accounts||!d.moves)throw 0;S=d;save();render();toast('Copia importada')}catch{toast('Archivo no válido')}};r.readAsText(f)}
function clearDemo(){if(!confirm('¿Borrar todos los datos de demostración?'))return;S.moves=S.moves.filter(m=>!m.demo);S.goals=S.goals.filter(g=>!g.demo);S.accounts.forEach(a=>a.initial=0);S.budgets={};S.demo=false;save();render()}
/* ---------- inicio ---------- */
(async()=>{S=await kv(0);if(!S){S=demo();await save()}render();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js')})();
