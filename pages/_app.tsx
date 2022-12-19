import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { client } from '../wagmi'
import Layout from '../components/Layout/Layout'
import { NotificationProvider } from '../contexts/Notification'
import Spinner from '../components/Layout/Spinner'
import { Provider, WebSocketProvider } from '@wagmi/core'

function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>Alcantara - Cross Chain Swap</title>
      </NextHead>
      <Layout>
        <NotificationProvider> 
            {
              mounted ? (
                <Component {...pageProps} />
                ) : (
                <div className='bg-slate-800 h-screen flex items-center justify-center'>
                  <Spinner className='h-10 w-10 text-slate-100'/>
                </div>
              )
            }
        </NotificationProvider> 
      </Layout>
    </WagmiConfig>
  )
}

export default App