import { Tender, OrganismKPI, Competitor, GraphData, DesertedTender } from '../types';
import { activeTenders, organismData, networkData, topCompetitors, desertedTenders } from './mockData';

// --- CONFIGURACIÓN DE CONEXIÓN ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'; 
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to handle fetch without fallback
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    return await response.json();
}

export const api = {
    async getWarRoomData(): Promise<Tender[]> {
        if (USE_MOCK_DATA) {
            await delay(600);
            return activeTenders;
        }
        return fetchFromAPI('/tenders/active');
    },

    async getMarketData(): Promise<OrganismKPI[]> {
        if (USE_MOCK_DATA) {
            await delay(600);
            return organismData;
        }
        return fetchFromAPI('/market/organisms');
    },

    async getCompetitionData(): Promise<{ topCompetitors: Competitor[], network: GraphData }> {
        if (USE_MOCK_DATA) {
            await delay(1000);
            return { topCompetitors, network: networkData };
        }
        const [comps, net] = await Promise.all([
            fetchFromAPI<Competitor[]>('/competition/top'),
            fetchFromAPI<GraphData>('/competition/network')
        ]);
        return { topCompetitors: comps, network: net };
    },

    async getReboundData(): Promise<DesertedTender[]> {
        if (USE_MOCK_DATA) {
            await delay(600);
            return desertedTenders;
        }
        return fetchFromAPI('/tenders/deserted');
    },

    async searchAdjudicatarios(query: string): Promise<any[]> {
        if (USE_MOCK_DATA) {
            await delay(600);
            return [];
        }
        return fetchFromAPI(`/adjudicatarios/search?q=${encodeURIComponent(query)}`);
    },

    async getAdjudicatarioTenders(adjudicatarioId: number): Promise<any[]> {
        if (USE_MOCK_DATA) {
            await delay(600);
            return [];
        }
        return fetchFromAPI(`/adjudicatarios/${adjudicatarioId}/tenders`);
    },

    getStatus(): string {
        return USE_MOCK_DATA ? 'MODO DEMO (Mock Data)' : `CONECTADO: ${API_URL}`;
    }
};