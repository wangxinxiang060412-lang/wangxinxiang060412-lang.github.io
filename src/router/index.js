import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../views/HomeView.vue") },
  { path: "/work", component: () => import("../views/HomeView.vue") },
  {
    path: "/work/lighttrip-curator",
    component: () => import("../views/LightTripDetail.vue"),
  },
  { path: "/work/lighttrip", redirect: "/work/lighttrip-curator" },
  {
    path: "/pixel-buddy",
    name: "pixel-buddy",
    component: () => import("../views/PixelBuddyDetail.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
