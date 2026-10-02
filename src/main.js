import './style.css';
import { pad, toLocal, fromLocal, fmt, dayKey, dayLabel, recalc, esc, uid } from './utils.js';

var D=null, ioMode='';
var $=function(id){return document.getElementById(id)};
function save(){try{localStorage.setItem('tt-draft',JSON.stringify(D))}catch(e){}}
function sorted(){return D.sessions.slice().sort(function(a,b){return new Date(a.start)-new Date(b.start)})}

function render(){
  var app=$('app');
  if(!D){app.innerHTML='<div class="panel empty">Abrí tu archivo JSON o pegá su contenido para empezar.</div>';return}
  var ss=sorted(),h='';
  h+='<div class="panel meta"><div><label>Persona</label><input data-top="person" value="'+esc(D.person)+'"></div><div><label>Ticket actual</label><input data-top="ticket" value="'+esc(D.ticket)+'"></div><div><label>Notas actuales</label><input data-top="notes" value="'+esc(D.notes)+'"></div></div>';
  if(D.active)h+='<div class="panel" style="color:var(--warn)">Hay una tarea activa en el archivo (campo "active"). Se conserva sin cambios.</div>';
  var total=0,days={},order=[];
  ss.forEach(function(s){var k=dayKey(s.start);if(!days[k]){days[k]=[];order.push(k)}days[k].push(s);total+=s.elapsedMs||0});
  h+='<div class="note">'+ss.length+' sesiones · total '+fmt(total)+'</div>';
  order.forEach(function(k){
    var sum=days[k].reduce(function(a,s){return a+(s.elapsedMs||0)},0);
    h+='<div class="day"><div>'+dayLabel(k)+'</div><span>'+fmt(sum)+'</span></div><div class="wrap">';
    h+='<div class="row head"><div>Inicio</div><div>Fin</div><div>Ticket</div><div>Notas</div><div>Pausa (min)</div><div style="text-align:right">Duración</div><div></div></div>';
    days[k].forEach(function(s,i){
      var prev=days[k][i-1],bad=new Date(s.end)<=new Date(s.start);
      if(prev){
        var g=new Date(s.start)-new Date(prev.end);
        if(g>1000)h+='<div class="gap">Hueco de '+fmt(g)+' sin registrar <button class="sm" data-act="fillgap" data-id="'+prev.id+'" data-next="'+s.id+'">Extender la anterior hasta acá</button></div>';
        else if(g<-1000)h+='<div class="gap ov">Solapamiento de '+fmt(-g)+' <button class="sm" data-act="fillgap" data-id="'+prev.id+'" data-next="'+s.id+'">Cortar la anterior donde empieza esta</button></div>';
      }
      h+='<div class="row'+(bad?' bad':'')+'" data-id="'+s.id+'">'
       +'<input type="datetime-local" step="1" data-f="start" value="'+toLocal(s.start)+'">'
       +'<input type="datetime-local" step="1" data-f="end" value="'+toLocal(s.end)+'">'
       +'<input list="tickets" data-f="ticket" value="'+esc(s.ticket)+'">'
       +'<input list="notesList" data-f="notes" value="'+esc(s.notes)+'">'
       +'<input type="number" min="0" step="0.1" data-f="paused" value="'+Math.round((s.pausedMs||0)/600)/100+'">'
       +'<div class="dur">'+fmt(s.elapsedMs)+'</div>'
       +'<div class="acts"><button class="sm" title="Duplicar" data-act="dup">⧉</button><button class="sm" title="Eliminar" data-act="del">✕</button></div></div>';
    });
    h+='</div>';
  });
  app.innerHTML=h;
  var t={},n={};D.sessions.forEach(function(s){t[s.ticket]=1;n[s.notes]=1});
  $('tickets').innerHTML=Object.keys(t).map(function(x){return '<option value="'+esc(x)+'">'}).join('');
  $('notesList').innerHTML=Object.keys(n).map(function(x){return '<option value="'+esc(x)+'">'}).join('');
}
function find(id){return D.sessions.filter(function(s){return s.id===id})[0]}

$('app').addEventListener('change',function(e){
  var el=e.target,top=el.getAttribute('data-top'),f=el.getAttribute('data-f');
  if(top){D[top]=el.value;save();return}
  if(!f)return;
  var s=find(el.closest('.row').getAttribute('data-id'));
  if(f==='start'||f==='end')s[f]=fromLocal(el.value,s[f]);
  else if(f==='paused')s.pausedMs=Math.round((parseFloat(el.value)||0)*60000);
  else s[f]=el.value;
  recalc(s);save();render();
});
$('app').addEventListener('click',function(e){
  var b=e.target.closest('button[data-act]');if(!b)return;
  var a=b.getAttribute('data-act'),id=b.getAttribute('data-id')||b.closest('.row').getAttribute('data-id'),s=find(id);
  if(a==='del'){if(!confirm('¿Eliminar esta sesión?'))return;D.sessions=D.sessions.filter(function(x){return x.id!==id})}
  if(a==='dup'){var c=JSON.parse(JSON.stringify(s));c.id=uid();D.sessions.push(c)}
  if(a==='fillgap'){var nx=find(b.getAttribute('data-next'));s.end=nx.start;recalc(s)}
  save();render();
});

