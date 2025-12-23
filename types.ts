import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export enum DecisionStatus {
    GO = 'GO',
    NO_GO = 'NO_GO',
    REVIEW = 'REVIEW'
}

export interface Tender {
    id: string;
    title: string;
    organism: string;
    budget: number;
    deadline: string; // ISO date
    daysRemaining: number;
    isNextGen: boolean;
    priceWeight: number; // 0-100
    organismSuccessRate: number; // 0-100
    cpv: string;
    status: 'Activa' | 'Adjudicada' | 'Desierta';
}

export interface OrganismKPI {
    id: string;
    name: string;
    totalVolume: number;
    successRate: number; // % of tenders not deserted
    avgDiscount: number; // Baja media %
    toxicScore: number; // 0-10 (High is bad)
}

export interface Competitor {
    id: string;
    name: string;
    totalWon: number;
    winCount: number;
}

export interface DesertedTender {
    id: string;
    title: string;
    organism: string;
    budget: number;
    date: string;
    reason: string;
}

// Graph Types
export interface GraphNode extends SimulationNodeDatum {
    id: string;
    group: number;
    value: number; // For node size (volume won)
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number; // For line thickness (number of UTEs together)
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface Adjudicatario {
    id: number;
    nombre: string;
    nif?: string;
    isPyme: boolean;
    provincia?: string;
    totalWins: number;
    totalAmount: number;
    avgAmount: number;
}

export interface AdjudicatarioDetail extends Adjudicatario {
    wonTenders: WonTender[];
}

export interface WonTender {
    id: number;
    title: string;
    organism: string;
    fecha_adjudicacion: string;
    importe: number;
    presupuesto_base: number;
    descuento: number;
    url?: string;
}