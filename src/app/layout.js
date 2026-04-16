import { Cinzel, Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  style: ['normal','italic'],
  variable: '--font-cormorant',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400','700'],
  variable: '--font-cinzel',
});

const cigra = localFont({
  src: '../../public/fonts/cigra.ttf',
  variable: '--font-cigra',
});

export const metadata = {
  title: 'Wedding Invitation | Ameerali & Aslaha Thasni',
  description: 'You are cordially invited to the wedding of Ameerali and Aslaha Thasni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Boldonse&family=Delius+Swash+Caps&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${cormorant.variable} ${cinzel.variable} ${cigra.variable}`}>
        {/* Outer Background Flowers */}
        <img src="/images/flower.svg" alt="" className="bg-flower bg-flower-tl" />
        <img src="/images/flower.svg" alt="" className="bg-flower bg-flower-br" />
        
        {children}
      </body>
    </html>
  );
}
