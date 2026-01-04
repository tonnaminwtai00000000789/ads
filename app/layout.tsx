import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "IJON KEY ",
    template: "%s | IJON KEY",
  },
  description: "Just bypass it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script data-cfasync="false" src="//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1235374"></script>
        <Script src="https://publisher.linkvertise.com/cdn/linkvertise.js" />
        <script
  dangerouslySetInnerHTML={{
    __html: `
      (window as any).linkvertise(1162634, {
        whitelist: [],
        blacklist: [""]
      });
    `,
  }}
/>
      </head>
      <Script
         data-cfasync="false"
         src="//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1235374"
      />
          <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-[#d4a76a]/30`}
      >
        <Providers>
          <main id="main-content">
            <div
              style={{
                backgroundImage: 'url("/C4botF.gif")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(8px)',
              }}
              className="fixed inset-0 z-0"
            >
            </div>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
