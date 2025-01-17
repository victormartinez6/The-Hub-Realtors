import { defineStore } from 'pinia';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import type { ForexRate, ChartData, NewsItem } from '../types/forex';

export const useForexStore = defineStore('forex', () => {
  const rates = ref<ForexRate[]>([]);
  const chartData = ref<ChartData[]>([]);
  const news = ref<NewsItem[]>([]);
  const loading = ref(false);
  const lastRates = ref<Record<string, number>>({});
  const previousDayRates = ref<Record<string, number>>({});

  const fetchPreviousDayRate = async (currency: string) => {
    try {
      const response = await axios.get(
        `https://economia.awesomeapi.com.br/json/daily/${currency}-BRL/2`
      );
      
      if (response.data && response.data.length > 1) {
        const previousDay = response.data[1];
        console.log(`Fechamento anterior ${currency}:`, previousDay);
        previousDayRates.value[currency] = parseFloat(previousDay.ask);
        return previousDay;
      }
    } catch (error) {
      console.error(`Erro ao buscar fechamento anterior para ${currency}:`, error);
    }
    return null;
  };

  const initializePreviousDayRates = async () => {
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    console.log('Buscando fechamentos do dia anterior...');
    await Promise.all(currencies.map(fetchPreviousDayRate));
    console.log('Fechamentos do dia anterior:', previousDayRates.value);
  };

  const fetchRates = async () => {
    try {
      const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
      const currencyPairs = currencies.map(curr => `${curr}-BRL`).join(',');
      
      const response = await axios.get(`https://economia.awesomeapi.com.br/json/last/${currencyPairs}`, {
        timeout: 2000
      });
      
      if (response.data) {
        const newRates = currencies.map(currency => {
          const pair = `${currency}BRL`;
          const data = response.data[pair];
          
          if (!data) {
            console.error(`Dados não encontrados para ${pair}`);
            return null;
          }

          const currentRate = parseFloat(data.ask);
          const previousRate = lastRates.value[currency] || currentRate;
          const previousDayRate = previousDayRates.value[currency];
          
          const changeToday = previousDayRate 
            ? ((currentRate - previousDayRate) / previousDayRate) * 100 
            : 0;

          console.log(`${currency} - Taxa atual: ${currentRate}, Fechamento anterior: ${previousDayRate}, Variação: ${changeToday.toFixed(2)}%`);
          
          lastRates.value[currency] = currentRate;
          
          return {
            currency,
            rate: currentRate,
            change24h: parseFloat(data.pctChange),
            changeToday: changeToday,
            timestamp: parseInt(data.timestamp),
            createDate: data.create_date
          };
        }).filter((rate): rate is ForexRate => rate !== null);

        if (JSON.stringify(rates.value) !== JSON.stringify(newRates)) {
          console.table(newRates.map(r => ({
            moeda: r.currency,
            taxa: r.rate.toFixed(4),
            var24h: r.change24h.toFixed(2) + '%',
            varHoje: r.changeToday.toFixed(2) + '%',
            horário: new Date(r.timestamp * 1000).toLocaleTimeString()
          })));
          rates.value = newRates;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar taxas:', error);
    }
  };

  const fetchSparklineData = async (currency: string) => {
    try {
      const response = await axios.get(
        `https://economia.awesomeapi.com.br/json/daily/${currency}-BRL/7`
      );
      
      if (response.data && Array.isArray(response.data)) {
        return response.data
          .map(item => parseFloat(item.ask))
          .reverse(); // Reverter para ordem cronológica
      }
      return [];
    } catch (error) {
      console.error(`Erro ao buscar dados históricos para ${currency}:`, error);
      return [];
    }
  };

  onMounted(async () => {
    await initializePreviousDayRates();
    await fetchRates();
  });

  return {
    rates,
    loading,
    fetchRates,
    fetchSparklineData,
    getRate: computed(() => (currency: string) => {
      return rates.value.find(rate => rate.currency === currency);
    })
  };
});