// app/layout.js
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import CartDrawer from '@/components/CartDrawer'; 
import './globals.css';

export const metadata = {
  title: 'ZIDAN Luxury House',
  description: 'Crafting Eternity. Defining Prestige.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer /> 
          
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                fontFamily: 'serif',
                fontSize: '12px',
                letterSpacing: '0.1em',
                borderRadius: '0',
              },
            }}
          />
        </CartProvider>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
