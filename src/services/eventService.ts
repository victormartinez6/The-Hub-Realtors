import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { userService } from './userService';

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'visita' | 'reuniao' | 'contrato';
  date: Date;
  time: string;
  location?: string;
  propertyId?: string;
  propertyTitle?: string;
  leadId?: string;
  leadName?: string;
  participants: string[];
  participantsNames: string[];
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'events';
const eventsCollection = collection(db, COLLECTION_NAME);

async function getCurrentUserWithRole() {
  const user = await userService.getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user;
}

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const user = await getCurrentUserWithRole();
    let q;

    switch (user.role) {
      case 'super_admin':
        q = query(eventsCollection, orderBy('date', 'asc'));
        break;
      default:
        q = query(
          eventsCollection,
          where('participants', 'array-contains', user.uid),
          orderBy('date', 'asc')
        );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Event[];
  },

  async addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const user = await getCurrentUserWithRole();
    
    if (!['super_admin', 'broker', 'realtor'].includes(user.role)) {
      throw new Error('Usuário não tem permissão para criar eventos');
    }

    const now = new Date();
    const newEventData = {
      ...eventData,
      status: 'pending',
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(eventsCollection, newEventData);
    return {
      id: docRef.id,
      ...newEventData
    } as Event;
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const user = await getCurrentUserWithRole();
    const eventRef = doc(eventsCollection, id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Evento não encontrado');
    }

    const event = eventDoc.data() as Event;

    // Verificar permissões
    if (user.role !== 'super_admin' && 
        user.uid !== event.createdBy && 
        !event.participants.includes(user.uid)) {
      throw new Error('Usuário não tem permissão para atualizar este evento');
    }

    const updateData = {
      ...eventData,
      updatedAt: new Date()
    };

    await updateDoc(eventRef, updateData);

    return {
      id,
      ...event,
      ...updateData
    } as Event;
  },

  async deleteEvent(id: string): Promise<void> {
    const user = await getCurrentUserWithRole();
    const eventRef = doc(eventsCollection, id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Evento não encontrado');
    }

    const event = eventDoc.data() as Event;

    // Verificar permissões
    if (user.role !== 'super_admin' && user.uid !== event.createdBy) {
      throw new Error('Usuário não tem permissão para excluir este evento');
    }

    await deleteDoc(eventRef);
  },

  async getEvent(id: string): Promise<Event> {
    const eventRef = doc(eventsCollection, id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Evento não encontrado');
    }

    return {
      id: eventDoc.id,
      ...eventDoc.data(),
      date: eventDoc.data().date?.toDate(),
      completedAt: eventDoc.data().completedAt?.toDate(),
      createdAt: eventDoc.data().createdAt?.toDate(),
      updatedAt: eventDoc.data().updatedAt?.toDate()
    } as Event;
  },

  async checkEventExists(id: string): Promise<boolean> {
    const eventRef = doc(eventsCollection, id);
    const eventDoc = await getDoc(eventRef);
    return eventDoc.exists();
  },

  async markAsCompleted(id: string, notes?: string): Promise<Event> {
    const user = await getCurrentUserWithRole();
    const eventRef = doc(eventsCollection, id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Evento não encontrado');
    }

    const event = eventDoc.data() as Event;

    // Verificar permissões
    if (user.role !== 'super_admin' && 
        user.uid !== event.createdBy && 
        !event.participants.includes(user.uid)) {
      throw new Error('Usuário não tem permissão para marcar este evento como concluído');
    }

    const updateData = {
      status: 'completed',
      completedAt: new Date(),
      notes: notes || event.notes,
      updatedAt: new Date()
    };

    await updateDoc(eventRef, updateData);

    return {
      id,
      ...event,
      ...updateData
    } as Event;
  }
};
