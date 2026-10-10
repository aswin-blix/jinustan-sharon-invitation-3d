import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import {
  eventDisplay,
  fillTemplate,
  invitationConfig,
  venueDisplay,
} from "./invitation-config";
import "./globals.css";

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const metadataBase = new URL(
  productionUrl
    ? `https://${productionUrl}`
    : invitationConfig.seo.fallbackBaseUrl,
);
const title = `${invitationConfig.identity.displayName} — ${invitationConfig.seo.titleSuffix}`;
const description = fillTemplate(invitationConfig.seo.description, {
  names: invitationConfig.identity.fullNames,
  event: invitationConfig.event.title.toLocaleLowerCase(
    invitationConfig.seo.language,
  ),
  date: eventDisplay.date,
  time: eventDisplay.time,
  venue: venueDisplay.short,
});

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    title: `${invitationConfig.identity.displayName} — ${invitationConfig.seo.socialTitleSuffix}`,
    description: fillTemplate(invitationConfig.seo.socialDescription, {
      date: eventDisplay.date,
      time: eventDisplay.time,
      venue: venueDisplay.short,
    }),
    images: [invitationConfig.media.socialPreview],
  },
  icons: { icon: invitationConfig.media.favicon },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={invitationConfig.seo.language}>
      <body style={invitationConfig.theme.css as CSSProperties}>{children}</body>
    </html>
  );
}
