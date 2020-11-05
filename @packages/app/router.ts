import { createRouter, createWebHistory, createMemoryHistory } from "vue-router"

export default (type: "client" | "server") => {
  const routerHistory =
    type === "client" ? createWebHistory() : createMemoryHistory()

  return createRouter({
    history: routerHistory,
    routes: [
      {
        path: "/",
        component: () => import("./components/Homepage.vue"),
        props: true,
      },
      {
        path: "/a",
        component: () => import("./components/PageA.vue"),
        props: true,
      },
      {
        path: "/b",
        component: () => import("./components/PageB.vue"),
        props: true,
      },
    ],
  })
}
