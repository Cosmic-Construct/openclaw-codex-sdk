# OpenClaw Codex SDK Runtime

`openclaw-codex-sdk` is a standalone OpenClaw plugin that makes Codex a
first-class OpenClaw ACP runtime. It uses the official `@openai/codex-sdk`,
registers the public `codex-sdk` backend, and exposes Codex through normal
OpenClaw agent, chat command, CLI, Gateway, and Control UI descriptor surfaces.

It is intentionally separate from AirLock and Wanda so any OpenClaw operator can
install it, test it, and run Codex as an OpenClaw-native agent.

## What It Adds

- First-class ACP agents for `codex`, `codex-fast`, `codex-deep`,
  `codex-review`, `codex-test`, `codex-refactor`, `codex-docs`,
  `codex-ship`, and `codex-worker`.
- Persistent Codex sessions with streamed text, tool/status events, attachments,
  event replay, session export, and compatibility records.
- CLI commands under `openclaw codex ...` and chat commands under
  `/codex-sdk ...` for status, routes, config
  validation, doctor checks, one-shot runs, events, exports, and proposal inbox
  management.
- Gateway RPC methods under `codex.*` for status, routes, sessions, events,
  exports, proposals, execution, and doctor checks.
- A Control UI descriptor that points OpenClaw at the plugin-owned Codex Gateway
  methods and session surfaces.
- A bidirectional MCP backchannel injected into Codex turns so Codex can read
  OpenClaw status, create proposals, and call explicitly allowlisted Gateway
  methods.

## Requirements

- OpenClaw `2026.4.29` or newer.
- Node.js `22` or newer.
- A local Codex login for interactive/operator use:

```bash
codex login
```

## Install

From npm/ClawHub package form:

```bash
openclaw plugins install openclaw-codex-sdk
openclaw config set plugins.allow '["codex-sdk"]'
openclaw codex configure
openclaw codex config validate
openclaw codex doctor --record
```

For local development from this repository:

```bash
npm install
openclaw plugins install --link .
openclaw config set plugins.allow '["codex-sdk"]'
openclaw codex configure
openclaw codex config validate
openclaw codex doctor --record
```

`openclaw codex configure` sets `acp.backend = "codex-sdk"` and creates a
first-class `agents.list[]` entry for the `codex` agent.

## Auth And Environment Boundary

Codex auth stays with Codex. After `codex login`, OpenClaw reuses the local
Codex CLI/OAuth session through the SDK. OpenClaw does not run a second OpenAI
Codex OAuth flow.

For service deployments that intentionally avoid local Codex login, set
`apiKeyEnv` to the name of one environment variable that contains the API key.
That value is passed to the SDK as `apiKey`; it is not copied into the spawned
Codex process environment.

The plugin does not inherit the Gateway process environment by default:

- `inheritEnv` defaults to `false`.
- Codex receives only a minimal runtime allowlist such as `PATH`, `HOME`,
  shell/temp/locale variables, plus explicit plugin `env` entries.
- If `inheritEnv` is set to `true`, secret-looking inherited names containing
  terms like `TOKEN`, `SECRET`, `KEY`, `PASSWORD`, `AUTH`, `COOKIE`, `SESSION`,
  `PRIVATE`, `CREDENTIAL`, or `PROXY` are redacted.
- Operators can still pass intentional values through explicit plugin `env`.

## Model And Route Visibility

The plugin passes model and reasoning settings directly into Codex SDK thread
options. Verify effective values in any of these surfaces:

- Chat: `/codex-sdk routes`
- CLI: `openclaw codex routes`
- Gateway RPC: `codex.routes`
- Control UI descriptor/session surfaces when enabled by the host UI

Example high-effort route:

```bash
openclaw config set plugins.entries.codex-sdk.config.model gpt-5.5
openclaw config set plugins.entries.codex-sdk.config.modelReasoningEffort xhigh
openclaw config set plugins.entries.codex-sdk.config.routes.default.model gpt-5.5
openclaw config set plugins.entries.codex-sdk.config.routes.default.modelReasoningEffort xhigh
openclaw codex config validate
openclaw codex routes
```

There is no separate OpenClaw "Pro" switch. The model string is forwarded to
Codex, and account entitlement remains part of the Codex/OpenAI login.

## Smoke Tests

Use an isolated OpenClaw profile so the smoke does not touch your default
Gateway or any existing AirLock/Wanda profile:

```bash
export OPENCLAW_STATE_DIR=/tmp/openclaw-codex-sdk-smoke/state
export OPENCLAW_CONFIG_PATH=/tmp/openclaw-codex-sdk-smoke/openclaw.json
export OPENCLAW_SKIP_CHANNELS=1
export CLAWDBOT_SKIP_CHANNELS=1

openclaw plugins install --link .
openclaw config set plugins.allow '["codex-sdk"]'
openclaw config set plugins.entries.codex-sdk.config.cwd "$PWD"
openclaw config set gateway.mode local
openclaw codex configure
openclaw codex config validate
openclaw codex doctor --record
openclaw codex status --json
```

That proves install, configuration, doctor, and status without starting a model
turn.

## Manual Standalone Gateway

This leaves a local Gateway running for manual Control UI/chat testing:

```bash
export OPENCLAW_STATE_DIR=/tmp/openclaw-codex-standalone/state
export OPENCLAW_CONFIG_PATH=/tmp/openclaw-codex-standalone/openclaw.json
export OPENCLAW_SKIP_CHANNELS=1
export CLAWDBOT_SKIP_CHANNELS=1

openclaw plugins install --link .
openclaw config set plugins.allow '["codex-sdk"]'
openclaw config set plugins.entries.codex-sdk.config.cwd "$PWD"
openclaw config set gateway.mode local
openclaw codex configure
openclaw config set 'agents.list[0].runtime.acp.cwd' "$PWD"
openclaw codex config validate

openclaw gateway run --port 19891 --auth none --bind loopback --compact
```

For a CLI-side live SDK proof without binding a chat session:

```bash
openclaw codex run --cwd "$PWD" --json \
  'Use openclaw_status through the injected MCP backchannel, then reply with STANDALONE_CODEX_GATEWAY_OK.'
```

For Control UI chat testing, open a session such as `agent:codex:main` with an
admin-scoped Control UI token, bind the thread once with:

```text
/acp spawn codex --thread here --cwd /path/to/workspace
```

Then send normal chat turns in that same session.

`--auth none` should only be used on loopback test gateways.

## Bidirectional Backchannel

The plugin injects an MCP server into SDK-backed Codex turns as
`mcp_servers.openclaw-codex`. Codex gets these tools:

- `openclaw_status`: read Codex/OpenClaw runtime status.
- `openclaw_proposal`: create operator-visible proposal inbox records.
- `openclaw_gateway_request`: call explicitly allowlisted Gateway RPC methods.

The generated backchannel is approved in Codex config because SDK turns are
non-interactive. OpenClaw still enforces the actual safety boundary:

- read methods are limited to configured `backchannel.readMethods`
- proposal writes are limited to safe proposal methods by default
- broader Gateway writes require `backchannel.allowedMethods`
- write/admin calls require the token named by
  `OPENCLAW_CODEX_BACKCHANNEL_WRITE_TOKEN` unless explicitly disabled

## Release Checks

Before publishing:

```bash
npm test
npm run typecheck
npm run smoke
OPENCLAW_CODEX_LIVE_SMOKE=1 npm run smoke
npm run pack:check
```

The plugin package and manifest carry the standalone version `2026.5.1`.
