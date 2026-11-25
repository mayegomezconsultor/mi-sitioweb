import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const hash=s=>createHash('sha256').update(s).digest('hex');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=86400000;
export async function createApp(options={}) {
 const dataDir=options.dataDir||resolve(ROOT,'private/data');await mkdir(dataDir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(resolve(dataDir,'contacts.sqlite'));db.exec('PRAGMA journal_mode=WAL;');
 db.exec(`CREATE TABLE IF NOT EXISTS requests(token TEXT PRIMARY KEY,email TEXT,name TEXT,kind TEXT,marketing INTEGER,created INTEGER,confirmed INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS subscribers(email TEXT PRIMARY KEY,name TEXT,marketing INTEGER DEFAULT 0,unsub INTEGER DEFAULT 0,bearer TEXT,sync INTEGER DEFAULT 0,created INTEGER,consent_at INTEGER,consent_version TEXT);
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,email TEXT,kind TEXT,due INTEGER,sent INTEGER DEFAULT 0,attempts INTEGER DEFAULT 0,error TEXT,marketing INTEGER DEFAULT 0);`);
 const origin=options.origin||process.env.SITE_URL||'';const key=options.apiKey||process.env.RESEND_API_KEY||'';const from=options.from||process.env.MAIL_FROM||'';const address=options.address||process.env.CONTACT_POSTAL_ADDRESS||'';
 const ready=!!(origin&&key&&from&&address);const rates=new Map();
 const mailRequest=options.mailRequest|| (async(path,method='GET',body,idempotency)=>{
  const response=await fetch('https://api.resend.com'+path,{method,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json',...(idempotency?{'Idempotency-Key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
  const data=await response.json();if(!response.ok){const error=new Error('provider_'+response.status);error.status=response.status;throw error;}return data;
 });
 const page=(title,content)=>`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Maye Gómez</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/growth.css"><main class="section-wrap confirmation-page"><h1>${title}</h1>${content}<a class="text-link" href="/">Volver al sitio →</a></main></html>`;
 function envelope(name,heading,paragraphs,link,label,unsubscribe){return `<div style="font-family:Arial,sans-serif;color:#233c46;max-width:580px;margin:30px auto;line-height:1.8"><p style="color:#004b5f">MAYE GÓMEZ · CONSULTORA DE EMPRESAS</p><h1 style="font-family:Georgia,serif;color:#004b5f;font-size:30px">${heading}</h1><p>Hola ${esc(name)},</p>${paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}<p><a href="${esc(link)}" style="display:inline-block;background:#edccc6;color:#19333d;padding:12px 20px;border-radius:24px;text-decoration:none">${label}</a></p><p>Maye Gómez</p>${unsubscribe?`<p style="font-size:12px;color:#52666e">${esc(address)}<br><a href="${esc(unsubscribe)}">Dejar de recibir estos correos</a></p>`:''}</div>`;}
 async function send(email,subject,html,id,unsub){return mailRequest('/emails','POST',{from,to:[email],subject,html,...(process.env.MAIL_REPLY_TO?{reply_to:process.env.MAIL_REPLY_TO}:{}),...(unsub?{headers:{'List-Unsubscribe':`<${unsub}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}:{})},id);}
 function queue(id,email,kind,due,marketing){db.prepare('INSERT OR IGNORE INTO jobs(id,email,kind,due,marketing) VALUES(?,?,?,?,?)').run(id,email,kind,due,marketing?1:0);}
 let running=false;
 async function runJobs(){
  if(running||!ready)return;running=true;
  try{
   for(const s of db.prepare('SELECT * FROM subscribers WHERE sync=1 LIMIT 10').all()){
    try{
     let contact;try{contact=await mailRequest('/contacts/'+encodeURIComponent(s.email));}catch(e){if(e.status!==404)throw e;}
     if(contact)await mailRequest('/contacts/'+encodeURIComponent(s.email),'PATCH',{unsubscribed:!!s.unsub});
     else if(s.marketing&&!s.unsub)await mailRequest('/contacts','POST',{email:s.email,first_name:s.name,unsubscribed:false});
     db.prepare('UPDATE subscribers SET sync=0 WHERE email=?').run(s.email);
    }catch(e){console.error('Contact sync pending:',e.message);}
   }
   for(const job of db.prepare('SELECT * FROM jobs WHERE sent=0 AND attempts<6 AND due<=? ORDER BY due LIMIT 8').all(Date.now())){
    const s=db.prepare('SELECT * FROM subscribers WHERE email=?').get(job.email);
    if(!s || (job.marketing&&(!s.marketing||s.unsub))){db.prepare('UPDATE jobs SET sent=-1 WHERE id=?').run(job.id);continue;}
    if(job.marketing&&s.sync)continue;
    try{
     if(job.marketing){const contact=await mailRequest('/contacts/'+encodeURIComponent(s.email));if(contact.unsubscribed){db.prepare('UPDATE subscribers SET unsub=1,marketing=0 WHERE email=?').run(s.email);db.prepare('UPDATE jobs SET sent=-1 WHERE email=? AND marketing=1 AND sent=0').run(s.email);continue;}}
     const unsub=origin+'/api/unsubscribe?token='+s.bearer;let subject,paras,link,label;
     if(job.kind==='delivery'){
      // Confirmed subscribers receive a download link separate from the confirmation token.
      subject='Tu checklist de los 4 pilares';paras=['Ya puedes revisar tu negocio con las 16 preguntas de la checklist. Marca lo que existe, lo que está a medias y lo que necesita orden.','No necesitas resolver todo a la vez. Al terminar, elige una prioridad concreta para esta semana.'];link=origin+'/api/download?access='+s.bearer;label='Descargar la checklist';
     }else if(job.kind==='welcome'){subject='Bienvenida a las cartas de Maye';paras=['Gracias por abrir este espacio para mirar tu empresa con más claridad. Aquí compartiré ideas y herramientas sobre personas, clientes, dinero y operaciones.','Para empezar: piensa en la pregunta que tu equipo te hace con más frecuencia. Puede señalar un conocimiento que merece quedar documentado.'];link=origin+'/#soluciones';label='Conocer las rutas';}
     else if(job.kind==='day2'){subject='Elige una tarea que hoy dependa de tu memoria';paras=['Mira las respuestas que marcaste como «A medias» o «Pendiente». Elige una tarea frecuente que otra persona necesite aprender.','Escribe su objetivo, tres pasos esenciales y cómo se comprueba que quedó bien. Compártelo con quien hace esa tarea y escucha qué falta.'];link=origin+'/servicios/sistema-4-pilares.html';label='Conocer el sistema de 4 pilares';}
     else if(job.kind==='day5'){subject='Un documento ayuda cuando el equipo sabe usarlo';paras=['La documentación necesita una ruta para llegar a las personas. Elige uno de los recursos de tu empresa y pregunta quién debe consultarlo, en qué momento y cómo aprende a usarlo.','Si incorporar a alguien exige repetir las mismas explicaciones, puede ser momento de conectar roles, procesos y formación.'];link=origin+'/servicios/gestion-personal.html';label='Explorar gestión de personal';}
     else {subject='¿Qué prioridad elegiste para tu empresa?';paras=['Ya revisaste los cuatro pilares y elegiste un punto de partida. Ahora puedes decidir si avanzar con una mejora interna o conversar sobre el acompañamiento que necesitas.','Si quieres que lo veamos juntas, cuéntame qué está pasando en tu empresa y qué te gustaría ordenar primero. El alcance y la inversión se definen contigo.'];link='https://wa.me/584124784922?text='+encodeURIComponent('Hola Maye, hice la checklist y quiero conversar sobre mi prioridad.');label='Conversar con Maye';}
     await send(s.email,subject,envelope(s.name,subject,paras,link,label,unsub),'maye-'+job.id,unsub);db.prepare('UPDATE jobs SET sent=?,error=NULL WHERE id=?').run(Date.now(),job.id);
    }catch(e){db.prepare('UPDATE jobs SET attempts=attempts+1,due=?,error=? WHERE id=?').run(Date.now()+Math.min(3600000,60000*2**job.attempts),e.message,job.id);console.error('Email pending:',e.message);}
   }
   db.prepare('DELETE FROM requests WHERE confirmed=0 AND created<?').run(Date.now()-2*DAY);
  }finally{running=false;}
 }
 const server=http.createServer(async(req,res)=>{
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  const html=(status,body)=>{res.writeHead(status,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body);};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname.startsWith('/api/')){
    const ip=req.socket.remoteAddress;const now=Date.now();for(const [k,v]of rates)if(v.until<now)rates.delete(k);const rate=rates.get(ip)||{n:0,until:now+60000};rate.n++;rates.set(ip,rate);if(rate.n>40)return json(429,{error:'rate'});
    if(url.pathname==='/api/download'&&req.method==='GET'){
     const access=url.searchParams.get('access');const token=url.searchParams.get('token');
     const allowed=access?db.prepare("SELECT 1 FROM subscribers s JOIN requests r ON s.email=r.email WHERE s.bearer=? AND r.confirmed>0 AND r.kind='checklist'").get(access):token?db.prepare("SELECT 1 FROM requests WHERE token=? AND confirmed>0 AND kind='checklist'").get(hash(token)):null;
     if(!allowed)return html(403,page('Solicita tu checklist','<p>Confirma tu correo desde el formulario de descarga gratuita.</p>'));
     const pdf=await readFile(resolve(ROOT,'private/checklist-4-pilares.pdf'));res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Checklist-4-pilares-Maye-Gomez.pdf"','Cache-Control':'private, no-store'});return res.end(pdf);
    }
    if(url.pathname==='/api/unsubscribe'){
     const token=url.searchParams.get('token');const s=token&&db.prepare('SELECT * FROM subscribers WHERE bearer=?').get(token);if(!s)return html(400,page('Enlace no válido','<p>Usa el enlace incluido en tu correo.</p>'));
     if(req.method==='GET')return html(200,page('Cancelar los correos',`<p>Confirma si quieres dejar de recibir las comunicaciones de Maye.</p><form method="post" action="/api/unsubscribe?token=${esc(token)}"><button class="button button-primary">Confirmar mi baja</button></form>`));
     if(req.method==='POST'){db.prepare('UPDATE subscribers SET unsub=1,marketing=0,sync=1 WHERE email=?').run(s.email);db.prepare('UPDATE jobs SET sent=-1 WHERE email=? AND marketing=1 AND sent=0').run(s.email);return html(200,page('Tu baja está registrada','<p>Ya no recibirás correos de seguimiento ni newsletter desde este sitio.</p>'));}
    }
    if(req.method!=='POST')return json(405,{error:'method'});
    if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'origin'});
    if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'content_type'});
    let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>6000)return json(413,{error:'too_large'});}
    let body;try{body=JSON.parse(raw);}catch{return json(400,{error:'invalid_json'});}
    if(url.pathname==='/api/subscribe'){
     if(!ready)return json(503,{error:'unavailable'});
     const name=String(body.name||'').trim();const email=String(body.email||'').trim().toLowerCase();
     if(body.website)return json(400,{error:'invalid'});
     if(!name||name.length>80||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||body.consent!==true||!['newsletter','checklist'].includes(body.kind))return json(400,{error:'invalid'});
     if(db.prepare('SELECT COUNT(*) AS n FROM requests WHERE email=? AND created>?').get(email,Date.now()-3600000).n>=3)return json(429,{error:'rate'});
     const token=randomBytes(32).toString('hex');const digest=hash(token);db.prepare('INSERT INTO requests(token,email,name,kind,marketing,created) VALUES(?,?,?,?,?,?)').run(digest,email,name,body.kind,(body.kind==='newsletter'||body.marketing===true)?1:0,Date.now());
     try{await send(email,'Confirma tu solicitud a Maye Gómez',envelope(name,'Un paso para confirmar tu correo',[body.kind==='checklist'?'Pediste la checklist gratuita de los cuatro pilares. Confirma tu correo para acceder a ella.':'Pediste recibir las cartas de Maye. Confirma tu correo para activar tu suscripción.','Si no hiciste esta solicitud, puedes ignorar este mensaje. El enlace caduca en 48 horas.'],origin+'/gracias.html?token='+token,'Confirmar mi correo'),'confirm-'+digest);}catch(e){db.prepare('DELETE FROM requests WHERE token=?').run(digest);return json(502,{error:'delivery'});}
     return json(200,{ok:true});
    }
    if(url.pathname==='/api/confirm'){
     if(!ready)return json(503,{error:'unavailable'});
     if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))return json(400,{error:'invalid'});
     const p=db.prepare('SELECT * FROM requests WHERE token=?').get(hash(body.token));if(!p||(!p.confirmed&&p.created<Date.now()-2*DAY))return json(400,{error:'expired'});
     if(!p.confirmed){
      const existing=db.prepare('SELECT * FROM subscribers WHERE email=?').get(p.email);const now=Date.now();
      db.exec('BEGIN');try{
       if(!existing)db.prepare('INSERT INTO subscribers(email,name,marketing,bearer,sync,created,consent_at,consent_version) VALUES(?,?,?,?,?,?,?,?)').run(p.email,p.name,p.marketing,randomBytes(32).toString('hex'),p.marketing,now,now,'2026-11-v1');
       else if(p.marketing)db.prepare('UPDATE subscribers SET name=?,marketing=1,unsub=0,sync=1,consent_at=?,consent_version=? WHERE email=?').run(p.name,now,'2026-11-v1',p.email);
       db.prepare('UPDATE requests SET confirmed=? WHERE token=?').run(now,p.token);
       const id=hash(p.email).slice(0,24);queue(p.token+'-delivery',p.email,p.kind==='checklist'?'delivery':'welcome',now,p.kind!=='checklist');
       if(p.kind==='checklist'&&p.marketing)for(const [kind,days]of [['day2',2],['day5',5],['day8',8]])queue(id+'-'+kind+'-v1',p.email,kind,now+days*DAY,true);
       db.exec('COMMIT');
      }catch(e){db.exec('ROLLBACK');throw e;}
     }
     return json(200,{ok:true,download:p.kind==='checklist'?'/api/download?token='+encodeURIComponent(body.token):null});
    }
    return json(404,{error:'not_found'});
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
   let path=decodeURIComponent(url.pathname);if(path==='/')path='/index.html';
   const publicFile=['/index.html','/gracias.html','/privacidad.html','/styles.css','/growth.css','/solutions.css','/script.js','/growth.js','/solutions.js'].includes(path)||/^\/servicios\/[a-z0-9-]+\.html$/.test(path)||/^\/assets\/[a-zA-Z0-9-]+\.(png|svg|jpg|webp)$/.test(path)||path==='/propuestas/assets/logo-maye-gomez.png';
   if(!publicFile){res.writeHead(404);return res.end('No encontrado');}
   const file=await readFile(resolve(ROOT,'.'+path));const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'}[extname(path)];res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:file);
  }catch(e){if(e.code==='ENOENT'){res.writeHead(404);res.end('No encontrado');}else{console.error('Request failed:',e.message);if(!res.headersSent)res.writeHead(500,{'Content-Type':'application/json'});res.end('{"error":"unavailable"}');}}
 });
 const timer=options.runWorker===false?null:setInterval(()=>void runJobs(),30000);timer?.unref();
 return {server,db,runJobs,close:()=>{if(timer)clearInterval(timer);server.close();db.close();},ready};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=await createApp();const port=Number(process.env.PORT||4173);app.server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Maye web: http://127.0.0.1:${port} · email ${app.ready?'configured':'pending configuration'}`));
}
