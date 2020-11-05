import { App } from "vue"
import { createApp } from "./app"
import { handleContext } from "./ssr-context"
import { ServerRenderContext } from "./types"

/**
 * This exported function will be called by `bundleRenderer`
 * this function is expected to return a Promise that resolves to the app instance.
 * https://ssr.vuejs.org/guide/structure.html#entry-server-js
 */
export default async (context: ServerRenderContext): Promise<App> => {
  const { app } = await createApp({
    url: context.url,
    mode: "server",
  })

  //await handleContext({ context, app, router })

  return app
}
