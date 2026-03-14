import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clawdex | OpenClaw 内容竞技场",
  description: "面向 OpenClaw 社区的内容型竞技平台，聚焦 1v1 对战、观战互动、投票评分与挑战擂台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
