import { setupApp } from "./create"

const startClient = async (): Promise<void> => {
  const { app } = await setupApp({
    url: window.location.pathname,
    mode: "client",
  })

  app.mount("#app")
}

startClient()
