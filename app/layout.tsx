import type { Metadata } from "next";
// Self-hosted fonts (OFL): no request to Google at runtime — a privacy requirement.
// Family names match --font-sans / --font-mono in docs/design-system/tokens.css.
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { strings } from "@/lib/i18n";

export const metadata: Metadata = {
  title: strings.appName,
  description: strings.tagline,
};

/**
 * The UI theme follows prefers-color-scheme. tokens.css switches on
 * [data-theme], so set it before first paint and keep it in sync.
 * (Pattern: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md)
 */
const themeScript = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");var s=function(){d.setAttribute("data-theme",m.matches?"dark":"light")};s();m.addEventListener("change",s)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-theme="light" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
