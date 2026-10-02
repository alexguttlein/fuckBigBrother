// Funciones auxiliares de fechas, formato y datos
export function pad(n,l){return String(n).padStart(l||2,'0')}
export function toLocal(iso){var d=new Date(iso);if(isNaN(d))return '';return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())}
export function fromLocal(v,old){if(!v)return old;if(toLocal(old)===v)return old;var d=new Date(v);return isNaN(d)?old:d.toISOString()}
export function fmt(ms){var neg=ms<0;ms=Math.abs(Math.round(ms/1000));var h=Math.floor(ms/3600),m=Math.floor(ms%3600/60),s=ms%60;return (neg?'-':'')+h+':'+pad(m)+':'+pad(s)}
export function dayKey(iso){var d=new Date(iso);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
export function dayLabel(k){var p=k.split('-');return new Date(p[0],p[1]-1,p[2]).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}
export function recalc(s){s.elapsedMs=Math.max(0,new Date(s.end)-new Date(s.start)-(s.pausedMs||0))}
export function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
export function uid(){return Date.now()+'_'+Math.random().toString(36).slice(2,9)}
