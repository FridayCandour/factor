import { App } from "vue"
import { setupApp } from "./create"
import { ServerRenderContext } from "./types"

export default async (context: ServerRenderContext): Promise<App> => {
  const { app } = await setupApp({
    url: context.url,
    mode: "server",
  })

  //await handleContext({ context, app, router })

  return app
}
