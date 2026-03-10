import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Hedge — Where Curious Families Learn",
  description:
    "Personalised activities and ideas for Irish families — from everyday adventures to complete homeschool planning. Inspired by Ireland's hedge schools.",
  openGraph: {
    title: "The Hedge — Where Curious Families Learn",
    description: "What will your family do today? The Hedge knows.",
    url: "https://thehedge.ie",
    siteName: "The Hedge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
