// This file contains the SQL Logic design requested by the user.
// In a real application, these would be executed on the backend.

export const SQL_LOGIC_EXPLANATION = {
    UTE_GRAPH_LOGIC: `
    -- LOGIC FOR NETWORK GRAPH (Matrimonios de Conveniencia)
    -- Aim: Find pairs of companies that participate together in a winning UTE.
    
    WITH participation AS (
        SELECT 
            r.id_resultado_lote,
            p.id_participante,
            p.nombre_empresa
        FROM dw.rel_resultado_ute_participante p
        JOIN dw.fact_resultado_lote r ON p.id_resultado_lote = r.id_resultado_lote
        WHERE r.es_ute = TRUE 
          AND r.es_exito = TRUE
          AND r.id_tiempo_adjudicacion > NOW() - INTERVAL '2 years'
    )
    SELECT 
        a.nombre_empresa as source,
        b.nombre_empresa as target,
        COUNT(*) as weight -- Thickness of line
    FROM participation a
    JOIN participation b ON a.id_resultado_lote = b.id_resultado_lote 
    WHERE a.id_participante < b.id_participante -- Avoid double counting (A-B and B-A) and self-loops
    GROUP BY 1, 2
    ORDER BY weight DESC;
    `,

    ORGANISM_MATRIX: `
    -- LOGIC FOR ORGANISM MATRIX (Volume vs Success)
    -- Aim: Identify "Toxic" clients (High Volume, Low Success Rate)
    
    SELECT 
        d.nombre_organo,
        SUM(f.presupuesto_base) as volumen_total_lanzado,
        -- Calculate Success Rate excluding technical cancellations if needed, 
        -- but here strictly 'Adjudicado' vs 'Desierto/Renuncia'
        (COUNT(CASE WHEN r.es_exito = TRUE THEN 1 END)::numeric / COUNT(*)) * 100 as tasa_exito
    FROM dw.fact_licitacion f
    JOIN dw.dim_organo d ON f.id_organo = d.id_organo
    LEFT JOIN dw.fact_resultado_lote r ON f.id_licitacion = r.id_licitacion
    WHERE f.fecha_publicacion > NOW() - INTERVAL '12 months'
    GROUP BY 1
    HAVING SUM(f.presupuesto_base) > 100000 -- Filter out tiny entities
    `,

    BAJA_TEMERARIA: `
    -- LOGIC FOR AVG DISCOUNT (Clean Mean)
    -- Constraint: Exclude 0s from deserted tenders
    
    SELECT 
        d.nombre_organo,
        AVG(r.baja_pct) as media_baja
    FROM dw.fact_resultado_lote r
    JOIN dw.dim_organo d ON r.id_organo = d.id_organo
    WHERE r.es_exito = TRUE -- CRITICAL FILTER
      AND r.baja_pct > 0 -- Sanity check
      AND r.baja_pct < 100
    GROUP BY 1
    ORDER BY 2 DESC
    `
};