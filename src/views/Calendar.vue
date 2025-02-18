<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <div class="px-2 sm:px-4 lg:px-8 py-1.5 flex-none">
      <!-- Mobile Layout -->
      <div class="flex flex-col gap-2 sm:hidden">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#012928] text-white rounded-lg hover:bg-[#012928]/90 transition-colors text-sm"
          @click="showEventModal = true"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Novo Evento</span>
        </button>

        <div class="flex items-center justify-between">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-white text-[#012928] border border-[#012928] rounded-lg hover:bg-[#012928]/5 transition-colors text-sm"
            @click="goToToday"
          >
            <CalendarDaysIcon class="w-4 h-4" />
            <span>Hoje</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="p-1.5 text-[#012928] hover:bg-[#012928]/5 rounded-lg transition-colors"
              @click="previousMonth"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <h2 class="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
            </h2>
            <button
              type="button"
              class="p-1.5 text-[#012928] hover:bg-[#012928]/5 rounded-lg transition-colors"
              @click="nextMonth"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#012928] text-white rounded-lg hover:bg-[#012928]/90 transition-colors text-sm"
              @click="showEventModal = true"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Novo Evento</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#012928] border border-[#012928] rounded-lg hover:bg-[#012928]/5 transition-colors text-sm"
              @click="goToToday"
            >
              <CalendarDaysIcon class="w-4 h-4" />
              <span>Hoje</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-1.5 text-[#012928] hover:bg-[#012928]/5 rounded-lg transition-colors"
              @click="previousMonth"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <h2 class="text-base font-medium text-gray-900 min-w-[120px] text-center">
              {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
            </h2>
            <button
              type="button"
              class="p-1.5 text-[#012928] hover:bg-[#012928]/5 rounded-lg transition-colors"
              @click="nextMonth"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col lg:flex-row px-2 sm:px-4 lg:px-8 pt-2 min-h-0 gap-4">
      <div class="flex-1 min-w-0">
        <div class="bg-white rounded-lg shadow border h-full flex flex-col">
          <div class="grid grid-cols-7 bg-white">
            <div
              v-for="day in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']"
              :key="day"
              class="py-1 text-center text-xs font-medium text-gray-700 bg-gray-50 sm:hidden"
            >
              {{ day }}
            </div>
            <div
              v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
              :key="day"
              class="py-1 text-center text-xs font-medium text-gray-700 bg-gray-50 hidden sm:block"
            >
              {{ day }}
            </div>
          </div>

          <div class="grid grid-cols-7 grid-rows-6 flex-1">
            <template v-for="week in getCalendarDays()" :key="week[0]?.date">
              <div
                v-for="day in week"
                :key="day?.date"
                class="border-b border-r relative"
                :class="{
                  'bg-gray-50': !day,
                  'hover:bg-gray-50': day
                }"
                @click="day && showDayEvents(day.date)"
              >
                <div v-if="day" class="h-full flex flex-col p-0.5">
                  <div class="flex-none">
                    <span
                      class="inline-flex items-center justify-center w-4 h-4 text-xs"
                      :class="{
                        'rounded-full bg-[#012928] text-white': isToday(day.date),
                        'text-gray-900': !isToday(day.date)
                      }"
                    >
                      {{ day.date.getDate() }}
                    </span>
                  </div>
                  
                  <div class="mt-0.5 space-y-0.5 flex-1">
                    <div
                      v-for="(event, index) in day.events.slice(0, 2)"
                      :key="event.id"
                      class="px-1 py-0.5 rounded text-xs sm:text-sm font-medium hover:shadow-sm transition-all"
                      :class="getEventTypeInfo(event.type).bgClass"
                    >
                      <div class="flex items-center gap-0.5 min-w-0">
                        <span class="font-semibold whitespace-nowrap">{{ formatTime(event.startTime) }}</span>
                        <span class="truncate hidden sm:inline">{{ event.title }}</span>
                        <span class="truncate sm:hidden">{{ event.title.slice(0, 10) }}{{ event.title.length > 10 ? '...' : '' }}</span>
                      </div>
                    </div>
                    <div 
                      v-if="day.events.length > 2" 
                      class="text-xs sm:text-sm text-gray-500 px-1"
                    >
                      +{{ day.events.length - 2 }} mais
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div
        v-if="showDayPanel"
        class="lg:w-[400px] bg-white rounded-lg shadow border flex flex-col flex-none"
      >
        <DayEventsPanel
          :date="selectedDate"
          :events="selectedDateEvents"
          @close="showDayPanel = false"
          @edit="editEvent"
          @delete="deleteEvent"
        />
      </div>
    </div>

    <EventModal
      v-if="showEventModal"
      :show="showEventModal"
      :editing-event="editingEvent"
      @close="closeModal"
      @save="handleSaveEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import EventModal from '../components/EventModal.vue';
import DayEventsPanel from '../components/DayEventsPanel.vue';
import { useAuthStore } from '../stores/auth';
import { meetingService } from '../services/meetingService';
import { logger } from '../utils/logger';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/solid';

const authStore = useAuthStore();
const currentDate = ref(new Date());
const showEventModal = ref(false);
const editingEvent = ref(null);
const meetings = ref([]);
const showDayPanel = ref(false);
const selectedDate = ref<Date | null>(null);

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Navegação
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
  loadEvents();
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
  loadEvents();
};

