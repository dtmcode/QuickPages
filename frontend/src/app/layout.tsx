import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { ApolloWrapper } from "@/lib/apollo-provider";
import { CartProvider } from "@/contexts/cart-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "myquickpage – Website Builder für deutsche KMUs",
    template: "%s | myquickpage",
  },
  description:
    "Landing Pages, Blog, Online-Shop, Terminbuchung und Newsletter – alles in einer DSGVO-konformen Plattform. Kein Code, kein Plugin-Chaos. Ab €9/Monat.",
  keywords: [
    "Website Builder Deutschland",
    "DSGVO konform",
    "Landing Page erstellen",
    "Online Shop erstellen",
    "Terminbuchung Software",
    "Newsletter Tool",
    "WordPress Alternative",
    "Shopify Alternative",
    "Website ohne Code",
    "KMU Website",
  ],
  authors: [{ name: "myquickpage", url: "https://myquickpage.de" }],
  creator: "myquickpage",
  publisher: "myquickpage",
  metadataBase: new URL("https://myquickpage.de"),
  alternates: {
    canonical: "https://myquickpage.de",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://myquickpage.de",
    siteName: "myquickpage",
    title: "myquickpage – Website Builder für deutsche KMUs",
    description:
      "Landing Pages, Blog, Shop, Booking & Newsletter in einer Plattform. DSGVO-konform. Made in Germany. Ab €9/Monat.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "myquickpage – Alles für deine Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "myquickpage – Website Builder für deutsche KMUs",
    description:
      "Landing Pages, Blog, Shop, Booking & Newsletter in einer Plattform. DSGVO-konform. Made in Germany.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ApolloWrapper>
            <AuthProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </AuthProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}