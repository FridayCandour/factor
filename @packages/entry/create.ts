import { createSSRApp } from "vue"
import { ApplicationComponents } from "./types"
import createRouter from "./router"
import AppComponent from "./App.vue"

export const setupApp = async ({
  url = "/",
  mode,
}: {
  url?: string
  mode: "client" | "server"
}): Promise<ApplicationComponents> => {
  const router = createRouter(mode)

  const app = createSSRApp(AppComponent)

  app.use(router)

  router.push(url)

  await router.isReady()

  /**
   * @note
   * we are not mounting the app here, since bootstrapping will be
   * different depending on whether we are in a browser or on the server.
   */
  return { app, router, context: { url } }
}