const goToToday = () => {
  currentDate.value = new Date();
  showDayEvents(currentDate.value);
};

const showDayEvents = (date: Date) => {
  selectedDate.value = date;
  showDayPanel.value = true;
};

// Eventos
const loadEvents = async () => {
  try {
    if (!authStore.user) return;

    const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
    const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

    // Converter para YYYY-MM-DD sem ajuste de fuso horário
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    meetings.value = await meetingService.getMeetingsByDateRange(
      startDate,
      endDate
    );
  } catch (error) {
    logger.error('Erro ao carregar eventos:', error);
  }
};

const getCalendarDays = () => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  const weeks = [];
  let week = Array(7).fill(null);
  let dayCount = 1;

  // Primeira semana
  for (let i = firstDay; i < 7; i++) {
    const date = new Date(year, month, dayCount);
    week[i] = {
      date,
      events: getEventsForDate(date)
    };
    dayCount++;
  }
  weeks.push(week);

  // Semanas do meio
  while (dayCount <= lastDate) {
    week = Array(7).fill(null);
    for (let i = 0; i < 7 && dayCount <= lastDate; i++) {
      const date = new Date(year, month, dayCount);
      week[i] = {
        date,
        events: getEventsForDate(date)
      };
      dayCount++;
    }
    weeks.push(week);
  }

  return weeks;
};

const getEventsForDate = (date: Date) => {
  if (!meetings.value) return [];
  
  const dateStr = date.toISOString().split('T')[0];
  return meetings.value
    .filter(meeting => meeting.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const formatEventTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getEventTypeInfo = (type: string) => {
  switch (type) {
    case 'meeting':
      return {
        icon: UserGroupIcon,
        text: 'Reunião',
        bgClass: 'bg-blue-50 border-l-4 border-blue-500'
      };
    case 'showing':
      return {
        icon: HomeIcon,
        text: 'Visita',
        bgClass: 'bg-green-50 border-l-4 border-green-500'
      };
    case 'open-house':
      return {
        icon: BuildingOfficeIcon,
        text: 'Open House',
        bgClass: 'bg-purple-50 border-l-4 border-purple-500'
      };
    default:
      return {
        icon: UserGroupIcon,
        text: 'Evento',
        bgClass: 'bg-gray-50 border-l-4 border-gray-500'
      };
  }
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const isToday = (date?: Date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const editEvent = (event: any) => {
  editingEvent.value = event;
  showEventModal.value = true;
};

const deleteEvent = async (event: any) => {
  if (!confirm('Tem certeza que deseja excluir este evento?')) return;

  try {
    await meetingService.deleteMeeting(event.id);
    await loadEvents();
  } catch (error) {
    logger.error('Erro ao excluir evento:', error);
  }
};

const closeModal = () => {
  showEventModal.value = false;
  editingEvent.value = null;
};

const handleSaveEvent = async (eventData: any) => {
  try {
    if (eventData.id) {
      await meetingService.updateMeeting(eventData.id, eventData);
    } else {
      await meetingService.createMeeting(eventData);
    }
    
    await loadEvents();
    showEventModal.value = false;
  } catch (error) {
    logger.error('Erro ao salvar evento:', error);
  }
};

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  return getEventsForDate(selectedDate.value);
});

// Carregar eventos iniciais e mostrar painel do dia
onMounted(async () => {
  await loadEvents();
  // Mostrar eventos do dia atual
  const today = new Date();
  showDayEvents(today);
});
</script>
