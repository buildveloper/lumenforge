import { Instrument_Serif } from "next/font/google";

/**
 * The display face is loaded here and nowhere else, so the authenticated app
 * never pays for a font only the marketing pages use.
 *
 * Instrument Serif is high-contrast and can thin out on dark at small sizes. If
 * it breaks up in review, swap to Newsreader — the `--font-display` token means
 * nothing else has to change.
 *
 * No motion provider: the landing page's only animation is a CSS scroll-driven
 * reveal, which keeps `motion` out of the bundle on the LCP route.
 */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={instrument.variable}>{children}</div>;
}
