<template>
  <div
    ref="targetRef"
    :id="anchorId || undefined"
    class="lazy-mount-shell"
    :style="shellStyle"
  >
    <component
      :is="is"
      v-if="isMounted"
      v-bind="componentProps"
    />
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useLazyMount } from "../composables/useLazyMount";

const props = defineProps({
  is: {
    type: [Object, Function],
    required: true,
  },
  componentProps: {
    type: Object,
    default: () => ({}),
  },
  minHeight: {
    type: String,
    default: "",
  },
  rootMargin: {
    type: String,
    default: "320px 0px",
  },
  anchorId: {
    type: String,
    default: "",
  },
  idleTimeout: {
    type: Number,
    default: null,
  },
  initial: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["mounted"]);

const { targetRef, isMounted, mount } = useLazyMount({
  initial: props.initial,
  rootMargin: props.rootMargin,
  idleTimeout: props.idleTimeout,
});

const shellStyle = computed(() => ({
  minHeight: !isMounted.value && props.minHeight ? props.minHeight : undefined,
  containIntrinsicSize: props.minHeight || undefined,
  contentVisibility: "auto",
}));

watch(
  isMounted,
  (value) => {
    if (value) emit("mounted");
  },
  { immediate: true },
);

defineExpose({ mount });
</script>
