<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-gray-900">
            Eventos do Dia - {{ formatDate(date) }}
          </h2>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
      <div v-if="!sortedEvents.length" class="text-center text-gray-500 py-8">
        Nenhum evento agendado para este dia.
      </div>

      <div
        v-for="event in sortedEvents"
        :key="event.id"
        class="bg-white rounded-lg shadow p-4 hover:bg-[#012928]/5 hover:shadow-lg hover:border-[#012928]/20 border border-transparent transition-all duration-200"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <component 
                :is="getEventTypeIcon(event.type)"
                class="w-5 h-5 text-[#012928] transition-transform"
              />
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ event.title }}
              </h3>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4 transition-colors" />
                <span class="transition-colors">
                  {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                </span>
              </div>

              <div v-if="event.location || event.isOnlineMeeting" class="flex items-center gap-2">
                <component 
                  :is="event.isOnlineMeeting ? VideoCameraIcon : MapPinIcon"
                  class="w-4 h-4 transition-colors"
                />
                <span v-if="!event.isOnlineMeeting" class="truncate transition-colors">
                  {{ event.location }}
                </span>
                <a
                  v-else
                  :href="event.meetingUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[#012928] hover:text-[#012928]/80 underline truncate font-medium"
                  @click.stop
                >
                  Entrar na reunião
                </a>
              </div>

              <div v-if="event.notes" class="flex items-start gap-2">
                <DocumentTextIcon class="w-4 h-4 mt-0.5 transition-colors" />
                <p class="text-gray-600 transition-colors">{{ event.notes }}</p>
              </div>

              <div v-if="event.attendees?.length" class="flex items-start gap-2 mt-3">
                <UserGroupIcon class="w-4 h-4 mt-1 text-[#012928] transition-colors" />
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="(attendee, index) in event.attendees"
                    :key="index"
                    class="relative"
                    @mouseenter="showTooltip = { eventId: event.id, index }"
                    @mouseleave="showTooltip = null"
                  >
                    <div
                      class="w-7 h-7 rounded-full bg-[#012928]/10 text-[#012928] flex items-center justify-center text-xs font-medium uppercase hover:bg-[#012928]/20 transition-colors"
                    >
                      {{ getInitials(attendee) }}
                    </div>
                    
                    <!-- Tooltip -->
                    <div 
                      v-if="showTooltip?.eventId === event.id && showTooltip?.index === index"
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 max-w-[200px] truncate"
                    >
                      {{ attendee }}
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 ml-4 opacity-80 transition-opacity">
            <button
              @click="$emit('edit', event)"
              class="p-1.5 text-[#012928] hover:bg-[#012928]/10 rounded transition-all hover:scale-110"
              title="Editar"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', event)"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all hover:scale-110"
              title="Excluir"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ClockIcon, 
  MapPinIcon, 
  VideoCameraIcon, 
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/vue/24/solid';

const props = defineProps<{
  date: Date;
  events: Meeting[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'edit', event: Meeting): void;
  (e: 'delete', event: Meeting): void;
}>();

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => a.startTime.localeCompare(b.startTime));
});

const formatDate = (date: Date) => {
  if (!date) return '';
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'meeting':
      return UserGroupIcon;
    case 'showing':
      return HomeIcon;
    case 'open-house':
      return BuildingOfficeIcon;
    default:
      return DocumentTextIcon;
  }
};

const getInitials = (email: string) => {
  // Remove o domínio do email
  const name = email.split('@')[0];
  // Separa por pontos, underscores ou hífens
  const parts = name.split(/[._-]/);
  // Pega a primeira letra de cada parte
  return parts.map(part => part[0]).join('').toUpperCase();
};

interface TooltipState {
  eventId: string;
  index: number;
}

const showTooltip = ref<TooltipState | null>(null);
</script>

<style scoped>
/* Usando escape com \ para caracteres especiais */
.tooltip:hover {
  z-index: 50;
}
</style>
