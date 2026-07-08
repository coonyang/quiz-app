import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "퀴즈 앱",
  description: "친구들과 함께 즐기는 실시간 퀴즈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
