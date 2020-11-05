import appServer from "./dist/server/_assets/entry-server"
import express from "express"
import { renderToString } from "@vue/server-renderer"

const server = express()

const runServer = async (): Promise<void> => {
  server.get(
    "*",
    async (request, response): Promise<void> => {
      const app = await appServer({ url: request.url })

      const page = await renderToString(app)

      response.status(200).send(page).end()
    },
  )

  console.log("started server on port 8080")
  server.listen(8080)
}

runServer()
