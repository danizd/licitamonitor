import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    BarChart3, 
    Network, 
    RefreshCcw, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle,
    TrendingUp,
    Euro,
    ShieldAlert,
    Clock,
    Search,
    Database,
    Loader2
} from 'lucide-react';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
    BarChart, Bar, Legend, ReferenceLine, Cell
} from 'recharts';
import NetworkGraph from './components/NetworkGraph';
import { api } from './services/api';
import { Tender, OrganismKPI, Competitor, GraphData, DesertedTender } from './types';

// --- Types & Constants ---
const EUR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

enum Tab {
    WAR_ROOM = 'war_room',
    MARKET = 'market',
    COMPETITION = 'competition',
    REBOUND = 'rebound',
    SEARCH = 'search'
}

// --- Components ---

const StatCard: React.FC<{ title: string; value: string; sub?: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {sub && <p className={`text-xs mt-2 ${color}`}>{sub}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            {icon}
        </div>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">Consultando Base de Datos...</p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-96 text-red-500">
        <AlertTriangle className="w-10 h-10 mb-4" />
        <p className="text-lg font-bold">Error de Conexión</p>
        <p className="text-sm">{message}</p>
    </div>
);

// --- View: War Room ---
const WarRoomView: React.FC<{ data: Tender[], loading: boolean }> = ({ data, loading }) => {
    if (loading) return <LoadingState />;
    
    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Licitaciones Activas (15 días)"
                    value={data.length.toString()}
                    sub={`${data.filter(t => t.daysRemaining < 5).length} críticas expiran < 5 días`}
                    icon={<Clock className="w-6 h-6 text-blue-600" />}
                    color="text-blue-600"
                />
                <StatCard 
                    title="Valor Total en Juego"
                    value={EUR.format(data.reduce((acc, t) => acc + t.budget, 0))}
                    sub="+15% vs mes anterior"
                    icon={<Euro className="w-6 h-6 text-emerald-600" />}
                    color="text-emerald-600"
                />
                <StatCard 
                    title="Oportunidades NextGen EU"
                    value={data.filter(t => t.isNextGen).length.toString()}
                    sub="Fondos europeos confirmados"
                    icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
                    color="text-indigo-600"
                />
            </div>

            {/* Smart Decision Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5" />
                        Matriz de Decisión (Go / No-Go)
                    </h2>
                    <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">dw.fact_licitacion</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Licitación</th>
                                <th className="px-6 py-3">Organismo</th>
                                <th className="px-6 py-3">Presupuesto</th>
                                <th className="px-6 py-3">Plazo</th>
                                <th className="px-6 py-3">Estrategia</th>
                                <th className="px-6 py-3">Riesgo Cliente</th>
                                <th className="px-6 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((tender) => {
                                const isUrgent = tender.daysRemaining < 10;
                                const isMid = tender.daysRemaining >= 10 && tender.daysRemaining <= 20;
                                const strategy = tender.priceWeight > 80 ? 'Subasta' : (tender.priceWeight < 60 ? 'Valor' : 'Mixto');
                                const isRisky = tender.organismSuccessRate < 70;

                                return (
                                    <tr key={tender.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                                            {tender.url ? (
                                                <a 
                                                    href={tender.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                    title={tender.title}
                                                >
                                                    <span className="g">{tender.title}</span>
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <span className="truncate" title={tender.title}>{tender.title}</span>
                                            )}
                                            {tender.isNextGen && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">NextGen</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{tender.organism}</td>
                                        <td className="px-6 py-4 font-mono">{EUR.format(tender.budget)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                isUrgent ? 'bg-red-100 text-red-800' : (isMid ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')
                                            }`}>
                                                {tender.daysRemaining} días
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${
                                                strategy === 'Subasta' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                            }`}>
                                                {strategy} ({tender.priceWeight}%)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isRisky ? (
                                                <div className="flex items-center text-red-600 gap-1 text-xs font-bold">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Tóxico ({tender.organismSuccessRate}%)
                                                </div>
                                            ) : (
                                                <span className="text-green-600 text-xs flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3"/> Fiable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-900 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">
                                                Analizar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- View: Market Intelligence ---
const MarketView: React.FC<{ data: OrganismKPI[], loading: boolean }> = ({ data, loading }) => {
    if (loading) return <LoadingState />;

    // Aplicar escala logarítmica para mejor distribución visual
    const scatterData = data.map(item => ({
        ...item,
        totalVolumeLog: Math.log10(Math.max(item.totalVolume, 1))
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scatter Matrix */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[550px] flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Matriz de Calidad de Clientes</h3>
                        <p className="text-sm text-slate-500">Volumen contratado (escala logarítmica) vs. Tasa de éxito. Los mejores clientes están en el cuadrante superior derecho.</p>
                    </div>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 30, bottom: 50, left: 60 }}>
                                <defs>
                                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                
                                {/* Líneas de referencia para cuadrantes */}
                                <ReferenceLine 
                                    y={50} 
                                    stroke="#94a3b8" 
                                    strokeDasharray="5 5" 
                                    label={{ value: '50% éxito', position: 'right', fill: '#64748b', fontSize: 11 }}
                                />
                                
                                <XAxis 
                                    type="number" 
                                    dataKey="totalVolumeLog" 
                                    name="Volumen" 
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => {
                                        const realValue = Math.pow(10, val);
                                        if (realValue >= 1000000) return `€${(realValue/1000000).toFixed(0)}M`;
                                        if (realValue >= 1000) return `€${(realValue/1000).toFixed(0)}K`;
                                        return `€${realValue.toFixed(0)}`;
                                    }}
                                    label={{ value: 'Volumen Contratado (escala log)', position: 'bottom', offset: 35, style: { fontSize: 12, fill: '#475569' } }}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                
                                <YAxis 
                                    type="number" 
                                    dataKey="successRate" 
                                    name="Éxito" 
                                    unit="%" 
                                    domain={[0, 100]}
                                    label={{ value: 'Tasa de Éxito (%)', angle: -90, position: 'left', offset: 45, style: { fontSize: 12, fill: '#475569' } }}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3', stroke: '#3b82f6', strokeWidth: 1.5 }} 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-4 border-2 border-blue-200 rounded-lg shadow-xl">
                                                    <p className="font-bold text-slate-900 mb-3 text-base border-b pb-2">{data.fullName || data.name}</p>
                                                    <div className="space-y-1.5">
                                                        <p className="text-sm text-slate-700">
                                                            <span className="font-semibold">Volumen:</span> {EUR.format(data.totalVolume)}
                                                        </p>
                                                        <p className="text-sm text-slate-700">
                                                            <span className="font-semibold">Tasa Éxito:</span> {data.successRate}%
                                                        </p>
                                                        <p className="text-sm text-slate-700">
                                                            <span className="font-semibold">Licitaciones:</span> {data.totalTenders}
                                                        </p>
                                                        <p className="text-sm text-slate-700">
                                                            <span className="font-semibold">Presupuesto Medio:</span> {EUR.format(data.avgBudget)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                
                                <Scatter 
                                    name="Organismos" 
                                    data={scatterData} 
                                    fill="url(#colorSuccess)"
                                    shape="circle"
                                >
                                    {scatterData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`}
                                            fill={
                                                entry.successRate > 70 && entry.totalVolume > 1000000 
                                                    ? '#10b981' // Verde para top performers
                                                    : entry.successRate > 50 
                                                    ? '#3b82f6' // Azul para buenos
                                                    : '#f59e0b' // Naranja para mejorables
                                            }
                                            fillOpacity={0.7}
                                        />
                                    ))}
                                    <LabelList 
                                        dataKey="name" 
                                        position="top" 
                                        offset={8}
                                        style={{ fontSize: '9px', fill: '#1e293b', fontWeight: 500 }} 
                                    />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Leyenda de colores */}
                    <div className="flex gap-4 mt-3 text-xs justify-center border-t pt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-slate-600">Top (&gt;70% éxito, &gt;€1M)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-slate-600">Buenos (&gt;50% éxito)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-slate-600">Mejorables</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart - Discounts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Ranking de "Bajas Temerarias"</h3>
                    <p className="text-sm text-slate-500 mb-4">Descuento medio requerido para ganar (excluyendo desiertos).</p>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...data].sort((a,b) => b.avgDiscount - a.avgDiscount)} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 30]} unit="%" />
                                <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10}} />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                                                    <p className="font-bold text-slate-900 mb-2">{data.fullName || data.name}</p>
                                                    <p className="text-sm text-slate-600">Baja Media: {data.avgDiscount}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="avgDiscount" name="Baja Media %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4"/> SQL Logic Note:
                </h4>
                <p className="text-xs text-blue-800 font-mono">
                   FILTER WHERE fact_resultado_lote.es_exito = TRUE implies we are ignoring "Desierto" (0€) records for the average discount calculation.
                </p>
            </div>
        </div>
    );
};

// --- View: Competition ---
const CompetitionView: React.FC<{ competitors: Competitor[], network: GraphData, loading: boolean }> = ({ competitors, network, loading }) => {
    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Depredadores */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">Top 10 Depredadores (Galicia)</h3>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {competitors.map((comp, idx) => (
                            <li key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{comp.name}</p>
                                        <p className="text-xs text-slate-500">{comp.wins} adjudicaciones</p>
                                    </div>
                                </div>
                                <span className="text-sm font-mono font-semibold text-emerald-600">
                                    {EUR.format(comp.totalAmount || 0)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Network Graph */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Grafo de Relaciones (UTEs)</h3>
                            <p className="text-sm text-slate-500">Matrimonios de conveniencia en licitaciones TIC.</p>
                        </div>
                        <div className="flex gap-2 text-xs">
                             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tier 1</span>
                             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Telco</span>
                             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Local</span>
                        </div>
                    </div>
                    {/* Key: Pass new data to force re-render/simulation restart if needed */}
                    <NetworkGraph data={network} />
                    <p className="text-xs text-slate-400 mt-2 italic">
                        Logic: Edges represent shared wins in `rel_resultado_ute_participante`. Thickness = Frequency.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- View: Rebound (Tactical Wins) ---
const ReboundView: React.FC<{ data: DesertedTender[], loading: boolean }> = ({ data, loading }) => {
    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="p-2 bg-amber-100 rounded-full">
                    <RefreshCcw className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-900">Oportunidades de Negociado</h3>
                    <p className="text-sm text-amber-800">
                        Licitaciones declaradas desiertas en los últimos 90 días. Alta probabilidad de procedimiento negociado sin publicidad.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Organismo</th>
                            <th className="px-6 py-3">Proyecto</th>
                            <th className="px-6 py-3">Presupuesto (Base)</th>
                            <th className="px-6 py-3">Fecha Desierto</th>
                            <th className="px-6 py-3">Causa Oficial</th>
                            <th className="px-6 py-3">Contactar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((tender) => (
                            <tr key={tender.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-2 font-medium text-slate-900">{tender.organism}</td>
                                <td className="px-6 py-6 text-slate-600 max-w-xs">
                                    {tender.url ? (
                                        <a 
                                            href={tender.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                            title={tender.title}
                                        >
                                            <span className="truncte">{tender.title}</span>
                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <span className="truncate" title={tender.title}>{tender.title}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-700">{EUR.format(tender.budget)}</td>
                                <td className="px-6 py-4 text-slate-500">{tender.date}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                        {tender.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs space-y-1">
                                        {tender.phone && tender.phone !== 'N/A' && (
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <span className="font-medium">📞</span>
                                                <span>{tender.phone}</span>
                                            </div>
                                        )}
                                        {tender.email && tender.email !== 'N/A' && (
                                            <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                                                <span className="font-medium">✉️</span>
                                                <a href={`mailto:${tender.email}`} className="underline">
                                                    {tender.email}
                                                </a>
                                            </div>
                                        )}
                                        {(!tender.phone || tender.phone === 'N/A') && (!tender.email || tender.email === 'N/A') && (
                                            <span className="text-slate-400 italic">Sin contacto</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- View: Search Adjudicatarios ---
const SearchView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedAdjudicatario, setSelectedAdjudicatario] = useState<any | null>(null);
    const [wonTenders, setWonTenders] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [loadingTenders, setLoadingTenders] = useState(false);

    const handleSearch = async () => {
        if (searchQuery.trim().length < 3) return;
        setSearching(true);
        try {
            const results = await api.searchAdjudicatarios(searchQuery);
            setSearchResults(results);
            setSelectedAdjudicatario(null);
            setWonTenders([]);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectAdjudicatario = async (adj: any) => {
        setSelectedAdjudicatario(adj);
        setLoadingTenders(true);
        try {
            const tenders = await api.getAdjudicatarioTenders(adj.id);
            setWonTenders(tenders);
        } catch (error) {
            console.error('Error loading tenders:', error);
        } finally {
            setLoadingTenders(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Buscar Adjudicatarios</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Buscar por nombre o NIF..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || searchQuery.trim().length < 3}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        Buscar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Results */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">
                            Resultados ({searchResults.length})
                        </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[600px]">
                        {searching ? (
                            <div className="p-8 text-center text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p>Buscando...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <p className="text-sm">Introduce un nombre o NIF para buscar</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {searchResults.map((adj) => (
                                    <li
                                        key={adj.id}
                                        onClick={() => handleSelectAdjudicatario(adj)}
                                        className={`px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                                            selectedAdjudicatario?.id === adj.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-slate-900">{adj.nombre}</p>
                                                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                                                    {adj.nif && <span>NIF: {adj.nif}</span>}
                                                    {adj.isPyme && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">PYME</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-emerald-600">{EUR.format(adj.totalAmount)}</p>
                                                <p className="text-xs text-slate-500">{adj.totalWins} adjudicaciones</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Won Tenders */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">
                            {selectedAdjudicatario ? `Licitaciones de ${selectedAdjudicatario.nombre}` : 'Selecciona un adjudicatario'}
                        </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[600px]">
                        {loadingTenders ? (
                            <div className="p-8 text-center text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p>Cargando licitaciones...</p>
                            </div>
                        ) : !selectedAdjudicatario ? (
                            <div className="p-8 text-center text-slate-400">
                                <p className="text-sm">Selecciona un adjudicatario para ver sus licitaciones ganadas</p>
                            </div>
                        ) : wonTenders.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <p className="text-sm">No hay licitaciones registradas</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {wonTenders.map((tender) => (
                                    <li key={tender.id} className="px-6 py-4 hover:bg-slate-50">
                                        <div className="space-y-2">
                                            {tender.url ? (
                                                <a
                                                    href={tender.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm flex items-center gap-1"
                                                >
                                                    <span className="lin">{tender.title}</span>
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <p className="font-medium text-sm text-slate-900 line-clamp-2">{tender.title}</p>
                                            )}
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>{tender.organism}</span>
                                                <span>{tender.fecha_adjudicacion}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-mono font-semibold text-emerald-600">
                                                    {EUR.format(tender.importe)}
                                                </span>
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                                    Baja: {tender.descuento}%
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.WAR_ROOM);
    
    // State for Data
    const [warRoomData, setWarRoomData] = useState<Tender[]>([]);
    const [marketData, setMarketData] = useState<OrganismKPI[]>([]);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [network, setNetwork] = useState<GraphData>({ nodes: [], links: [] });
    const [reboundData, setReboundData] = useState<DesertedTender[]>([]);

    // State for UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // In a real app, you might only fetch the data for the active tab
                // Here we fetch based on the tab to demonstrate the connection
                switch (activeTab) {
                    case Tab.WAR_ROOM:
                        if (warRoomData.length === 0) setWarRoomData(await api.getWarRoomData());
                        break;
                    case Tab.MARKET:
                        if (marketData.length === 0) setMarketData(await api.getMarketData());
                        break;
                    case Tab.COMPETITION:
                        if (competitors.length === 0) {
                            const result = await api.getCompetitionData();
                            setCompetitors(result.topCompetitors);
                            setNetwork(result.network);
                        }
                        break;
                    case Tab.REBOUND:
                        if (reboundData.length === 0) setReboundData(await api.getReboundData());
                        break;
                }
            } catch (err) {
                setError("No se pudo conectar con el servidor. Verifica que tu API esté corriendo.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <TrendingUp className="text-blue-500" />
                        Licita Monitor<span className="text-blue-500">.SIX</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Dashboard con estadísticas de licitaciones </p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button 
                        onClick={() => setActiveTab(Tab.WAR_ROOM)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === Tab.WAR_ROOM ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Zona de guerra</span>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab(Tab.MARKET)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === Tab.MARKET ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Mercado</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab(Tab.COMPETITION)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === Tab.COMPETITION ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
                    >
                        <Network className="w-5 h-5" />
                        <span className="font-medium">Competencia UTEs</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab(Tab.REBOUND)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === Tab.REBOUND ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
                    >
                        <RefreshCcw className="w-5 h-5" />
                        <span className="font-medium">Rebote (Táctico)</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab(Tab.SEARCH)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === Tab.SEARCH ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
                    >
                        <Search className="w-5 h-5" />
                        <span className="font-medium">Buscador</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded p-3 text-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-3 h-3 text-emerald-400" />
                            <span className="font-bold text-slate-200">System Status</span>
                        </div>
                        <p className="text-slate-400 font-mono text-[10px] truncate">{api.getStatus()}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {activeTab === Tab.WAR_ROOM && "Zona de guerra: Decisiones Diarias"}
                            {activeTab === Tab.MARKET && "Análisis de Organismos"}
                            {activeTab === Tab.COMPETITION && "Ingeniería de la Competencia"}
                            {activeTab === Tab.REBOUND && "Oportunidades de Rebote"}
                            {activeTab === Tab.SEARCH && "Buscador de Adjudicatarios"}
                        </h2>
                        <p className="text-sm text-slate-500">Sector TIC - Galicia - CPVs: 72*, 48*, 302*</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Buscar expediente..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg border border-slate-200">
                            <AlertTriangle className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            CEO
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {error ? (
                        <ErrorState message={error} />
                    ) : (
                        <>
                            {activeTab === Tab.WAR_ROOM && <WarRoomView data={warRoomData} loading={loading} />}
                            {activeTab === Tab.MARKET && <MarketView data={marketData} loading={loading} />}
                            {activeTab === Tab.COMPETITION && <CompetitionView competitors={competitors} network={network} loading={loading} />}
                            {activeTab === Tab.REBOUND && <ReboundView data={reboundData} loading={loading} />}
                            {activeTab === Tab.SEARCH && <SearchView />}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;