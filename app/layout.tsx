import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECO - 실시간 야외활동 지능",
  description: "날씨가 아니라, 활동의 최적을 찾습니다. Outdoor Activity Intelligence",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
