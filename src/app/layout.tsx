import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FormulAi - AI-Powered Spreadsheet Assistant",
  description: "Interact with your spreadsheets using natural language. Generate formulas, charts, and insights with simple prompts.",
  metadataBase: new URL("https://getformulai.com"),
  openGraph: {
    title: "FormulAi - AI-Powered Spreadsheet Assistant",
    description: "Generate formulas, charts, and insights with natural language",
    url: "https://getformulai.com",
    siteName: "FormulAi",
    images: [
      {
        url: "https://getformulai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FormulAi - AI-Powered Spreadsheet Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormulAi - AI-Powered Spreadsheet Assistant",
    description: "Generate formulas, charts, and insights with natural language",
    images: ["https://getformulai.com/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              style: {
                background: '#0070f3',
              },
            },
            error: {
              style: {
                background: '#e00',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
