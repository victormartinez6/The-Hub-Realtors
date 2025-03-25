<template>
  <Teleport to="body">
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
    </Transition>

    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="show" class="fixed inset-0 z-20 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0" @click.self="emit('cancel')">
          <div
            class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          >
            <div class="text-center sm:text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="getIconBackgroundStyle()">
                <component :is="getIcon()" class="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {{ props.title }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ props.message }}
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                style="min-width: 120px;"
                @click="emit('cancel')"
                :aria-label="props.cancelText"
              >
                {{ props.cancelText }}
              </button>
              <button
                type="button"
                :class="[
                  getButtonStyle(),
                  'inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
                ]"
                style="min-width: 120px;"
                @click="emit('confirm')"
                :aria-label="props.confirmText"
              >
                {{ props.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Definição dos componentes de ícones
const DangerIcon = {
  template: `<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>`
};

const WarningIcon = {
  template: `<svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>`
};

const InfoIcon = {
  template: `<svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>`
};

const SuccessIcon = {
  template: `<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`
};

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value: string) => ['warning', 'danger', 'info', 'success'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const getIconBackgroundStyle = () => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100';
    case 'warning':
      return 'bg-amber-100';
    case 'info':
      return 'bg-blue-100';
    case 'success':
      return 'bg-green-100';
    default:
      return 'bg-blue-100';
  }
};

const getIcon = () => {
  switch (props.type) {
    case 'danger':
      return DangerIcon;
    case 'warning':
      return WarningIcon;
    case 'info':
      return InfoIcon;
    case 'success':
      return SuccessIcon;
    default:
      return InfoIcon;
  }
};

const getButtonStyle = () => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
    case 'info':
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    case 'success':
      return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    default:
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  }
};
</script>
