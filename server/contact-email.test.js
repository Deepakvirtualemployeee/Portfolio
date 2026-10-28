import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendContactEmail} from './contact-email.js';
const entry={id:'test',createdAt:'2026-10-28',name:'Client',email:'client@example.com',service:'React project',budget:'Discuss',message:'Build a business application.'};
const env={EMAIL_PROVIDER:'brevo',BREVO_API_KEY:'test-only',CONTACT_FROM:'sender@example.com',CONTACT_TO:'developer@example.com'};
test('Render-compatible email uses HTTPS and keeps the visitor as reply-to',async()=>{
 let sent;
 await sendContactEmail(entry,{env,request:async(url,options)=>{sent={url,...options};return {ok:true,json:async()=>({messageId:'accepted'})}}});
 assert.equal(sent.url,'https://api.brevo.com/v3/smtp/email');
 const mail=JSON.parse(sent.body);assert.equal(mail.replyTo.email,entry.email);assert.equal(mail.to[0].email,env.CONTACT_TO);assert.equal(mail.sender.email,env.CONTACT_FROM);assert.match(mail.textContent,/business application/);
});
test('email provider rejection is surfaced safely',async()=>{
 await assert.rejects(sendContactEmail(entry,{env,request:async()=>({ok:false})}),{code:'EMAIL_PROVIDER_REJECTED'});
});
test('missing API key fails before making an external request',async()=>{
 await assert.rejects(sendContactEmail(entry,{env:{...env,BREVO_API_KEY:''},request:()=>{throw Error('should not run')}}),{code:'EMAIL_CONFIG'});
});
test('SMTP is prevented on Render instead of waiting for a blocked port',async()=>{
 await assert.rejects(sendContactEmail(entry,{env:{...env,EMAIL_PROVIDER:'smtp',RENDER:'true'}}),{code:'EMAIL_CONFIG'});
});
