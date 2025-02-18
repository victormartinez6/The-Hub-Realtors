import { format, parseISO, formatISO, addHours, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const timeZones = [
  { value: '-5', label: 'Nova York (EST/EDT) UTC-5' },
  { value: '-8', label: 'Los Angeles (PST/PDT) UTC-8' },
  { value: '-6', label: 'Chicago (CST/CDT) UTC-6' },
  { value: '-3', label: 'São Paulo (BRT) UTC-3' },
  { value: '0', label: 'Londres (GMT/BST) UTC+0' },
  { value: '1', label: 'Paris (CET/CEST) UTC+1' },
  { value: '9', label: 'Tóquio (JST) UTC+9' },
  { value: '4', label: 'Dubai (GST) UTC+4' },
  { value: '8', label: 'Xangai (CST) UTC+8' },
  { value: '12', label: 'Auckland (NZST/NZDT) UTC+12' }
];

// Obter timezone local do navegador em horas
export const getLocalTimeZone = (): string => {
  const offset = -(new Date().getTimezoneOffset() / 60);
  return offset.toString();
};

// Converter data local para UTC
export const localToUTC = (dateStr: string, timeStr: string, offsetHours: string): string => {
  // Criar data local
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Criar data em UTC
  const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  
  // Ajustar pelo offset do fuso
  const offset = parseInt(offsetHours);
  const utcDate = subHours(localDate, offset);
  
  return formatISO(utcDate);
};

// Converter UTC para data local
export const utcToLocal = (utcStr: string, offsetHours: string): { date: string; time: string } => {
  const utcDate = parseISO(utcStr);
  const offset = parseInt(offsetHours);
  const localDate = addHours(utcDate, offset);
  
  return {
    date: format(localDate, 'yyyy-MM-dd'),
    time: format(localDate, 'HH:mm')
  };
};

// Formatar data e hora para exibição
export const formatDateTime = (dateStr: string, offsetHours: string): string => {
  const utcDate = parseISO(dateStr);
  const offset = parseInt(offsetHours);
  const localDate = addHours(utcDate, offset);
  
  return format(localDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm (O)", {
    locale: ptBR
  });
};
