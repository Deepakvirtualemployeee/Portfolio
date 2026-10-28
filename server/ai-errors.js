// Return only known messages; never expose raw SDK errors or request headers.
export function describeAIError(error) {
  const code = error.code || error.error?.code;
  const causeCode = error.cause?.code || error.cause?.cause?.code;
  if (code === 'expired_secret_key' || code === 'invalid_api_key' || error.status === 401) {
    return {status:503,code:'ai_credentials',message:'The AI assistant is unavailable because its credentials need updating. Please use the contact form.',diagnostic:'OpenAI rejected the API key. Replace OPENAI_API_KEY in .env with a valid key. The configured key may be expired or revoked.'};
  }
  if (code === 'insufficient_quota') {
    return {status:503,code:'ai_quota',message:'The AI assistant has reached its usage allowance. Please use the contact form.',diagnostic:'OpenAI quota is exhausted. Check API billing and project spending limits.'};
  }
  if (error.status === 404 || code === 'model_not_found') {
    return {status:503,code:'ai_model',message:'The AI assistant is temporarily unavailable. Please use the contact form.',diagnostic:'The configured OpenAI model was not found or is not accessible to this API project. Check OPENAI_MODEL and OPENAI_EMBEDDING_MODEL in .env.'};
  }
  if (['SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_GET_ISSUER_CERT_LOCALLY','UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(causeCode)) {
    return {status:503,code:'ai_certificate',message:'The AI assistant cannot connect securely right now. Please use the contact form.',diagnostic:'OpenAI certificate validation failed. Start with npm run dev or npm start to use system-trusted certificates. Never disable TLS verification.'};
  }
  if (error.status === 429) {
    return {status:429,code:'ai_rate_limit',message:'The AI assistant is busy. Please try again shortly.',diagnostic:'OpenAI request rate limit reached.'};
  }
  return {status:503,code:'ai_unavailable',message:'The AI assistant could not connect right now. Please try again shortly or use the contact form.',diagnostic:'OpenAI request failed. Check network connectivity and model access.'};
}
