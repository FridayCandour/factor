//import replace from "@rollup/plugin-replace"
import { ssrBuild, build } from "vite"
export const run = async () => {
  console.log("RUN")
  const clientResult = await build({
    outDir: `${__dirname}/dist/client`,
    rollupInputOptions: {
      input: `${__dirname}/entry-client.ts`,
    },
  })

  console.log("RES", clientResult)

  await ssrBuild({
    outDir: `${__dirname}/dist/server`,
    emitManifest: true,
    emitAssets: true,
    rollupInputOptions: {
      input: `${__dirname}/entry-server.ts`,
      preserveEntrySignatures: "strict",

      // plugins: [
      //   replace({
      //     __HTML__: clientResult[0].html.replace(
      //       '<div id="app">',
      //       '<div id="app" data-server-rendered="true">${html}',
      //     ),
      //   }),
      // ],
    },
  })
}

run()
