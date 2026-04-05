import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Local Claude Chat',
  description: 'Ruang diskusi personal dengan Claude AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-jakarta antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
