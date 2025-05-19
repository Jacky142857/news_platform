import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  // You could add global context providers here
  // For example, for authentication, theme, or data fetching state
  
  return (
    <>
      {/* Any global components like headers or navigation would go here */}
      <Component {...pageProps} />
      {/* Any global footers would go here */}
    </>
  )
}

export default MyApp