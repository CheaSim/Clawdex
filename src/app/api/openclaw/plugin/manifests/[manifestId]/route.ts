import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

const manifestFiles: Record<string, string> = {
  "community-skills": path.join(process.cwd(), "skills", "clawdex-community.skills.json"),
  "plugin-skills": path.join(process.cwd(), "clawdex-openclaw-channel", "skills", "clawdex-channel.skills.json"),
  plugin: path.join(process.cwd(), "clawdex-openclaw-channel", "openclaw.plugin.json"),
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ manifestId: string }> },
) {
  const { manifestId } = await context.params;
  const filePath = manifestFiles[manifestId];

  if (!filePath) {
    return NextResponse.json({ message: "Manifest not found" }, { status: 404 });
  }

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw) as unknown;
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ message: "Failed to read manifest" }, { status: 500 });
  }
}
