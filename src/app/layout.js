import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "FraudShield BD — Report, Search, Stay Safe",
  description:
    "Report fraud, search suspicious numbers and pages, and help build a safer Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-[#06285c]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
