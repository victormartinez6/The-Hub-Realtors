<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>
          <PlusIcon class="w-4 h-4" />
          {{ isEditing ? 'Editar Evento' : 'Novo Evento' }}
        </h2>
        <button @click="emit('close')" class="close-button">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="compact-form">
        <div class="form-row">
          <!-- Título -->
          <div class="form-group flex-2">
            <label>
              <UserGroupIcon class="w-4 h-4" />
              Título
            </label>
            <input v-model="title" type="text" required placeholder="Nome do evento" />
          </div>

          <!-- Tipo -->
          <div class="form-group flex-1">
            <label>
              <HomeIcon class="w-4 h-4" />
              Tipo
            </label>
            <select v-model="type">
              <option value="meeting">Reunião</option>
              <option value="showing">Visita</option>
              <option value="open-house">Open House</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <!-- Data -->
          <div class="form-group">
            <label>
              <MapPinIcon class="w-4 h-4" />
              Data
            </label>
            <input v-model="date" type="date" required />
          </div>

          <!-- Hora Início -->
          <div class="form-group">
            <label>
              <VideoCameraIcon class="w-4 h-4" />
              Início
            </label>
            <input v-model="startTime" type="time" required @change="updateEndTime" />
          </div>

          <!-- Hora Fim -->
          <div class="form-group">
            <label>
              <BuildingOfficeIcon class="w-4 h-4" />
              Fim
            </label>
            <input v-model="endTime" type="time" required />
          </div>
        </div>

        <!-- Local -->
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" v-model="isOnlineMeeting" id="isOnline" />
            <label for="isOnline">
              <VideoCameraIcon class="w-4 h-4" v-if="isOnlineMeeting" />
              <MapPinIcon class="w-4 h-4" v-else />
              Reunião Online
            </label>
          </div>
          
          <div class="location-input">
            <template v-if="isOnlineMeeting">
              <input 
                v-model="meetingUrl" 
                type="url" 
                placeholder="Link da reunião"
                required
              />
              <button type="button" @click="generateMeetingUrl" class="secondary-button">
                <PlusIcon class="w-4 h-4" />
                Gerar Link
              </button>
              <button type="button" @click="copyMeetingUrl" class="secondary-button">
                <XMarkIcon class="w-4 h-4" />
                Copiar Link
              </button>
            </template>
            <input 
              v-else 
              v-model="location" 
              type="text" 
              placeholder="Endereço"
              required
            />
          </div>
        </div>

        <!-- Participantes -->
        <div class="form-group">
          <label>
            <UserGroupIcon class="w-4 h-4" />
            Participantes
          </label>
          <div class="participants-input">
            <input
              v-model="participantInput"
              type="text"
              placeholder="Digite um email ou nome de lead"
              @focus="showParticipantsList = true"
              @input="showParticipantsList = true"
              @keydown.enter.prevent="
                if (isValidEmail(participantInput)) {
                  addParticipant({ name: participantInput, email: participantInput });
                }
              "
            />
            
            <!-- Lista de sugestões -->
            <div v-if="showParticipantsList && filteredLeads.length > 0" class="suggestions-list">
              <div
                v-for="lead in filteredLeads"
                :key="lead.email"
                class="suggestion-item"
                @click="addParticipant(lead)"
              >
                <UserGroupIcon class="w-4 h-4" />
                {{ lead.name }} {{ lead.email ? `(${lead.email})` : '' }}
              </div>
            </div>
          </div>
          
          <!-- Lista de participantes selecionados -->
          <div class="selected-participants">
            <div v-for="participant in selectedParticipants" :key="participant.email" class="participant-tag">
              <UserGroupIcon class="w-4 h-4" />
              {{ participant.name }}
              <button type="button" @click="removeParticipant(participant.email)">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Notas -->
        <div class="form-group">
          <label>
            <BuildingOfficeIcon class="w-4 h-4" />
            Notas
          </label>
          <textarea v-model="notes" rows="2" placeholder="Observações adicionais"></textarea>
        </div>

        <!-- Botões -->
        <div class="button-group">
          <button type="button" @click="emit('close')" class="secondary-button">
            <XMarkIcon class="w-4 h-4" />
            Cancelar
          </button>
          <button type="submit" :disabled="isSaving">
            <PlusIcon class="w-4 h-4" v-if="!isEditing" />
            {{ isEditing ? 'Salvar' : 'Criar Evento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLeadsStore } from '../stores/leads';
import type { Meeting } from '../services/meetingService';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, XMarkIcon, UserGroupIcon, HomeIcon, BuildingOfficeIcon, VideoCameraIcon, MapPinIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  show: boolean;
  editingEvent?: Meeting | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', event: Meeting): void;
}>();

// Stores
const authStore = useAuthStore();
const leadStore = useLeadsStore();

// Form fields
const title = ref('');
const date = ref('');
const startTime = ref('');
const endTime = ref('');
const type = ref('meeting');
const location = ref('');
const isOnlineMeeting = ref(false);
const meetingUrl = ref('');
const notes = ref('');
const participantInput = ref('');
const selectedParticipants = ref<Array<{ name: string; email: string }>>([]);
const showParticipantsList = ref(false);
const isSaving = ref(false);
const isEditing = computed(() => !!props.editingEvent);

// Carregar leads quando o modal for montado
onMounted(async () => {
  if (leadStore.leads.length === 0) {
    await leadStore.fetchLeads();
  }
});

// Lista filtrada de leads baseada no input do usuário
const filteredLeads = computed(() => {
  const input = participantInput.value.toLowerCase();
  if (!input) return [];
  
  // Primeiro, verificar se o input é um email válido
  const isEmail = isValidEmail(input);
  if (isEmail) {
    return [{ name: input, email: input }];
  }

  // Depois, filtrar leads existentes
  return leadStore.leads
    .filter(lead => 
      lead.name.toLowerCase().includes(input) || 
      (lead.email && lead.email.toLowerCase().includes(input))
    )
    .map(lead => ({
      name: lead.name,
      email: lead.email || ''
    }))
    .filter(lead => lead.email);
});

const addParticipant = (participant: { name: string; email: string }) => {
  if (!participant.email) return;
  
  const exists = selectedParticipants.value.some(p => p.email === participant.email);
  if (!exists) {
    selectedParticipants.value.push(participant);
  }
  
  participantInput.value = '';
  showParticipantsList.value = false;
};

const removeParticipant = (email: string) => {
  selectedParticipants.value = selectedParticipants.value.filter(p => p.email !== email);
};

const resetForm = () => {
  title.value = '';
  const today = new Date();
  date.value = today.toISOString().split('T')[0];
  startTime.value = '';
  endTime.value = '';
  type.value = 'meeting';
  location.value = '';
  isOnlineMeeting.value = false;
  meetingUrl.value = '';
  notes.value = '';
  selectedParticipants.value = [];
  participantInput.value = '';
};

// Carregar dados do evento para edição
watch(() => props.editingEvent, (newEvent) => {
  if (newEvent) {
    title.value = newEvent.title;
    date.value = newEvent.date;
    startTime.value = newEvent.startTime;
    endTime.value = newEvent.endTime;
    type.value = newEvent.type;
    isOnlineMeeting.value = newEvent.isOnlineMeeting;
    location.value = newEvent.isOnlineMeeting ? '' : (newEvent.location || '');
    meetingUrl.value = newEvent.isOnlineMeeting ? newEvent.meetingUrl || '' : '';
    notes.value = newEvent.notes || '';
    selectedParticipants.value = newEvent.attendees?.map(email => ({ 
      name: email,
      email: email 
    })) || [];
  } else {
    resetForm();
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (isSaving.value) return;
  if (!authStore.user) {
    console.error('Usuário não autenticado');
    return;
  }

  try {
    isSaving.value = true;

    const eventData = {
      id: props.editingEvent?.id,
      title: title.value,
      date: date.value,
      startTime: startTime.value,
      endTime: endTime.value,
      type: type.value,
      location: isOnlineMeeting.value ? null : location.value,
      isOnlineMeeting: isOnlineMeeting.value,
      meetingUrl: isOnlineMeeting.value ? meetingUrl.value : null,
      attendees: selectedParticipants.value.map(p => p.email),
      notes: notes.value,
      userId: authStore.user.uid
    } as Meeting;

    emit('save', eventData);
    resetForm();
    emit('close');
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
  } finally {
    isSaving.value = false;
  }
};

const generateMeetingUrl = () => {
  meetingUrl.value = `https://meet.jit.si/${uuidv4()}`;
};

const copyMeetingUrl = async () => {
  try {
    await navigator.clipboard.writeText(meetingUrl.value);
  } catch (err) {
    console.error('Erro ao copiar link:', err);
  }
};

const updateEndTime = () => {
  if (startTime.value && !endTime.value) {
    const [hours, minutes] = startTime.value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setHours(date.getHours() + 1);
    
    endTime.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Gerar link automaticamente quando selecionar reunião online
watch(isOnlineMeeting, (newValue) => {
  if (newValue && !meetingUrl.value) {
    generateMeetingUrl();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(1, 41, 40, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  scrollbar-width: thin;
  scrollbar-color: #D1D5DB transparent;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: #D1D5DB;
  border-radius: 3px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #F3F4F6;
  border-radius: 0.375rem;
}

.checkbox-group label {
  margin-bottom: 0 !important;
  cursor: pointer;
  user-select: none;
}

.checkbox-group input[type="checkbox"] {
  width: auto !important;
  margin: 0;
  cursor: pointer;
}

.location-input {
  display: flex;
  gap: 0.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

button[type="submit"] {
  background: #012928;
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background: rgba(1, 41, 40, 0.9);
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-button {
  color: #374151;
  background: #F3F4F6;
}

.secondary-button:hover {
  background: #E5E7EB;
}

.participants-input {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #F3F4F6;
}

.selected-participants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.participant-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #F3F4F6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.participant-tag button {
  padding: 0;
  color: #6B7280;
}

.participant-tag button:hover {
  color: #DC2626;
}
</style>
