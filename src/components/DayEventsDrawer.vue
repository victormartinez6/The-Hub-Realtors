<template>
  <div
    v-if="show"
    class="fixed inset-0 overflow-hidden z-50"
    @click="$emit('close')"
  >
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      ></div>

      <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          class="pointer-events-auto w-screen max-w-md"
          @click.stop
        >
          <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            <div class="bg-[#012928] px-4 py-6 sm:px-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-medium text-white">
                  Eventos do dia {{ formatDate(selectedDate) }}
                </h2>
                <button
                  type="button"
                  class="rounded-md text-white hover:text-gray-200"
                  @click="$emit('close')"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="relative flex-1 px-4 py-6 sm:px-6">
              <!-- Lista de eventos -->
              <div v-if="events.length > 0" class="space-y-4">
                <div
                  v-for="event in events"
                  :key="event.id"
                  class="bg-white rounded-lg border p-4 group"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-medium">{{ event.title }}</h3>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                      </p>
                      <p v-if="event.description" class="mt-2 text-gray-700">
                        {{ event.description }}
                      </p>
                      <div v-if="event.location" class="mt-2 text-sm text-gray-500">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        {{ event.location }}
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        @click="$emit('edit', event)"
                        class="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="$emit('delete', event)"
                        class="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Excluir"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensagem quando não há eventos -->
              <div
                v-else
                class="text-center text-gray-500 py-8"
              >
                Nenhum evento agendado para este dia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  show: boolean;
  selectedDate: Date;
  events: any[];
}>();

defineEmits(['close', 'edit', 'delete']);

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
