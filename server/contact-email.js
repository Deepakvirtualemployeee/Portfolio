import nodemailer from 'nodemailer';

export async function sendContactEmail(entry, {env=process.env,request=fetch}={}) {
  const provider=env.EMAIL_PROVIDER||'smtp';
  const sender=env.CONTACT_FROM||env.EMAIL_USER||env.SMTP_USER;
  const recipient=env.CONTACT_TO;
  const subject=`Portfolio inquiry: ${entry.service.replace(/[\r\n]/g,' ')}`;
  const text=`New portfolio inquiry\nReference: ${entry.id}\nSubmitted: ${entry.createdAt}\nName: ${entry.name}\nEmail: ${entry.email}\nService: ${entry.service}\nBudget: ${entry.budget}\n\n${entry.message}`;
  if(!sender||!recipient)throw Object.assign(new Error('Missing contact addresses'),{code:'EMAIL_CONFIG'});
  if(provider==='brevo'){
    if(!env.BREVO_API_KEY)throw Object.assign(new Error('Missing Brevo API key'),{code:'EMAIL_CONFIG'});
    const response=await request('https://api.brevo.com/v3/smtp/email',{
      method:'POST',headers:{'Content-Type':'application/json','api-key':env.BREVO_API_KEY},
      body:JSON.stringify({sender:{name:'Deepak Portfolio',email:sender},to:[{email:recipient}],replyTo:{email:entry.email,name:entry.name},subject,textContent:text}),
      signal:AbortSignal.timeout(20000),
    });
    if(!response.ok)throw Object.assign(new Error('Email provider rejected request'),{code:'EMAIL_PROVIDER_REJECTED'});
    const result=await response.json();
    if(!result.messageId)throw Object.assign(new Error('Email provider did not accept message'),{code:'EMAIL_NOT_ACCEPTED'});
    return;
  }
  if(provider!=='smtp'||env.RENDER==='true')throw Object.assign(new Error('Render Free requires HTTPS email delivery'),{code:'EMAIL_CONFIG'});
  const user=env.EMAIL_USER||env.SMTP_USER;
  const pass=env.EMAIL_PASS||env.SMTP_PASS;
  if(!user||!pass)throw Object.assign(new Error('Missing SMTP credentials'),{code:'EMAIL_CONFIG'});
  const port=Number(env.SMTP_PORT||465);
  const transport=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,requireTLS:port!==465,auth:{user,pass:pass.replace(/\s/g,'')},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000});
  try{
    const result=await transport.sendMail({from:sender,to:recipient,replyTo:entry.email,subject,text,disableFileAccess:true,disableUrlAccess:true});
    if(!result.accepted?.length||result.rejected?.length)throw Object.assign(new Error('Recipient not accepted'),{code:'EMAIL_NOT_ACCEPTED'});
  }finally{transport.close()}
}
