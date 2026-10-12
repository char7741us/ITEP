import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/common/Header";
import { SystemNotice } from "@/components/common/SystemNotice";
import { LearningProvider } from "@/components/learning/LearningProvider";
import { LearningOverlay } from "@/components/learning/LearningOverlay";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-signature",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-label",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iTEP Simulator — Tu ruta de práctica",
  description: "Prepara tu inglés académico con una ruta personal, práctica de cinco habilidades, coach de estudio y simulacros. Herramienta independiente, no un examen oficial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <LearningProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-background focus:p-3">Saltar al contenido</a>
            <SystemNotice />
            <Header />
            <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">{children}</main>
            <LearningOverlay />
          </LearningProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
