export type OpenClawErrorEnvelope = {
  ok: false;
  error: {
    code:
      | "NETWORK_UNREACHABLE"
      | "AUTH_FAILED"
      | "ENDPOINT_MISSING"
      | "PROTOCOL_MISMATCH"
      | "FEATURE_UNSUPPORTED"
      | "CONFIG_INVALID"
      | "UPSTREAM_5XX";
    category: "network" | "auth" | "compatibility" | "config" | "upstream";
    message: string;
    retryable: boolean;
    suggestion: string;
    details?: Record<string, unknown>;
  };
};

export function classifyOpenClawError(error: unknown, options?: { status?: number }) {
  const message = error instanceof Error ? error.message : "Unknown OpenClaw error";
  const normalized = message.toLowerCase();

  if (options?.status === 404 || normalized.includes("endpoint missing")) {
    return {
      code: "ENDPOINT_MISSING" as const,
      category: "compatibility" as const,
      message,
      retryable: false,
      suggestion: "检查当前 Clawdex 平台是否支持该 endpoint，或让插件按 discovery contract 回退到兼容路径。",
    };
  }

  if (normalized.includes("unauthorized")) {
    return {
      code: "AUTH_FAILED" as const,
      category: "auth" as const,
      message,
      retryable: false,
      suggestion: "检查 OpenClaw 插件 token 是否与 CLAWDEX_PLUGIN_TOKEN 一致。",
    };
  }

  if (normalized.includes("unsupported")) {
    return {
      code: "FEATURE_UNSUPPORTED" as const,
      category: "compatibility" as const,
      message,
      retryable: false,
      suggestion: "检查 discovery contract 中该能力是否 supported，或降级到 fallback flow。",
    };
  }

  if (normalized.includes("required") || normalized.includes("invalid")) {
    return {
      code: "CONFIG_INVALID" as const,
      category: "config" as const,
      message,
      retryable: false,
      suggestion: "检查请求参数和插件配置是否完整。",
    };
  }

  if (options?.status && options.status >= 500) {
    return {
      code: "UPSTREAM_5XX" as const,
      category: "upstream" as const,
      message,
      retryable: true,
      suggestion: "上游服务暂时不可用，稍后重试并检查服务器日志。",
    };
  }

  return {
    code: "NETWORK_UNREACHABLE" as const,
    category: "network" as const,
    message,
    retryable: true,
    suggestion: "检查 controlPlaneBaseUrl、网络连通性和服务是否启动。",
  };
}

export function buildOpenClawErrorResponse(
  error: unknown,
  options?: { status?: number; fallbackMessage?: string; details?: Record<string, unknown> },
): OpenClawErrorEnvelope {
  const classified = classifyOpenClawError(error, { status: options?.status });

  return {
    ok: false,
    error: {
      ...classified,
      message: error instanceof Error ? error.message : (options?.fallbackMessage ?? "OpenClaw request failed"),
      details: options?.details,
    },
  };
}
