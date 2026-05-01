import type { OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import {
  registerCodexCli,
  registerCodexGatewayMethods,
  registerCodexNativeCommand,
} from "./src/commands.js";
import { createCodexSdkPluginConfigSchema } from "./src/config.js";
import { createCodexSdkRuntimeService } from "./src/service.js";

const plugin = {
  id: "codex-sdk",
  name: "Codex SDK Runtime",
  description: "ACP runtime backend powered by the official @openai/codex-sdk package.",
  configSchema: createCodexSdkPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerControlUiDescriptor({
      id: "codex-sdk-runtime",
      surface: "session",
      label: "Codex",
      description: "Inspect Codex SDK routes, session replay, proposal inbox, and backchannel state.",
      placement: "agent",
      schema: {
        backend: "codex-sdk",
        methods: [
          "codex.status",
          "codex.routes",
          "codex.sessions",
          "codex.events",
          "codex.session.export",
          "codex.inbox",
          "codex.proposal.create",
          "codex.proposal.update",
          "codex.proposal.execute",
          "codex.doctor",
        ],
      },
    });
    registerCodexNativeCommand(api);
    registerCodexGatewayMethods(api);
    registerCodexCli(api);
    api.registerService(
      createCodexSdkRuntimeService({
        pluginConfig: api.pluginConfig,
      }),
    );
  },
};

export default plugin;
