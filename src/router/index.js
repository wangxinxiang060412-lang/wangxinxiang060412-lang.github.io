import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import PixelBuddyDetail from "../views/PixelBuddyDetail.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/work", component: HomeView },
  {
    path: "/work/lighttrip-curator",
    component: () => import("../views/LightTripDetail.vue"),
  },
  { path: "/work/lighttrip", redirect: "/work/lighttrip-curator" },
  {
    path: "/pixel-buddy",
    name: "pixel-buddy",
    component: PixelBuddyDetail,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
