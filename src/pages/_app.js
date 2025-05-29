/* eslint-env browser */
import React from 'react'
import { Provider } from 'react-redux'
import { parse } from 'cookie'
import App from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'

import store from '../redux/makeStore'
import AppContainer from '../components/AppContainer'
import { ThemeProvider } from '../components/ThemeProvider'

import '../components/darkmode.scss'

// We add this during SSR in _document.js
config.autoAddCss = false

function MyApp({ Component, pageProps, isDarkMode, router }) {
  return (
    <Provider store={store}>
      <ThemeProvider isDarkMode={isDarkMode}>
        <AppContainer>
          <Component {...pageProps} key={router.route} />
        </AppContainer>
      </ThemeProvider>
    </Provider>
  )
}

MyApp.getInitialProps = async appContext => {
  const { Component, ctx } = appContext
  const appProps = await App.getInitialProps(appContext)

  const cookieHeader = ctx.req?.headers?.cookie ?? ''
  const cookies = parse(cookieHeader)
  const isDarkMode = cookies.darkmode === 'true'

  return {
    ...appProps,
    isDarkMode,
  }
}

export default MyApp
