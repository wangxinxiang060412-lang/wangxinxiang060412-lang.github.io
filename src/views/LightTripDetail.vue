<template>
  <div class="min-h-screen bg-[#FDFCF8]"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { isStudioOpen } from "../composables/useStudio";

const router = useRouter();

onMounted(() => {
  void router.currentRoute.value;
  isStudioOpen.value = true;
});

onUnmounted(() => {
  isStudioOpen.value = false;
});
</script>
