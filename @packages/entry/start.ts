const sfc = require("@vue/compiler-sfc")
import * as ts from "typescript"

require("require-extension-hooks")(".vue").push(function ({
  content,
  filename,
}: any) {
  const {
    descriptor: { template, script },
  } = sfc.parse(content)

  console.log("R", { template, script })

  const comp = Object.assign(
    { template: template.content },
    ts.transpile(script.content),
  )

  console.log("ts.transpile(script.content)", ts.transpile(script.content))
  return {
    filename: `${filename}.ts`,
    content: `module.exports = ${JSON.stringify(comp)}`,
  }
})

const r = require("./App.vue")

console.log("R", r)
