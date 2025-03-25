<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-50 bg-opacity-75 backdrop-blur-[8px]" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-lg transition-all border border-gray-100 ring-1 ring-black ring-opacity-5">
              <DialogTitle as="h3" class="text-xl font-medium leading-6 text-[#012928] border-b border-gray-200 p-6">
                <slot name="title"></slot>
              </DialogTitle>

              <div class="p-6">
                <slot name="content"></slot>
              </div>

              <!-- Modal footer -->
              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <slot name="footer"></slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

defineProps<{
  show: boolean
}>();

defineEmits<{
  (e: 'close'): void
}>();
</script>

<style scoped>
/* Estilização da scrollbar */
.scrollbar {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #012928 transparent; /* Firefox */
}

/* Webkit (Chrome, Safari, Edge) */
.scrollbar::-webkit-scrollbar {
  width: 8px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: #01292880;
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #012928;
  border: 2px solid transparent;
  background-clip: padding-box;
}
</style>