function load(text){
  try{
    var j=JSON.parse(text);
    if(!j||!Array.isArray(j.sessions))throw new Error('No encontré la lista "sessions".');
    j.sessions.forEach(function(s){if(!s.id)s.id=uid();if(s.pausedMs==null)s.pausedMs=0});
    D=j;save();render();$('status').textContent='Cargado: '+j.sessions.length+' sesiones';return true;
  }catch(err){$('ioMsg').textContent='JSON inválido: '+err.message;$('status').textContent='JSON inválido: '+err.message;return false}
}
function openIO(mode){
  ioMode=mode;$('io').hidden=false;$('ioMsg').textContent='';
  $('ioOk').textContent=mode==='paste'?'Cargar':'Actualizar texto';
  $('ioCopy').hidden=$('ioDl').hidden=mode==='paste';
  if(mode==='paste')$('ta').value='';
  else{D.exportedAt=new Date().toISOString();$('ta').value=JSON.stringify(D,null,2);$('ioMsg').textContent='Copialo y pegalo en tu archivo, o descargalo.'}
  $('ta').focus();
}
$('paste').onclick=function(){openIO('paste')};
$('export').onclick=function(){if(!D){$('status').textContent='Primero cargá un JSON.';return}openIO('export')};
$('ioClose').onclick=function(){$('io').hidden=true};
$('ioOk').onclick=function(){if(ioMode==='paste'){if(load($('ta').value))$('io').hidden=true}else openIO('export')};
$('ioCopy').onclick=function(){
  $('ta').select();var ok=false;
  try{ok=document.execCommand('copy')}catch(e){}
  $('ioMsg').textContent=ok?'Copiado al portapapeles.':'No pude copiar automáticamente; el texto quedó seleccionado, usá Ctrl+C.';
};
$('ioDl').onclick=function(){
  try{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('ta').value],{type:'application/json'}));a.download='timetracker-editado.json';document.body.appendChild(a);a.click();a.remove();$('ioMsg').textContent='Descarga iniciada. Si no aparece, usá Copiar.'}
  catch(e){$('ioMsg').textContent='La descarga no está disponible acá; usá Copiar.'}
};
$('file').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){load(r.result)};r.readAsText(f)};
function openNew(){
  if(!D){$('status').textContent='Primero cargá un JSON.';return}
  $('newp').hidden=false;$('nMsg').textContent='';
  if(!$('nFrom').value)$('nFrom').value=dayKey(new Date().toISOString());
  $('nStart').focus();
}
$('add').onclick=openNew;
$('nCancel').onclick=function(){$('newp').hidden=true};
$('nOk').onclick=function(){
  var f=$('nFrom').value,t=$('nTo').value||f,a=$('nStart').value,b=$('nEnd').value,msg=$('nMsg');
  if(!f||!a||!b){msg.textContent='Completá fecha, hora de inicio y hora de fin.';return}
  if(t<f){msg.textContent='"Hasta" no puede ser anterior a la fecha de inicio.';return}
  if(b<=a){msg.textContent='La hora de fin debe ser posterior a la de inicio.';return}
  var p=f.split('-'),q=t.split('-'),d=new Date(p[0],p[1]-1,p[2]),last=new Date(q[0],q[1]-1,q[2]);
  if((last-d)/864e5>366){msg.textContent='El rango es demasiado largo (máximo un año).';return}
  var ha=a.split(':'),hb=b.split(':'),pause=Math.round((parseFloat($('nPause').value)||0)*60000),n=0,skip=0,ex={};
  D.sessions.forEach(function(s){ex[s.start.slice(0,16)]=1});
  while(d<=last){
    var wd=d.getDay();
    if(!($('nWk').checked&&(wd===0||wd===6))){
      var rs=function(){return Math.floor(Math.random()*60)},rm=function(){return Math.floor(Math.random()*1000)};
      var st=new Date(d.getFullYear(),d.getMonth(),d.getDate(),ha[0],ha[1],rs(),rm()),en=new Date(d.getFullYear(),d.getMonth(),d.getDate(),hb[0],hb[1],rs(),rm()),si=st.toISOString();
      if(ex[si.slice(0,16)])skip++;
      else{var s={id:uid(),person:D.person||'',ticket:$('nTicket').value,notes:$('nNotes').value,start:si,end:en.toISOString(),elapsedMs:0,pausedMs:pause};recalc(s);D.sessions.push(s);n++}
    }
    d.setDate(d.getDate()+1);
  }
  save();render();
  msg.textContent='Se agregaron '+n+(n===1?' sesión':' sesiones')+(skip?' ('+skip+' ya existían con ese inicio y se omitieron)':'')+'.';
};
(function(){try{var t=localStorage.getItem('tt-draft');if(t){D=JSON.parse(t);$('status').textContent='Recuperé tu último borrador local.'}}catch(e){}render()})();
