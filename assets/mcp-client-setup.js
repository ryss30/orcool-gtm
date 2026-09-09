/* Maintained setup copy. Regenerate static fallbacks with scripts/sync-mcp-setup.mjs.
 * Official documentation reviewed 2026-09-08. This is not endpoint conformance proof.
 */
(function (root) {
  'use strict';
  var endpoint = 'https://mcp.orcool.com';
  root.OrcoolMcpSetup = {
    version: '2026-09-08-v1',
    endpoint: endpoint,
    clients: {
      Claude: {
        mode: 'Strategic synthesis · Limited preview',
        connectTitle: 'Add Orcool to Claude',
        setup: 'Open Customize → Connectors → + → Add custom connector. Name it Orcool, paste the endpoint, then add it. In a managed workspace, an owner may need to add the connector first.',
        auth: 'Connect the Orcool connector and complete browser sign-in if requested. Then return to Claude.',
        verify: 'Enable Orcool for this conversation in the plus-menu connector controls. Ask it to use the available Orcool evidence for your selected market.',
        verifyCommand: '+ → Connectors → Orcool',
        caveat: 'Custom connectors depend on your plan and workspace policy. Free supports one custom connector; its setup interface may differ from Pro and Max. Review the requested permissions.',
        docs: 'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp'
      },
      ChatGPT: {
        mode: 'Developer-mode app',
        connectTitle: 'Add Orcool to ChatGPT',
        setup: 'Open Settings → Security and login → Developer mode. Then open Plugins and use the plus action to create a developer-mode app. Enter the Orcool endpoint and review the discovered tools.',
        auth: 'Complete the authentication requested by the Orcool app, then return to ChatGPT.',
        verify: 'In the conversation plus menu, select Developer mode and choose Orcool. Ask explicitly to use its available evidence for your task; a question alone does not guarantee a tool call.',
        verifyCommand: '+ → Developer mode → Orcool',
        caveat: 'Developer mode is documented for Plus, Pro, Business, Enterprise and Education. Workspace policy can restrict access. A custom app is not a public directory listing.',
        docs: 'https://developers.openai.com/plugins/deploy/connect-chatgpt'
      },
      Codex: {
        mode: 'Read and audit workflow',
        connectTitle: 'Add the Orcool MCP server to Codex',
        setup: 'Open Settings → MCP servers → Add server. Choose Streamable HTTP, name the server orcool, paste the endpoint, save, then restart Codex.',
        auth: 'Choose Authenticate if requested for Orcool and complete browser sign-in.',
        verify: 'Use /mcp in the composer to check that orcool is connected before running a scoped prompt.',
        verifyCommand: '/mcp',
        caveat: 'These starter prompts request read-side evidence. Review local file changes and connector permissions separately; the full Orcool MCP is not globally read-only.',
        docs: 'https://learn.chatgpt.com/docs/extend/mcp?surface=app',
        surfaces: {
          Desktop: {
            setup: 'Open Settings → MCP servers → Add server. Choose Streamable HTTP, name the server orcool, paste the endpoint, save, then restart Codex.',
            auth: 'Choose Authenticate if requested for Orcool and complete browser sign-in.',
            verify: 'Use /mcp in the composer to check that orcool is connected before running a scoped prompt.',
            verifyCommand: '/mcp'
          },
          CLI: {
            setup: 'Add the remote server from your terminal. Codex shares MCP configuration across surfaces on the same host.',
            setupCommand: 'codex mcp add orcool --url ' + endpoint,
            auth: 'For OAuth authentication, run the login command and complete the browser sign-in.',
            authCommand: 'codex mcp login orcool',
            verify: 'Check that orcool is listed before starting the scoped task.',
            verifyCommand: 'codex mcp list'
          },
          IDE: {
            setup: 'Use the Codex CLI to add the remote server on the same host as the IDE extension. The surfaces share MCP configuration.',
            setupCommand: 'codex mcp add orcool --url ' + endpoint,
            auth: 'For OAuth authentication, use the CLI login command and complete browser sign-in on that host.',
            authCommand: 'codex mcp login orcool',
            verify: 'Confirm the shared server configuration before using Orcool in the extension. Remote development hosts may have separate configuration.',
            verifyCommand: 'codex mcp list'
          }
        }
      },
      Cursor: {
        mode: 'Evidence inside the workspace · Workflow template',
        connectTitle: 'Add the Orcool MCP server to Cursor',
        setup: 'Open Customize to manage MCP, or add an orcool entry under mcpServers in your project .cursor/mcp.json or user ~/.cursor/mcp.json. Set its url to the Orcool endpoint.',
        setupCommand: '{"mcpServers":{"orcool":{"url":"' + endpoint + '"}}}',
        auth: 'Enable the server in Customize and complete the authentication requested by Orcool.',
        verify: 'Check that Orcool tools are available. Ask Cursor to use them for the scoped task and review any tool approval request.',
        verifyCommand: 'Customize → MCP',
        caveat: 'Orcool conformance in Cursor is not yet validated. Workspace policy can restrict servers and tools. Cloud Agents use a separate integration path.',
        docs: 'https://cursor.com/docs/mcp'
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
