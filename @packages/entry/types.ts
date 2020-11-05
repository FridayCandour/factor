import { App } from "vue"
import { Router } from "vue-router"

export interface ServerRenderContext {
  url: string
  state?: Record<string, any>
  [key: string]: any
}

export interface ApplicationComponents {
  app: App
  router: Router
  context: ServerRenderContext
}
