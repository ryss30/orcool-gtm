// Mechanical generation only: setup copy lives in assets/mcp-client-setup.js.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/mcp-client-setup.js'), 'utf8'), context);
const { clients, version } = context.OrcoolMcpSetup;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const command = value => value ? `<code class="mcp-setup-command">${escape(value)}</code>` : '';
const checkOnly = process.argv.includes('--check');
function save(relative, content) {
  const file = path.join(root, relative);
  if (checkOnly) {
    if (fs.readFileSync(file, 'utf8') !== content) throw new Error(`Stale generated setup: ${relative}`);
  } else fs.writeFileSync(file, content);
}
let globalHtml = fs.readFileSync(path.join(root, 'global/index.html'), 'utf8');
for (const name of ['Claude', 'ChatGPT', 'Cursor']) {
  const client = clients[name];
  const steps = ['Copy the MCP server URL above.', client.setup + command(client.setupCommand), client.auth + command(client.authCommand), client.verify];
  const content = `<!-- MCP_SETUP:${name} -->\n          <ol class="mcp-setup-steps" data-setup-version="${version}">\n${steps.map((step, index) => '            <li><span class="mcp-setup-number">' + (index + 1) + '.</span>' + (index === 1 ? escape(client.setup) + command(client.setupCommand) : index === 2 ? escape(client.auth) + command(client.authCommand) : escape(step)) + '</li>').join('\n')}\n          </ol>\n          <p class="mcp-setup-caveat">${escape(client.caveat)}</p>\n          <p class="mcp-setup-docs"><a href="${escape(client.docs)}">Official ${name} setup guide</a> · Checked ${version.slice(0, 10)}</p>\n          <!-- /MCP_SETUP:${name} -->`;
  const regex = new RegExp(`<!-- MCP_SETUP:${name} -->[\\s\\S]*?<!-- /MCP_SETUP:${name} -->`);
  if (!regex.test(globalHtml)) throw new Error(`Missing Global marker: ${name}`);
  globalHtml = globalHtml.replace(regex, content);
}
save('global/index.html', globalHtml);
let pcHtml = fs.readFileSync(path.join(root, 'performance-capital/index.html'), 'utf8');
for (const [attr, field] of Object.entries({ 'data-agent-setup': 'setup', 'data-agent-auth': 'auth', 'data-agent-verify': 'verify', 'data-agent-verify-command': 'verifyCommand', 'data-agent-caveat': 'caveat', 'data-agent-mode': 'mode' })) {
  const regex = new RegExp(`(<([a-z]+)[^>]*\\b${attr}(?:="[^"]*")?[^>]*>)[\\s\\S]*?(</\\2\\s*>)`);
  if (!regex.test(pcHtml)) throw new Error(`Missing PC field: ${attr}`);
  pcHtml = pcHtml.replace(regex, (_, start, tag, end) => start + escape(clients.Claude[field]) + end);
}
pcHtml = pcHtml.replace(/(<a\b[^>]*data-agent-docs\b[^>]*href=")[^"]*("[^>]*>)[\s\S]*?(<\/a>)/, '$1' + escape(clients.Claude.docs) + '$2Official Claude setup guide$3');
save('performance-capital/index.html', pcHtml);
console.log(checkOnly ? 'Generated setup is current.' : 'Updated static setup from the maintained source.');
