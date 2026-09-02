import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kelana® — Beyond AI Travel.",
  description: "Bespoke AI-powered travel itineraries and recommendations engineered with precision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#000d10] selection:bg-[#bc7155] selection:text-white relative pb-16">
        <Navbar />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
