'use client'
import Provider from './Providers';
import ToasterContext from '../context/ToasterContext';
import './globals.css';
import { Inter } from 'next/font/google';
import RouteLayout from './(routes)/RouteLayout.jsx';

const inter = Inter({ subsets: ['latin'] })

//export const metadata = {
  //title: 'Create Next App',
  //description: 'Generated by create next app',
//}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Create Next Aoo</title>
        <meta name='Generated by create next app' content='Generated by create next app' />
      </head>
      <body className={inter.className}>
        <Provider>
          <ToasterContext />
            {children}
        </Provider>
        </body>
    </html>
  )
}
