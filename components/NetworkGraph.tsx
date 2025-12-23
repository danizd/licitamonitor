import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../types';

interface NetworkGraphProps {
    data: GraphData;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
    const fgRef = useRef<any>();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fgRef.current && data.nodes.length > 0) {
            // Configurar fuerzas del grafo
            fgRef.current.d3Force('charge').strength(-300);
            fgRef.current.d3Force('link').distance(80);
            
            // Centrar el grafo después de la simulación
            setTimeout(() => {
                fgRef.current?.zoomToFit(400, 80);
            }, 1000);
        }
    }, [data]);

    if (!data.nodes || data.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 text-slate-400">
                <p className="text-sm">No hay datos de red disponibles</p>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            style={{ 
                height: '400px', 
                width: '100%', 
                position: 'relative', 
                background: '#f8fafc', 
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                width={containerRef.current?.clientWidth || 800}
                height={400}
                nodeLabel={(node: any) => `${node.name}\n${node.wins} adjudicaciones\n€${(node.totalAmount / 1000000).toFixed(1)}M`}
                nodeColor={(node: any) => node.isPyme ? '#10b981' : '#3b82f6'}
                nodeRelSize={4}
                nodeVal={(node: any) => Math.max(node.wins, 3)}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    const label = node.name.split(' ')[0].substring(0, 12);
                    const fontSize = 10 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    // Draw circle
                    const nodeSize = Math.max(node.wins * 0.8, 4);
                    ctx.fillStyle = node.isPyme ? '#10b981' : '#3b82f6';
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
                    ctx.fill();
                    
                    // White border
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2 / globalScale;
                    ctx.stroke();

                    // Draw label background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(
                        node.x - bckgDimensions[0] / 2,
                        node.y + nodeSize + 2,
                        bckgDimensions[0],
                        bckgDimensions[1]
                    );

                    // Draw label text
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1e293b';
                    ctx.fillText(label, node.x, node.y + nodeSize + 2 + bckgDimensions[1] / 2);
                }}
                linkWidth={(link: any) => Math.sqrt(link.value) * 1.5}
                linkColor={() => '#cbd5e1'}
                linkDirectionalParticles={(link: any) => Math.min(link.value, 3)}
                linkDirectionalParticleWidth={3}
                linkDirectionalParticleSpeed={0.003}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                cooldownTicks={100}
                onEngineStop={() => {
                    if (fgRef.current) {
                        fgRef.current.zoomToFit(400, 80);
                    }
                }}
            />
        </div>
    );
};

export default NetworkGraph;