<template>
  <div
    v-if="!studioComponent && !loadError"
    class="fixed inset-0 z-[9000] flex items-center justify-center bg-[#FDFCF8]"
  >
    <div
      class="rounded-full border border-[#4A3B32]/12 bg-[#FDFCF8]/88 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-[#4A3B32]/72"
      :class="isSafariLike ? 'safari-no-backdrop safari-light-shadow safari-webkit-layer' : ''"
      style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
    >
      Opening Curator Studio
    </div>
  </div>

  <div
    v-else-if="loadError"
    class="fixed inset-0 z-[9000] flex items-center justify-center bg-[#FDFCF8] px-6"
  >
    <div class="max-w-[420px] rounded-[28px] border border-[#4A3B32]/12 bg-[#FFF9F3] p-8 text-center text-[#2D2422] shadow-[0_20px_45px_rgba(74,59,50,0.12)]">
      <p class="font-display text-[32px] leading-none tracking-[-0.03em]">
        打开失败
      </p>
      <p class="mt-3 font-body text-[14px] leading-relaxed text-[#5C4D49]">
        作品空间资源加载时遇到了一点问题，请重试一次。
      </p>
      <button
        type="button"
        class="mt-6 inline-flex items-center justify-center rounded-full border border-[#4A3B32]/18 bg-[#FFB085]/16 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#2D2422]"
        @click="retryLoad"
      >
        Retry
      </button>
    </div>
  </div>

  <component
    :is="studioComponent"
    v-else
    class="fixed inset-0 z-[9000]"
  />
</template>

<script setup>
import { onMounted, shallowRef } from "vue";
import { useIsSafari } from "../composables/useIsSafari";
import {
  getLoadedCuratorStudio,
  loadCuratorStudio,
  resetCuratorStudioLoader,
} from "../composables/useStudioLoader";

const studioComponent = shallowRef(getLoadedCuratorStudio());
const loadError = shallowRef(null);
const { isSafariLike, isIOS } = useIsSafari();

async function startLoading() {
  if (studioComponent.value) return;

  try {
    studioComponent.value = await loadCuratorStudio({
      deferToNextFrame: true,
      delayMs: isIOS.value ? 120 : isSafariLike.value ? 90 : 0,
    });
    loadError.value = null;
  } catch (error) {
    loadError.value = error;
  }
}

async function retryLoad() {
  studioComponent.value = null;
  loadError.value = null;
  resetCuratorStudioLoader();
  await startLoading();
}

onMounted(() => {
  void startLoading();
});
</script>
