# Release Notes

## Repository

Recommended public repository name:

```text
openclaw-codex-sdk
```

Recommended description:

```text
Native OpenClaw Codex runtime powered by @openai/codex-sdk.
```

Recommended topics:

```text
openclaw, codex, codex-sdk, acp, mcp, agent-runtime
```

## ClawHub Submission Draft

Title:

```text
Add native Codex SDK runtime for OpenClaw
```

Body:

```markdown
## Summary

- Adds a standalone `codex-sdk` plugin powered by `@openai/codex-sdk`.
- Registers a first-class `codex-sdk` ACP backend with Codex route aliases.
- Adds Codex CLI, `/codex-sdk` chat command, Gateway RPC, Control UI descriptor, session
  replay/export, proposal inbox, compatibility, and smoke-test surfaces.
- Adds an MCP backchannel so Codex can read OpenClaw status, create proposals,
  and call explicitly allowlisted Gateway methods.
- Uses only public OpenClaw plugin SDK subpaths:
  `openclaw/plugin-sdk/core` and `openclaw/plugin-sdk/acp-runtime-backend`.
- Defaults `inheritEnv` to false and redacts secret-looking inherited env names
  before spawning Codex.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run pack:check`
- Isolated smoke commands from `README.md`
- Live proof: `openclaw codex run --json ...` returns through the `codex-sdk`
  runtime, calls the injected `openclaw_status` MCP tool, and reports
  `OPENCLAW_CODEX_SDK_RUN_OK`.

## Notes

Codex authentication stays with Codex. Operators run `codex login` once; OpenClaw
does not run a second OpenAI Codex OAuth flow for the plugin unless `apiKeyEnv`
is intentionally configured.
```

## X Announcement Draft

```text
Built a native Codex runtime for OpenClaw.

It uses @openai/codex-sdk, adds a first-class codex-sdk ACP backend, persistent Codex sessions, CLI + Gateway + Control UI descriptor surfaces, route/model visibility, replay/export, proposal inbox execution, and an MCP backchannel so Codex and OpenClaw can talk both ways.

Standalone, public, and built so anyone running OpenClaw can make Codex feel native.
```
