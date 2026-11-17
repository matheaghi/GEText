import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEText — Lyrics Rehearsal',
  description: 'Mobile-first line-by-line lyrics rehearsal app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
}

// Runs before first paint: use the saved choice, otherwise follow the phone/OS setting.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
        <body className="min-h-[100dvh] bg-stone-100 text-stone-800 antialiased dark:bg-stone-900 dark:text-stone-100">
          {children}
        </body>
    </html>
  )
}
