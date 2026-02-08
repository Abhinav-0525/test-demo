import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionInitializer from '@/components/SessionInitializer'
import React from 'react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ASBL - Building Tomorrow\'s Infrastructure',
  description: 'Leading construction company specializing in innovative and sustainable building solutions',
  keywords: 'construction, infrastructure, building, ASBL, commercial, residential',
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/image.png" />
      <body className={inter.className}>
        <SessionInitializer />
        {children}
      </body>
    </html>
  )
}