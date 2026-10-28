import {test} from 'node:test';
import assert from 'node:assert/strict';
import {describeAIError} from './ai-errors.js';
test('expired credentials produce an actionable, sanitized error',()=>{
 const result=describeAIError({status:401,code:'expired_secret_key',message:'secret must never appear'});
 assert.equal(result.code,'ai_credentials');assert.equal(result.status,503);
 assert.match(result.diagnostic,/Replace OPENAI_API_KEY/);
 assert.ok(!JSON.stringify(result).includes('secret must never appear'));
});
test('quota failure is distinguished from temporary throttling',()=>{
 assert.equal(describeAIError({status:429,code:'insufficient_quota'}).code,'ai_quota');
 assert.equal(describeAIError({status:429}).code,'ai_rate_limit');
});
test('certificate errors retain secure remediation',()=>{
 const result=describeAIError({cause:{code:'SELF_SIGNED_CERT_IN_CHAIN'}});
 assert.equal(result.code,'ai_certificate');assert.match(result.diagnostic,/Never disable TLS/);
});
test('model access failure is identified',()=>{
 assert.equal(describeAIError({status:404,code:'model_not_found'}).code,'ai_model');
});
