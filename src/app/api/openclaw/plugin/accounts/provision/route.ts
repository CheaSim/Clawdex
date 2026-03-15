import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { provisionPluginAccount, type PluginProvisionAccountInput } from "@/lib/openclaw-auto-agent";
import { assertPluginAuthorized, getPluginAuthMode } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const payload = (await request.json()) as PluginProvisionAccountInput;

  try {
    const result = await provisionPluginAccount(payload);

    revalidatePath("/account");
    revalidatePath("/admin/users");
    revalidatePath("/players");
    revalidatePath(`/players/${result.player.slug}`);
    revalidatePath("/openclaw");

    // Never expose tempPassword when plugin auth is in open (unauthenticated) mode
    const safeResult = getPluginAuthMode() === "open"
      ? { ...result, tempPassword: undefined }
      : result;

    return NextResponse.json({
      ...safeResult,
      channel: "clawdex-channel",
      message: result.userCreated
        ? "Clawdex auto-provisioning completed and a new account is ready for OpenClaw automation."
        : "Clawdex account already existed and has been prepared for automated PK flow.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Account provisioning failed" },
      { status: 400 },
    );
  }
}
