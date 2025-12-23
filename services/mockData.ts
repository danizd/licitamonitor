import { Tender, OrganismKPI, Competitor, GraphData, DesertedTender } from '../types';

// Mock Data for "War Room"
export const activeTenders: Tender[] = [
    {
        id: 'LIC-2024-001',
        title: 'Desarrollo de Plataforma Big Data Turismo',
        organism: 'Amtega',
        budget: 450000,
        deadline: '2024-06-15',
        daysRemaining: 5,
        isNextGen: true,
        priceWeight: 45,
        organismSuccessRate: 92,
        cpv: '72000000-5',
        status: 'Activa'
    },
    {
        id: 'LIC-2024-002',
        title: 'Suministro Ordenadores Portátiles Educativos',
        organism: 'Consellería de Educación',
        budget: 1200000,
        deadline: '2024-06-25',
        daysRemaining: 15,
        isNextGen: false,
        priceWeight: 90, // Subasta
        organismSuccessRate: 95,
        cpv: '30200000-1',
        status: 'Activa'
    },
    {
        id: 'LIC-2024-003',
        title: 'Mantenimiento Apps Móviles Concello',
        organism: 'Concello de Vigo',
        budget: 85000,
        deadline: '2024-07-05',
        daysRemaining: 25,
        isNextGen: false,
        priceWeight: 55,
        organismSuccessRate: 60, // Toxic client risk
        cpv: '72267000-4',
        status: 'Activa'
    },
    {
        id: 'LIC-2024-004',
        title: 'Consultoría Ciberseguridad Industrial',
        organism: 'IGAPE',
        budget: 210000,
        deadline: '2024-06-18',
        daysRemaining: 8,
        isNextGen: true,
        priceWeight: 40,
        organismSuccessRate: 88,
        cpv: '72220000-3',
        status: 'Activa'
    },
    {
        id: 'LIC-2024-005',
        title: 'Licencias Software Gestión Hospitalaria',
        organism: 'SERGAS',
        budget: 3500000,
        deadline: '2024-06-30',
        daysRemaining: 20,
        isNextGen: true,
        priceWeight: 70,
        organismSuccessRate: 98,
        cpv: '48000000-8',
        status: 'Activa'
    }
];

// Mock Data for "Market Intelligence" (Scatter & Bar)
export const organismData: OrganismKPI[] = [
    { id: '1', name: 'Amtega', totalVolume: 15000000, successRate: 95, avgDiscount: 15.4, toxicScore: 1 },
    { id: '2', name: 'SERGAS', totalVolume: 8500000, successRate: 92, avgDiscount: 18.2, toxicScore: 2 },
    { id: '3', name: 'Concello de Vigo', totalVolume: 4200000, successRate: 75, avgDiscount: 22.5, toxicScore: 4 },
    { id: '4', name: 'Concello de A Coruña', totalVolume: 3800000, successRate: 80, avgDiscount: 20.1, toxicScore: 3 },
    { id: '5', name: 'Deputación Pontevedra', totalVolume: 2100000, successRate: 88, avgDiscount: 12.8, toxicScore: 2 },
    { id: '6', name: 'USC (Universidad)', totalVolume: 1500000, successRate: 65, avgDiscount: 8.5, toxicScore: 7 }, // Low volume, low success = avoid
    { id: '7', name: 'Autoridad Portuaria', totalVolume: 900000, successRate: 90, avgDiscount: 25.0, toxicScore: 5 }, // High discount required
    { id: '8', name: 'IGAPE', totalVolume: 5000000, successRate: 85, avgDiscount: 14.0, toxicScore: 2 },
];

// Mock Data for "Competition"
export const topCompetitors: Competitor[] = [
    { id: '1', name: 'Indra Sistemas', totalWon: 12500000, winCount: 15 },
    { id: '2', name: 'Altia Consultores', totalWon: 9800000, winCount: 22 },
    { id: '3', name: 'DXC Technology', totalWon: 7200000, winCount: 8 },
    { id: '4', name: 'Plexus Tech', totalWon: 6500000, winCount: 18 },
    { id: '5', name: 'Telefónica Soluciones', totalWon: 5900000, winCount: 10 },
];

// Mock Data for Network Graph (UTEs)
// Nodes: Major companies
// Links: Joint Ventures (UTEs)
export const networkData: GraphData = {
    nodes: [
        { id: 'Altia', group: 1, value: 50 },
        { id: 'Indra', group: 1, value: 60 },
        { id: 'Plexus', group: 1, value: 40 },
        { id: 'Telefónica', group: 2, value: 55 },
        { id: 'R Cable', group: 2, value: 30 },
        { id: 'Everis', group: 1, value: 45 },
        { id: 'Coremain', group: 3, value: 20 },
        { id: 'Bahía', group: 3, value: 15 },
        { id: 'Sivsa', group: 3, value: 25 },
        { id: 'Balidea', group: 3, value: 22 },
    ],
    links: [
        { source: 'Altia', target: 'Indra', value: 5 }, // Frequent partners
        { source: 'Telefónica', target: 'Indra', value: 3 },
        { source: 'R Cable', target: 'Altia', value: 2 },
        { source: 'Plexus', target: 'Everis', value: 4 },
        { source: 'Coremain', target: 'Bahía', value: 6 }, // Niche partnership
        { source: 'Sivsa', target: 'Bahía', value: 2 },
        { source: 'Balidea', target: 'Altia', value: 1 },
        { source: 'Telefónica', target: 'R Cable', value: 8 }, // UTE Telco
    ]
};

// Mock Data for "Rebound Opportunities" (Desiertos)
export const desertedTenders: DesertedTender[] = [
    {
        id: 'DES-001',
        title: 'Suministro Licencias Oracle',
        organism: 'Concello de Ourense',
        budget: 60000,
        date: '2024-05-10',
        reason: 'Falta de licitadores'
    },
    {
        id: 'DES-002',
        title: 'Desarrollo Web Corporativa',
        organism: 'Mancomunidade Salnés',
        budget: 15000,
        date: '2024-05-15',
        reason: 'Ofertas irregulares'
    },
    {
        id: 'DES-003',
        title: 'Mantenimiento SAID (Servicio Atención)',
        organism: 'Deputación Lugo',
        budget: 120000,
        date: '2024-05-20',
        reason: 'Presupuesto base insuficiente'
    },
];