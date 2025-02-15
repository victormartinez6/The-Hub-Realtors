import { defineStore } from 'pinia';
import { eventService, type Event } from '../services/eventService';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as Event[],
    loading: false,
    error: null as string | null,
    filters: {
      startDate: null as Date | null,
      endDate: null as Date | null,
      type: 'all' as 'visita' | 'reuniao' | 'contrato' | 'all'
    }
  }),

  getters: {
    upcomingEvents: (state) => {
      const now = new Date();
      return state.events
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    pastEvents: (state) => {
      const now = new Date();
      return state.events
        .filter(event => new Date(event.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    todayEvents: (state) => {
      const today = new Date();
      return state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === today.getDate() &&
               eventDate.getMonth() === today.getMonth() &&
               eventDate.getFullYear() === today.getFullYear();
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    filteredEvents: (state) => {
      return state.events.filter(event => {
        // Filtrar por tipo
        if (state.filters.type !== 'all' && event.type !== state.filters.type) {
          return false;
        }

        // Filtrar por data inicial
        if (state.filters.startDate && new Date(event.date) < state.filters.startDate) {
          return false;
        }

        // Filtrar por data final
        if (state.filters.endDate && new Date(event.date) > state.filters.endDate) {
          return false;
        }

        return true;
      });
    }
  },

  actions: {
    async fetchEvents() {
      this.loading = true;
      this.error = null;
      try {
        const fetchedEvents = await eventService.getEvents();
        // Ordenar eventos por data (mais próximos primeiro)
        this.events = fetchedEvents.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        this.error = 'Erro ao carregar eventos';
        // Carregar do localStorage como fallback
        const savedEvents = localStorage.getItem('events');
        if (savedEvents) {
          this.events = JSON.parse(savedEvents);
        }
      } finally {
        this.loading = false;
      }
    },

    async addEvent(eventData: Omit<Event, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        // Criar evento no Firestore
        const newEvent = await eventService.addEvent(eventData);
        
        // Adicionar ao estado local
        this.events.push(newEvent);
        // Reordenar eventos por data
        this.events.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.saveToStorage();
        
        return newEvent;
      } catch (err) {
        console.error('Erro ao adicionar evento:', err);
        this.error = 'Erro ao adicionar evento';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateEvent(id: string, data: Partial<Event>) {
      this.loading = true;
      this.error = null;
      try {
        // Atualizar no Firestore
        const updatedEvent = await eventService.updateEvent(id, data);
        
        // Atualizar no estado local
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
          this.events[index] = { ...this.events[index], ...updatedEvent };
        }
        // Reordenar eventos por data
        this.events.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        this.saveToStorage();
        return updatedEvent;
      } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        this.error = 'Erro ao atualizar evento';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteEvent(id: string) {
      this.loading = true;
      this.error = null;
      try {
        // Verificar se o evento existe
        const exists = await eventService.checkEventExists(id);
        if (!exists) {
          throw new Error('Evento não encontrado');
        }

        // Excluir do Firestore
        await eventService.deleteEvent(id);
        
        // Excluir do estado local
        this.events = this.events.filter(e => e.id !== id);
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao excluir evento:', err);
        this.error = 'Erro ao excluir evento';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async markAsCompleted(id: string, notes?: string) {
      this.loading = true;
      this.error = null;
      try {
        const updatedEvent = await eventService.markAsCompleted(id, notes);
        
        // Atualizar no estado local
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
          this.events[index] = { ...this.events[index], ...updatedEvent };
        }
        
        this.saveToStorage();
        return updatedEvent;
      } catch (err) {
        console.error('Erro ao marcar evento como concluído:', err);
        this.error = 'Erro ao marcar evento como concluído';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {
        startDate: null,
        endDate: null,
        type: 'all'
      };
    },

    // Mantemos o localStorage como backup
    saveToStorage() {
      localStorage.setItem('events', JSON.stringify(this.events));
    }
  }
});
