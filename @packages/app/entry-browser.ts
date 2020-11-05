import { createApp } from "./app"

const startClient = async (): Promise<void> => {
  const { app } = await createApp({
    url: window.location.pathname,
    mode: "client",
  })

  app.mount("#app")
  window.factorReady = true
}

startClient()
