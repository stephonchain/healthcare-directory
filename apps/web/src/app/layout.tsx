import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Healthcare Directory - AI Tools & Development Resources',
  description: 'A community directory for healthcare AI tools, development rules, and resources. Learn HIPAA compliance, FHIR APIs, HL7 integration, telemedicine, and more.',
  keywords: ['healthcare', 'HIPAA', 'FHIR', 'HL7', 'telemedicine', 'medical AI', 'healthcare development'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
