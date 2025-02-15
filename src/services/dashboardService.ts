import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  startOf,
  endOf
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { UserRole } from '../stores/auth';

interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  convertedLeads: number;
  conversionRate: number;
  activeProperties: number;
  newProperties: number;
  monthlyCommission: number;
  commissionTrend: number;
}

interface TeamPerformance {
  realtorId: string;
  realtorName: string;
  leadsCount: number;
  conversions: number;
  commission: number;
  lastActivity: Date;
}

interface RecentLead {
  id: string;
  name: string;
  interest: string;
  status: string;
  createdAt: Date;
  assignedTo?: string;
  sharedBy?: string;
  brokerName?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'visita' | 'reuniao' | 'contrato';
  participants: string[];
}

interface Property {
  id: string;
  title: string;
  price: number;
  image: string;
  status: string;
  createdAt: Date;
}

export const dashboardService = {
  // Buscar estatísticas gerais baseadas na role do usuário
  async getStats(userId: string, role: UserRole): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let leadsQuery;
    if (role === 'super_admin') {
      leadsQuery = query(collection(db, 'leads'));
    } else if (role === 'broker') {
      leadsQuery = query(collection(db, 'leads'), where('brokerId', '==', userId));
    } else if (role === 'realtor') {
      leadsQuery = query(collection(db, 'leads'), where('assignedTo', '==', userId));
    } else { // partner
      const partnerLeadsCreated = query(collection(db, 'leads'), where('createdBy', '==', userId));
      const partnerLeadsShared = query(collection(db, 'leads'), where('partnersAccess', 'array-contains', userId));

      // Buscar ambas as queries
      const [createdSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(partnerLeadsCreated),
        getDocs(partnerLeadsShared)
      ]);

      // Combinar os resultados, removendo duplicatas pelo ID
      const leadsMap = new Map();
      [...createdSnapshot.docs, ...sharedSnapshot.docs].forEach(doc => {
        leadsMap.set(doc.id, {
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate()
        });
      });

      // Converter para array
      const leads = Array.from(leadsMap.values());
      
      // Calcular estatísticas
      const totalLeads = leads.length;
      const newLeadsThisMonth = leads.filter(lead => 
        lead.createdAt >= firstDayOfMonth
      ).length;
      const convertedLeads = leads.filter(lead => 
        lead.status === 'convertido'
      ).length;
      const conversionRate = totalLeads > 0 
        ? Math.round((convertedLeads / totalLeads) * 100) 
        : 0;

      return {
        totalLeads,
        newLeadsThisMonth,
        convertedLeads,
        conversionRate,
        activeProperties: 0,
        newProperties: 0,
        monthlyCommission: 0,
        commissionTrend: 0
      };
    }

    const leadsSnapshot = await getDocs(leadsQuery);
    const leads = leadsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate()
    }));

    // Calcular estatísticas
    const totalLeads = leads.length;
    const newLeadsThisMonth = leads.filter(lead => 
      lead.createdAt >= firstDayOfMonth
    ).length;
    const convertedLeads = leads.filter(lead => 
      lead.status === 'convertido'
    ).length;
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;

    // Buscar propriedades
    let propertiesQuery;
    if (role === 'super_admin') {
      propertiesQuery = query(collection(db, 'properties'));
    } else if (role === 'broker') {
      propertiesQuery = query(collection(db, 'properties'), where('brokerId', '==', userId));
    } else { // realtor
      propertiesQuery = query(collection(db, 'properties'), where('realtorId', '==', userId));
    }

    const propertiesSnapshot = await getDocs(propertiesQuery);
    const properties = propertiesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate()
    }));

    const activeProperties = properties.filter(prop => 
      prop.status === 'ativo'
    ).length;
    const newProperties = properties.filter(prop => 
      prop.createdAt >= firstDayOfMonth
    ).length;

    // Buscar comissões
    let commissionsQuery;
    if (role === 'super_admin') {
      commissionsQuery = query(collection(db, 'commissions'));
    } else if (role === 'broker') {
      commissionsQuery = query(collection(db, 'commissions'), where('brokerId', '==', userId));
    } else if (role === 'realtor') {
      commissionsQuery = query(collection(db, 'commissions'), where('realtorId', '==', userId));
    } else { // partner
      commissionsQuery = query(collection(db, 'commissions'), where('partnerId', '==', userId));
    }

    const commissionsSnapshot = await getDocs(commissionsQuery);
    const commissions = commissionsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date?.toDate()
    }));

    const thisMonthCommissions = commissions.filter(comm => 
      comm.date >= firstDayOfMonth
    );
    const lastMonthCommissions = commissions.filter(comm => {
      const date = comm.date;
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    const monthlyCommission = thisMonthCommissions.reduce((sum, comm) => 
      sum + comm.amount, 0
    );
    const lastMonthCommission = lastMonthCommissions.reduce((sum, comm) => 
      sum + comm.amount, 0
    );

    const commissionTrend = lastMonthCommission > 0
      ? Math.round(((monthlyCommission - lastMonthCommission) / lastMonthCommission) * 100)
      : 0;

    return {
      totalLeads,
      newLeadsThisMonth,
      convertedLeads,
      conversionRate,
      activeProperties,
      newProperties,
      monthlyCommission,
      commissionTrend
    };
  },

  // Buscar desempenho da equipe (apenas para broker)
  async getTeamPerformance(brokerId: string): Promise<TeamPerformance[]> {
    const realtorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'realtor'),
      where('brokerId', '==', brokerId)
    );

    const realtorsSnapshot = await getDocs(realtorsQuery);
    const realtors = realtorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const performance = await Promise.all(realtors.map(async realtor => {
      const leadsQuery = query(
        collection(db, 'leads'),
        where('assignedTo', '==', realtor.id)
      );
      const leadsSnapshot = await getDocs(leadsQuery);
      const leads = leadsSnapshot.docs;

      const commissionsQuery = query(
        collection(db, 'commissions'),
        where('realtorId', '==', realtor.id)
      );
      const commissionsSnapshot = await getDocs(commissionsQuery);
      const commissions = commissionsSnapshot.docs;

      return {
        realtorId: realtor.id,
        realtorName: realtor.name,
        leadsCount: leads.length,
        conversions: leads.filter(doc => doc.data().status === 'convertido').length,
        commission: commissions.reduce((sum, doc) => sum + doc.data().amount, 0),
        lastActivity: realtor.lastActivity?.toDate() || new Date()
      };
    }));

    return performance;
  },

  // Buscar leads recentes
  async getRecentLeads(userId: string, role: UserRole, limit: number = 5): Promise<RecentLead[]> {
    let leadsQuery;
    if (role === 'super_admin') {
      leadsQuery = query(
        collection(db, 'leads'),
        orderBy('createdAt', 'desc'),
        limit
      );
    } else if (role === 'broker') {
      leadsQuery = query(
        collection(db, 'leads'),
        where('brokerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit
      );
    } else if (role === 'realtor') {
      leadsQuery = query(
        collection(db, 'leads'),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc'),
        limit
      );
    } else { // partner
      const partnerLeadsCreated = query(collection(db, 'leads'), where('createdBy', '==', userId));
      const partnerLeadsShared = query(collection(db, 'leads'), where('partnersAccess', 'array-contains', userId));

      // Buscar ambas as queries
      const [createdSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(partnerLeadsCreated),
        getDocs(partnerLeadsShared)
      ]);

      // Combinar os resultados, removendo duplicatas pelo ID
      const leadsMap = new Map();
      [...createdSnapshot.docs, ...sharedSnapshot.docs].forEach(doc => {
        leadsMap.set(doc.id, {
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate()
        });
      });

      // Converter para array
      const leads = Array.from(leadsMap.values());
      
      // Ordenar por data de criação
      leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Retornar os leads mais recentes
      return leads.slice(0, limit).map(lead => ({
        id: lead.id,
        name: lead.name,
        interest: lead.interest,
        status: lead.status,
        createdAt: lead.createdAt,
        assignedTo: lead.assignedTo,
        sharedBy: lead.sharedBy,
        brokerName: lead.brokerName
      }));
    }

    const snapshot = await getDocs(leadsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      interest: doc.data().interest,
      status: doc.data().status,
      createdAt: doc.data().createdAt?.toDate(),
      assignedTo: doc.data().assignedTo,
      sharedBy: doc.data().sharedBy,
      brokerName: doc.data().brokerName
    }));
  },

  // Buscar próximos eventos
  async getUpcomingEvents(userId: string, role: UserRole, limit: number = 5): Promise<UpcomingEvent[]> {
    const now = new Date();
    let eventsQuery;

    if (role === 'super_admin') {
      eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit
      );
    } else {
      eventsQuery = query(
        collection(db, 'events'),
        where('participants', 'array-contains', userId),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit
      );
    }

    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      date: doc.data().date?.toDate(),
      time: doc.data().time,
      type: doc.data().type,
      participants: doc.data().participants
    }));
  },

  // Buscar propriedades recentes
  async getRecentProperties(userId: string, role: UserRole, limit: number = 6): Promise<Property[]> {
    let propertiesQuery;
    if (role === 'super_admin') {
      propertiesQuery = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc'),
        limit
      );
    } else if (role === 'broker') {
      propertiesQuery = query(
        collection(db, 'properties'),
        where('brokerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit
      );
    } else { // realtor
      propertiesQuery = query(
        collection(db, 'properties'),
        where('realtorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit
      );
    }

    const snapshot = await getDocs(propertiesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      price: doc.data().price,
      image: doc.data().image,
      status: doc.data().status,
      createdAt: doc.data().createdAt?.toDate()
    }));
  }
};
