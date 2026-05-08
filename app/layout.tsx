import coverImage from '@/assets/cover.png';
import { AppShell } from '@/components/navigation/app-shell';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verify Docs",
  description: "CPF search and filtering application",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Verify Docs",
    description: "CPF search and filtering application",
    type: 'website',
    images: [
      {
        url: coverImage.src,
        width: coverImage.width,
        height: coverImage.height,
        alt: 'Verify Docs - CPF Authenticity and Fraud Prevention',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Verify Docs",
    description: "CPF search and filtering application",
    images: [coverImage.src],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const r=document.documentElement,p=localStorage.getItem('${THEME_STORAGE_KEY}');const d=p==='dark'||(p!=='light'&&typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme:dark)').matches);r.classList.toggle('dark',d);}catch{}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
