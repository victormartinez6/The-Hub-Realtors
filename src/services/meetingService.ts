import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, orderBy } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { logger } from '../utils/logger';

export interface Meeting {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  isOnlineMeeting: boolean;
  meetingUrl?: string;
  attendees: string[];
  notes?: string;
  leadName?: string;
  userId: string;
}

export class MeetingService {
  async getAllMeetings(): Promise<Meeting[]> {
    try {
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      const meetingsRef = collection(db, 'meetings');
      const q = query(meetingsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meeting[];
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  async createMeeting(meetingData: Omit<Meeting, 'id'>): Promise<Meeting> {
    try {
      const meetingsRef = collection(db, 'meetings');
      
      // Garantir que a data está no formato YYYY-MM-DD sem alteração de fuso horário
      const date = meetingData.date;
      
      // Remover campos undefined
      const cleanData = Object.entries({ ...meetingData })
        .reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

      const docRef = await addDoc(meetingsRef, cleanData);
      return { id: docRef.id, ...cleanData } as Meeting;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateMeeting(id: string, meetingData: Partial<Meeting>): Promise<void> {
    try {
      const meetingRef = doc(db, 'meetings', id);
      
      // Remover campos undefined e id
      const cleanData = Object.entries(meetingData).reduce((acc, [key, value]) => {
        if (value !== undefined && key !== 'id') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      await updateDoc(meetingRef, cleanData);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  async deleteMeeting(id: string): Promise<void> {
    try {
      const meetingRef = doc(db, 'meetings', id);
      await deleteDoc(meetingRef);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }

  async getMeetingsByDateRange(startDate: string, endDate: string): Promise<Meeting[]> {
    try {
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        logger.error('Usuário não autenticado');
        return [];
      }

      // Usar as datas exatamente como recebidas, sem conversão
      const startLocal = startDate.split('T')[0];
      const endLocal = endDate.split('T')[0];

      const meetingsRef = collection(db, 'meetings');
      
      // Buscar primeiro por userId e depois filtrar as datas no cliente
      const q = query(
        meetingsRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      
      // Filtrar e ordenar os resultados no cliente
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Meeting)
        .filter(meeting => 
          meeting.date >= startLocal && 
          meeting.date <= endLocal
        )
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }
}

export const meetingService = new MeetingService();
