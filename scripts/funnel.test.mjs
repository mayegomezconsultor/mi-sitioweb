import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';
async function fixture(t,extra={}){
 const dir=await mkdtemp(join(tmpdir(),'maye-funnel-'));const messages=[];const contacts=new Map();
 const mailRequest=async(path,method='GET',data)=>{
  if(path==='/emails'){messages.push(data);return{id:'fake-message'};}
  if(path==='/contacts'&&method==='POST'){contacts.set(data.email,data);return{id:'fake-contact'};}
  const email=decodeURIComponent(path.slice('/contacts/'.length));if(!contacts.has(email)){const e=Error('not_found');e.status=404;throw e;}
  if(method==='PATCH')Object.assign(contacts.get(email),data);return contacts.get(email);
 };
 const app=await createApp({dataDir:dir,apiKey:'mock-only',from:'Maye <maye@example.test>',origin:'http://example.test',address:'Test address',mailRequest,runWorker:false,...extra});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
 t.after(async()=>{app.close();await rm(dir,{recursive:true,force:true});});
 const post=(path,data)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://example.test'},body:JSON.stringify(data)});
 const signup=(kind='checklist',marketing=false)=>post('/api/subscribe',{name:'Ana',email:'ana@example.test',kind,consent:true,marketing,website:''});
 const token=()=>messages.at(-1).html.match(/token=([a-f0-9]{64})/)[1];
 return{...app,base,messages,contacts,post,signup,token};
}
test('download remains gated until explicit confirmation; resource-only has no marketing sequence',async t=>{
 const a=await fixture(t);assert.equal((await a.signup()).status,200);const token=a.token();assert.equal(a.db.prepare('SELECT count(*) n FROM subscribers').get().n,0);assert.equal((await fetch(a.base+'/api/download?token='+token)).status,403);
 await fetch(a.base+'/gracias.html?token='+token);assert.equal(a.db.prepare('SELECT confirmed FROM requests').get().confirmed,0);
 const result=await a.post('/api/confirm',{token});const data=await result.json();assert.equal(result.status,200);assert.equal((await fetch(a.base+data.download)).headers.get('content-type'),'application/pdf');
 await a.post('/api/confirm',{token});assert.equal(a.db.prepare('SELECT count(*) n FROM jobs').get().n,1);await a.runJobs();assert.equal(a.messages.length,2);assert.equal(a.contacts.size,0);
});
test('opt-in queues three follow-ups and unsubscribe cancels them, including Resend contact',async t=>{
 const a=await fixture(t);await a.signup('checklist',true);await a.post('/api/confirm',{token:a.token()});await a.runJobs();assert.equal(a.contacts.get('ana@example.test').unsubscribed,false);assert.equal(a.db.prepare('SELECT count(*) n FROM jobs WHERE marketing=1').get().n,3);
 const s=a.db.prepare('SELECT * FROM subscribers').get();const url=a.base+'/api/unsubscribe?token='+s.bearer;await fetch(url);assert.equal(a.db.prepare('SELECT unsub FROM subscribers').get().unsub,0);await fetch(url,{method:'POST'});await a.runJobs();assert.equal(a.contacts.get(s.email).unsubscribed,true);assert.equal(a.db.prepare('SELECT count(*) n FROM jobs WHERE marketing=1 AND sent=0').get().n,0);
});
test('newsletter welcome requires confirmed opt-in',async t=>{
 const a=await fixture(t);await a.signup('newsletter');await a.runJobs();assert.equal(a.messages.length,1);await a.post('/api/confirm',{token:a.token()});await a.runJobs();assert.equal(a.messages.length,2);assert.match(a.messages[1].subject,/Bienvenida/);
});
test('expired confirmation and wrong-origin requests are rejected; private files cannot be served',async t=>{
 const a=await fixture(t);await a.signup();const token=a.token();a.db.prepare('UPDATE requests SET created=?').run(Date.now()-3*86400000);assert.equal((await a.post('/api/confirm',{token})).status,400);
 assert.equal((await fetch(a.base+'/api/subscribe',{method:'POST',headers:{Origin:'https://unrelated.test','Content-Type':'application/json'},body:'{}'})).status,403);
 for(const path of ['/private/checklist-4-pilares.pdf','/.env','/server.mjs','/private/data/contacts.sqlite'])assert.equal((await fetch(a.base+path)).status,404);
});
test('provider failure never reports successful signup or stores an active subscriber',async t=>{
 const a=await fixture(t,{mailRequest:async()=>{throw Error('provider_unavailable');}});assert.equal((await a.signup()).status,502);assert.equal(a.db.prepare('SELECT count(*) n FROM subscribers').get().n,0);assert.equal(a.db.prepare('SELECT count(*) n FROM requests').get().n,0);
});
test('no configured sender means no simulated success',async t=>{const a=await fixture(t,{address:''});assert.equal((await a.signup()).status,503);});
