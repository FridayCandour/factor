// import "@factor/app"
// import "@factor/meta"
// import "@factor/api" // prevent load order issues

import { createSSRApp } from "vue"
import { ApplicationComponents } from "./types"
import createRouter from "./router"
//import VueRouter from "vue-router"
//import Vuex from "vuex"
//import VueMeta from "vue-meta"
// import { emitEvent } from "@factor/api/events"
// import { createFactorRouter } from "@factor/app/router"
// //import { createFactorStore } from "@factor/app/store"
// import { runCallbacks, applyFilters } from "@factor/api/hooks"
// import { setting } from "@factor/api/settings"
//import { extendApp } from "./extend-app"

/**
 * Expose a factory function that creates a fresh set of store, router,
 * app instances on each call (which is called for each SSR request)
 */
export const createApp = async ({
  url = "/",
  mode,
}: {
  url?: string
  mode: "client" | "server"
}): Promise<ApplicationComponents> => {
  process.env.FACTOR_TARGET = "app"

  const router = createRouter(mode)

  const app = createSSRApp(() => import("./App.vue"))

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
