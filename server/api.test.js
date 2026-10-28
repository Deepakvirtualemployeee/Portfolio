import {test,after,before,mock} from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
process.env.NODE_ENV='test';
process.env.OPENAI_API_KEY='';
process.env.SMTP_HOST='';
process.env.EMAIL_PROVIDER='smtp';
process.env.RENDER='false';
const {app,cosine}=await import('./index.js');
process.env.EMAIL_USER='sender@example.com';
process.env.EMAIL_PASS='test-password';
process.env.CONTACT_TO='developer@example.com';
let server,base;
before(async()=>{server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`});
after(async()=>{await new Promise(r=>server.close(r));mock.restoreAll()});
test('vector similarity identifies matching direction',()=>{assert.equal(cosine([1,0],[1,0]),1);assert.equal(cosine([1,0],[0,1]),0)});
test('greetings receive a helpful welcome without requiring OpenAI',async()=>{const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'hi'})});assert.equal(r.status,200);const data=await r.json();assert.equal(data.mode,'greeting');assert.match(data.answer,/Welcome to Deepak/);assert.doesNotMatch(data.answer,/not configured/)});
test('public profile contains April 2021 career start',async()=>{const r=await fetch(base+'/api/profile');assert.equal(r.status,200);assert.equal((await r.json()).profile.start,'2021-04')});
test('invalid contact never accepted',async()=>{const r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'x',email:'bad',message:'short'})});assert.equal(r.status,400)});
test('chat rejects oversize questions',async()=>{const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'x'.repeat(1501)})});assert.equal(r.status,400)});
test('malformed JSON returns JSON error',async()=>{const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(r.status,400);assert.ok((await r.json()).error)});
const inquiry={name:'Test Client',email:'client@example.com',service:'Backend & APIs',budget:'Let’s discuss',message:'I need a backend API for a new business application.',consent:true,website:''};
test('valid inquiry is emailed with visitor reply-to and configured recipient',async()=>{
 let email;const mocked=mock.method(nodemailer,'createTransport',()=>({sendMail:async mail=>{email=mail;return {accepted:['developer@example.com'],rejected:[]}},close(){}}));
 try{const r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inquiry)});assert.equal(r.status,201);assert.match((await r.json()).message,/emailed/);assert.equal(email.to,'developer@example.com');assert.equal(email.replyTo,inquiry.email);assert.match(email.text,/Test Client/)}finally{mocked.mock.restore()}
});
test('SMTP rejection is reported without claiming an inquiry was saved',async()=>{
 const mocked=mock.method(nodemailer,'createTransport',()=>({sendMail:async()=>{throw Object.assign(new Error('private SMTP details'),{code:'EAUTH'})},close(){}}));
 try{const r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inquiry)});assert.equal(r.status,503);const body=await r.json();assert.match(body.error,/Nothing has been saved/);assert.doesNotMatch(body.error,/private SMTP/)}finally{mocked.mock.restore()}
});
test('missing email configuration fails instead of accepting an inquiry',async()=>{
 const previous=process.env.CONTACT_TO;process.env.CONTACT_TO='';try{const r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inquiry)});assert.equal(r.status,503)}finally{process.env.CONTACT_TO=previous}
});
test('unconfigured AI returns explicitly labeled grounded profile search',async()=>{const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Tell me about FFmpeg video playback'})});assert.equal(r.status,200);const data=await r.json();assert.equal(data.mode,'profile-search');assert.ok(data.sources.some(s=>s.id==='vss'));assert.match(data.answer,/FFmpeg/)});
