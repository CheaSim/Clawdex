const fs = require('fs');
const path = require('path');

const apiKey = process.argv[2];
if (!apiKey) {
  console.error('Missing API key argument.');
  process.exit(1);
}

const dir = path.join(process.env.USERPROFILE || '', '.codex');
if (!dir || dir === '.codex') {
  console.error('Unable to resolve USERPROFILE.');
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });

const config = [
  'model_provider = "OpenAI"',
  'model = "gpt-5.4"',
  'review_model = "gpt-5.4"',
  'model_reasoning_effort = "xhigh"',
  'disable_response_storage = true',
  'network_access = "enabled"',
  'windows_wsl_setup_acknowledged = true',
  'model_context_window = 1000000',
  'model_auto_compact_token_limit = 900000',
  '',
  '[model_providers.OpenAI]',
  'name = "OpenAI"',
  'base_url = "https://ai.egoagent.xyz"',
  'wire_api = "responses"',
  'requires_openai_auth = true',
  ''
].join('\n');

fs.writeFileSync(path.join(dir, 'config.toml'), config, 'utf8');
fs.writeFileSync(
  path.join(dir, 'auth.json'),
  JSON.stringify({ OPENAI_API_KEY: apiKey }, null, 2),
  'utf8'
);

const writtenConfig = fs.readFileSync(path.join(dir, 'config.toml'), 'utf8');
const writtenAuth = JSON.parse(fs.readFileSync(path.join(dir, 'auth.json'), 'utf8'));

console.log(`CONFIG_EXISTS=${fs.existsSync(path.join(dir, 'config.toml'))}`);
console.log(`AUTH_EXISTS=${fs.existsSync(path.join(dir, 'auth.json'))}`);
console.log(`HAS_BASE_URL=${writtenConfig.includes('https://ai.egoagent.xyz')}`);
console.log(`HAS_API_KEY_FIELD=${Object.prototype.hasOwnProperty.call(writtenAuth, 'OPENAI_API_KEY')}`);
