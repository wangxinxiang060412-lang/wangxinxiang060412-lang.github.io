import { onMounted, onUnmounted, ref } from "vue";
import { cancelIdleTask, scheduleIdleTask } from "./useIdleTask";

export function useLazyMount(options = {}) {
  const {
    initial = false,
    rootMargin = "320px 0px",
    idleTimeout = null,
  } = options;

  const targetRef = ref(null);
  const isMounted = ref(Boolean(initial));

  let observer = null;
  let idleTask = null;

  const cleanup = () => {
    observer?.disconnect();
    observer = null;
    cancelIdleTask(idleTask);
    idleTask = null;
  };

  const mount = () => {
    if (isMounted.value) return;
    isMounted.value = true;
    cleanup();
  };

  onMounted(() => {
    if (isMounted.value) return;

    if (idleTimeout !== null) {
      idleTask = scheduleIdleTask(() => {
        mount();
      }, idleTimeout);
    }

    if (typeof IntersectionObserver !== "function") {
      mount();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          mount();
        }
      },
      { rootMargin },
    );

    if (targetRef.value) {
      observer.observe(targetRef.value);
    }
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    targetRef,
    isMounted,
    mount,
  };
}
