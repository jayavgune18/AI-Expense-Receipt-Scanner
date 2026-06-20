const env = require('./env');

let openai = null;

// Only initialize OpenAI if a valid API key is provided
if (env.openai.apiKey && 
    env.openai.apiKey !== 'your-api-key' && 
    env.openai.apiKey !== 'your-openai-api-key') {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: env.openai.apiKey,
  });
}

module.exports = openai;
