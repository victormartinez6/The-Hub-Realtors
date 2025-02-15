import { defineStore } from 'pinia';
import { propertyService, type Property } from '../services/propertyService';

export const usePropertiesStore = defineStore('properties', {
  state: () => ({
    properties: [] as Property[],
    loading: false,
    error: null as string | null,
    filters: {
      type: null as string | null,
      minPrice: null as number | null,
      maxPrice: null as number | null,
      bedrooms: null as number | null,
      bathrooms: null as number | null,
      status: 'active' as 'active' | 'sold' | 'all'
    }
  }),

  getters: {
    activeProperties: (state) => 
      state.properties.filter(prop => prop.status === 'active'),
    
    soldProperties: (state) => 
      state.properties.filter(prop => prop.status === 'sold'),
    
    filteredProperties: (state) => {
      return state.properties.filter(prop => {
        // Filtrar por status
        if (state.filters.status !== 'all' && prop.status !== state.filters.status) {
          return false;
        }

        // Filtrar por tipo
        if (state.filters.type && prop.type !== state.filters.type) {
          return false;
        }

        // Filtrar por preço mínimo
        if (state.filters.minPrice && prop.price < state.filters.minPrice) {
          return false;
        }

        // Filtrar por preço máximo
        if (state.filters.maxPrice && prop.price > state.filters.maxPrice) {
          return false;
        }

        // Filtrar por quartos
        if (state.filters.bedrooms && prop.bedrooms < state.filters.bedrooms) {
          return false;
        }

        // Filtrar por banheiros
        if (state.filters.bathrooms && prop.bathrooms < state.filters.bathrooms) {
          return false;
        }

        return true;
      });
    }
  },

  actions: {
    async fetchProperties() {
      this.loading = true;
      this.error = null;
      try {
        const fetchedProperties = await propertyService.getProperties();
        // Ordenar propriedades por data de criação (mais recentes primeiro)
        this.properties = fetchedProperties.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao carregar propriedades:', err);
        this.error = 'Erro ao carregar propriedades';
        // Carregar do localStorage como fallback
        const savedProperties = localStorage.getItem('properties');
        if (savedProperties) {
          this.properties = JSON.parse(savedProperties);
        }
      } finally {
        this.loading = false;
      }
    },

    async addProperty(propertyData: Omit<Property, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        // Criar propriedade no Firestore
        const newProperty = await propertyService.addProperty(propertyData);
        
        // Adicionar ao estado local
        this.properties.unshift(newProperty);
        this.saveToStorage();
        
        return newProperty;
      } catch (err) {
        console.error('Erro ao adicionar propriedade:', err);
        this.error = 'Erro ao adicionar propriedade';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProperty(id: string, data: Partial<Property>) {
      this.loading = true;
      this.error = null;
      try {
        // Atualizar no Firestore
        const updatedProperty = await propertyService.updateProperty(id, data);
        
        // Atualizar no estado local
        const index = this.properties.findIndex(p => p.id === id);
        if (index !== -1) {
          this.properties[index] = { ...this.properties[index], ...updatedProperty };
        }
        
        this.saveToStorage();
        return updatedProperty;
      } catch (err) {
        console.error('Erro ao atualizar propriedade:', err);
        this.error = 'Erro ao atualizar propriedade';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteProperty(id: string) {
      this.loading = true;
      this.error = null;
      try {
        // Verificar se a propriedade existe
        const exists = await propertyService.checkPropertyExists(id);
        if (!exists) {
          throw new Error('Propriedade não encontrada');
        }

        // Excluir do Firestore
        await propertyService.deleteProperty(id);
        
        // Excluir do estado local
        this.properties = this.properties.filter(p => p.id !== id);
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao excluir propriedade:', err);
        this.error = 'Erro ao excluir propriedade';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async checkPropertyExists(id: string) {
      try {
        return await propertyService.checkPropertyExists(id);
      } catch (err) {
        console.error('Erro ao verificar propriedade:', err);
        return false;
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {
        type: null,
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
        bathrooms: null,
        status: 'active'
      };
    },

    // Mantemos o localStorage como backup
    saveToStorage() {
      localStorage.setItem('properties', JSON.stringify(this.properties));
    }
  }
});
