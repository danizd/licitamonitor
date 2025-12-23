from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

app = FastAPI(
    title="Galicia Tender Intel API",
    description="API para gestión de licitaciones de Galicia",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de base de datos
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "192.168.31.11"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "licitaciones_espana"),
    "user": os.getenv("DB_USER", "admin"),
    "password": os.getenv("DB_PASSWORD", "admin")
}

def get_db_connection():
    """Crear conexión a la base de datos"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

# Modelos
class Tender(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    organization: str
    budget: float
    deadline: Optional[date] = None
    status: str = "open"

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Galicia Tender Intel API", "status": "running"}

@app.get("/api/tenders/active")
def get_active_tenders():
    """Obtener licitaciones activas (abiertas y con plazo vigente)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                l.id_licitacion as id,
                l.objeto_contrato as title,
                COALESCE(l.tipo_contrato, 'Sin tipo') || COALESCE(' - ' || l.subtipo_contrato, '') as description,
                o.nombre as organism,
                COALESCE(l.presupuesto_base_con_iva, l.presupuesto_base_sin_iva, l.valor_estimado, 0) as budget,
                l.fecha_limite_ofertas as deadline,
                COALESCE(l.estado, 'open') as status,
                l.url_expediente as url
            FROM dw.fact_licitacion l
            INNER JOIN dw.dim_organo o ON l.id_organo = o.id_organo
            WHERE l.fecha_limite_ofertas IS NOT NULL
              AND l.fecha_limite_ofertas >= CURRENT_DATE
            ORDER BY l.fecha_limite_ofertas ASC
            LIMIT 100
        """)
        tenders = cursor.fetchall()
        print(f"Active tenders found: {len(tenders)}")
        return tenders
    except Exception as e:
        print(f"Error in active tenders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/tenders/deserted")
def get_deserted_tenders():
    """Obtener licitaciones desiertas o sin adjudicar"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                l.id_licitacion as id,
                l.objeto_contrato as title,
                COALESCE(l.tipo_contrato, 'Sin tipo') as description,
                o.nombre as organism,
                COALESCE(l.presupuesto_base_con_iva, l.presupuesto_base_sin_iva, l.valor_estimado, 0) as budget,
                l.fecha_limite_ofertas as deadline,
                TO_CHAR(l.fecha_limite_ofertas, 'DD/MM/YYYY') as date,
                COALESCE(l.estado, 'Desierta') as status,
                l.num_licitadores_total,
                CASE 
                    WHEN l.estado ILIKE '%Anulad%' THEN 'Anulada'
                    WHEN l.estado ILIKE '%Desestim%' THEN 'Desestimada'
                    WHEN l.estado ILIKE '%Desiert%' THEN 'Declarada desierta'
                    WHEN l.num_licitadores_total = 0 THEN 'Sin ofertas presentadas'
                    WHEN EXISTS (
                        SELECT 1 FROM dw.fact_lote lot
                        INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                        WHERE lot.id_licitacion = l.id_licitacion 
                          AND r.resultado ILIKE '%desiert%'
                        LIMIT 1
                    ) THEN 'Desierta'
                    WHEN EXISTS (
                        SELECT 1 FROM dw.fact_lote lot
                        INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                        WHERE lot.id_licitacion = l.id_licitacion 
                          AND r.resultado ILIKE '%inadmit%'
                        LIMIT 1
                    ) THEN 'Ofertas inadmitidas'
                    ELSE 'Sin adjudicar'
                END as reason,
                COALESCE(o.telefono_contacto, 'N/A') as phone,
                COALESCE(o.email_contacto, 'N/A') as email,
                l.url_expediente as url
            FROM dw.fact_licitacion l
            INNER JOIN dw.dim_organo o ON l.id_organo = o.id_organo
            LEFT JOIN dw.fact_lote lot ON lot.id_licitacion = l.id_licitacion
            LEFT JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote AND r.es_exito = true
            WHERE r.id_resultado_lote IS NULL
              AND l.fecha_limite_ofertas < CURRENT_DATE
              AND l.fecha_limite_ofertas >= CURRENT_DATE - INTERVAL '90 days'
            GROUP BY l.id_licitacion, o.nombre, o.telefono_contacto, o.email_contacto
            ORDER BY l.fecha_limite_ofertas DESC
            LIMIT 100
        """)
        tenders = cursor.fetchall()
        print(f"Deserted tenders found: {len(tenders)}")
        if len(tenders) > 0:
            print(f"First deserted tender: {tenders[0]}")
            print(f"Estado: {tenders[0]['status']}, Num licitadores: {tenders[0]['num_licitadores_total']}")
        return tenders
    except Exception as e:
        print(f"Error in deserted tenders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/tenders", response_model=List[Tender])
def get_tenders():
    """Obtener todas las licitaciones"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                l.id_licitacion as id,
                l.objeto_contrato as title,
                l.tipo_contrato as description,
                o.nombre as organization,
                COALESCE(l.presupuesto_base_con_iva, l.presupuesto_base_sin_iva, 0) as budget,
                l.fecha_limite_ofertas as deadline,
                l.estado as status
            FROM dw.fact_licitacion l
            INNER JOIN dw.dim_organo o ON l.id_organo = o.id_organo
            ORDER BY l.id_licitacion DESC
            LIMIT 100
        """)
        tenders = cursor.fetchall()
        return tenders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/tenders/{tender_id}", response_model=Tender)
def get_tender(tender_id: int):
    """Obtener una licitación específica"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM tenders WHERE id = %s", (tender_id,))
        tender = cursor.fetchone()
        if not tender:
            raise HTTPException(status_code=404, detail="Licitación no encontrada")
        return tender
    finally:
        cursor.close()
        conn.close()

@app.post("/api/tenders", response_model=Tender, status_code=201)
def create_tender(tender: Tender):
    """Crear una nueva licitación"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO tenders (title, description, organization, budget, deadline, status) 
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
            (tender.title, tender.description, tender.organization, 
             tender.budget, tender.deadline, tender.status)
        )
        new_tender = cursor.fetchone()
        conn.commit()
        return new_tender
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.put("/api/tenders/{tender_id}", response_model=Tender)
def update_tender(tender_id: int, tender: Tender):
    """Actualizar una licitación existente"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """UPDATE tenders 
               SET title=%s, description=%s, organization=%s, budget=%s, deadline=%s, status=%s
               WHERE id=%s RETURNING *""",
            (tender.title, tender.description, tender.organization,
             tender.budget, tender.deadline, tender.status, tender_id)
        )
        updated_tender = cursor.fetchone()
        if not updated_tender:
            raise HTTPException(status_code=404, detail="Licitación no encontrada")
        conn.commit()
        return updated_tender
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/tenders/{tender_id}")
def delete_tender(tender_id: int):
    """Eliminar una licitación"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tenders WHERE id = %s RETURNING id", (tender_id,))
        deleted = cursor.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Licitación no encontrada")
        conn.commit()
        return {"message": "Licitación eliminada"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/market/organisms")
def get_organisms():
    """Obtener KPIs de organismos"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH organism_stats AS (
                SELECT 
                    o.id_organo,
                    o.nif,
                    o.nombre,
                    o.tipo_administracion,
                    o.comunidad_autonoma,
                    COUNT(DISTINCT l.id_licitacion) as total_licitaciones,
                    COUNT(DISTINCT CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM dw.fact_lote lot
                            INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                            WHERE lot.id_licitacion = l.id_licitacion AND r.es_exito = true
                        ) THEN l.id_licitacion 
                    END) as licitaciones_adjudicadas,
                    COALESCE(SUM(l.presupuesto_base_con_iva), 0) as presupuesto_total,
                    COALESCE(AVG(l.presupuesto_base_con_iva), 0) as presupuesto_medio,
                    AVG(
                        CASE 
                            WHEN l.presupuesto_base_con_iva > 0 AND EXISTS (
                                SELECT 1 FROM dw.fact_lote lot
                                INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                                WHERE lot.id_licitacion = l.id_licitacion 
                                  AND r.es_exito = true
                                  AND r.importe_adjudicacion_con_iva IS NOT NULL
                                  AND r.importe_adjudicacion_con_iva > 0
                            ) THEN (
                                SELECT 
                                    ((l.presupuesto_base_con_iva - MIN(r.importe_adjudicacion_con_iva)) / l.presupuesto_base_con_iva * 100)
                                FROM dw.fact_lote lot
                                INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                                WHERE lot.id_licitacion = l.id_licitacion AND r.es_exito = true
                            )
                            ELSE NULL
                        END
                    ) as baja_media
                FROM dw.dim_organo o
                LEFT JOIN dw.fact_licitacion l ON o.id_organo = l.id_organo
                GROUP BY o.id_organo, o.nif, o.nombre, o.tipo_administracion, o.comunidad_autonoma
                HAVING COUNT(l.id_licitacion) > 0
            )
            SELECT 
                COALESCE(nif, SUBSTRING(nombre, 1, 20)) as name,
                nombre as "fullName",
                COALESCE(tipo_administracion, 'N/A') as tipo_administracion,
                COALESCE(comunidad_autonoma, 'N/A') as comunidad_autonoma,
                total_licitaciones as "totalTenders",
                presupuesto_total::FLOAT as "totalVolume",
                presupuesto_medio::FLOAT as "avgBudget",
                CASE 
                    WHEN total_licitaciones > 0 
                    THEN ROUND((licitaciones_adjudicadas::NUMERIC / total_licitaciones::NUMERIC * 100), 1)::FLOAT
                    ELSE 0 
                END as "successRate",
                COALESCE(ROUND(baja_media::NUMERIC, 2)::FLOAT, 0) as "avgDiscount"
            FROM organism_stats
            WHERE presupuesto_total > 0
            ORDER BY presupuesto_total DESC
            LIMIT 20
        """)
        organisms = cursor.fetchall()
        print(f"Organisms found: {len(organisms)}")
        if len(organisms) > 0:
            print(f"First organism: {organisms[0]}")
        return organisms
    except Exception as e:
        print(f"Error in organisms: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/competition/top")
def get_top_competitors():
    """Obtener competidores principales (empresas con más adjudicaciones)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                a.nombre as name,
                COALESCE(a.es_pyme, false) as "isPyme",
                COALESCE(a.provincia, 'N/A') as location,
                COUNT(DISTINCT r.id_resultado_lote) as wins,
                COALESCE(SUM(CAST(r.importe_adjudicacion_con_iva AS NUMERIC)), 0)::FLOAT as "totalAmount",
                COALESCE(AVG(CAST(r.importe_adjudicacion_con_iva AS NUMERIC)), 0)::FLOAT as "avgBid"
            FROM dw.dim_adjudicatario a
            INNER JOIN dw.fact_resultado_lote r ON a.id_adjudicatario = r.id_adjudicatario
            WHERE r.es_exito = true
              AND r.importe_adjudicacion_con_iva IS NOT NULL
              AND r.importe_adjudicacion_con_iva > 0
            GROUP BY a.id_adjudicatario, a.nombre, a.es_pyme, a.provincia
            HAVING COUNT(DISTINCT r.id_resultado_lote) > 0
            ORDER BY "totalAmount" DESC
            LIMIT 20
        """)
        competitors = cursor.fetchall()
        print(f"Competitors found: {len(competitors)}")
        if len(competitors) > 0:
            print(f"First competitor: {competitors[0]}")
        return competitors
    except Exception as e:
        print(f"Error in competitors: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/competition/network")
def get_competition_network():
    """Obtener red de competencia (empresas que compiten frecuentemente)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Obtener nodos (empresas con adjudicaciones)
        cursor.execute("""
            WITH top_companies AS (
                SELECT 
                    a.id_adjudicatario,
                    a.nombre,
                    COUNT(DISTINCT r.id_resultado_lote) as wins,
                    COALESCE(a.es_pyme, false) as es_pyme,
                    COALESCE(SUM(r.importe_adjudicacion_con_iva), 0) as total_amount
                FROM dw.dim_adjudicatario a
                INNER JOIN dw.fact_resultado_lote r ON a.id_adjudicatario = r.id_adjudicatario
                WHERE r.es_exito = true
                GROUP BY a.id_adjudicatario, a.nombre, a.es_pyme
                HAVING COUNT(DISTINCT r.id_resultado_lote) >= 1
                ORDER BY wins DESC
                LIMIT 30
            )
            SELECT 
                nombre as id,
                nombre as name,
                wins,
                es_pyme as "isPyme",
                total_amount as "totalAmount"
            FROM top_companies
        """)
        nodes = cursor.fetchall()
        
        print(f"Network nodes found: {len(nodes)}")
        
        if len(nodes) == 0:
            return {"nodes": [], "links": []}
        
        # Crear lista de nombres de nodos para filtrar enlaces
        node_names = [node['name'] for node in nodes]
        
        # Crear enlaces basados en competencia (empresas que ganan lotes de la misma licitación)
        # Excluimos licitaciones con muchos adjudicatarios (marcos de acuerdo) para evitar distorsiones
        print("Creating links based on common tenders")
        cursor.execute("""
            WITH top_companies AS (
                SELECT 
                    a.id_adjudicatario,
                    a.nombre
                FROM dw.dim_adjudicatario a
                INNER JOIN dw.fact_resultado_lote r ON a.id_adjudicatario = r.id_adjudicatario
                WHERE r.es_exito = true
                GROUP BY a.id_adjudicatario, a.nombre
                HAVING COUNT(DISTINCT r.id_resultado_lote) >= 1
                ORDER BY COUNT(DISTINCT r.id_resultado_lote) DESC
                LIMIT 30
            ),
            licitaciones_validas AS (
                -- Excluir licitaciones con más de 3 adjudicatarios diferentes (marcos de acuerdo)
                SELECT lot.id_licitacion
                FROM dw.fact_lote lot
                INNER JOIN dw.fact_resultado_lote r ON lot.id_lote = r.id_lote
                WHERE r.es_exito = true
                GROUP BY lot.id_licitacion
                HAVING COUNT(DISTINCT r.id_adjudicatario) <= 3
            )
            SELECT 
                a1.nombre as source,
                a2.nombre as target,
                COUNT(DISTINCT lot1.id_licitacion) as value
            FROM dw.fact_resultado_lote r1
            INNER JOIN dw.fact_lote lot1 ON r1.id_lote = lot1.id_lote
            INNER JOIN licitaciones_validas lv ON lot1.id_licitacion = lv.id_licitacion
            INNER JOIN dw.dim_adjudicatario a1 ON r1.id_adjudicatario = a1.id_adjudicatario
            INNER JOIN dw.fact_lote lot2 ON lot1.id_licitacion = lot2.id_licitacion
            INNER JOIN dw.fact_resultado_lote r2 ON lot2.id_lote = r2.id_lote
            INNER JOIN dw.dim_adjudicatario a2 ON r2.id_adjudicatario = a2.id_adjudicatario
            INNER JOIN top_companies tc1 ON a1.id_adjudicatario = tc1.id_adjudicatario
            INNER JOIN top_companies tc2 ON a2.id_adjudicatario = tc2.id_adjudicatario
            WHERE r1.id_adjudicatario < r2.id_adjudicatario
              AND r1.es_exito = true
              AND r2.es_exito = true
            GROUP BY a1.nombre, a2.nombre
            HAVING COUNT(DISTINCT lot1.id_licitacion) >= 2
            ORDER BY value DESC
            LIMIT 50
        """)
        links = cursor.fetchall()
        
        # Filtrar enlaces adicionales en Python por seguridad
        filtered_links = [
            link for link in links 
            if link['source'] in node_names and link['target'] in node_names
        ]
        
        print(f"Network links found: {len(filtered_links)}")
        
        return {"nodes": nodes, "links": filtered_links}
    except Exception as e:
        print(f"Error in network: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/adjudicatarios/search")
def search_adjudicatarios(q: str = ""):
    """Buscar adjudicatarios por nombre o NIF"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                a.id_adjudicatario as id,
                a.nombre,
                a.nif,
                COALESCE(a.es_pyme, false) as "isPyme",
                COALESCE(a.provincia, 'N/A') as provincia,
                COUNT(DISTINCT r.id_resultado_lote) as "totalWins",
                COALESCE(SUM(r.importe_adjudicacion_con_iva), 0)::FLOAT as "totalAmount",
                COALESCE(AVG(r.importe_adjudicacion_con_iva), 0)::FLOAT as "avgAmount"
            FROM dw.dim_adjudicatario a
            LEFT JOIN dw.fact_resultado_lote r ON a.id_adjudicatario = r.id_adjudicatario AND r.es_exito = true
            WHERE a.nombre ILIKE %s OR a.nif ILIKE %s
            GROUP BY a.id_adjudicatario, a.nombre, a.nif, a.es_pyme, a.provincia
            ORDER BY "totalAmount" DESC
            LIMIT 50
        """, (f'%{q}%', f'%{q}%'))
        results = cursor.fetchall()
        print(f"Search results for '{q}': {len(results)}")
        return results
    except Exception as e:
        print(f"Error searching adjudicatarios: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/adjudicatarios/{adjudicatario_id}/tenders")
def get_adjudicatario_tenders(adjudicatario_id: int):
    """Obtener licitaciones ganadas por un adjudicatario, agrupando marcos de acuerdo"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH licitaciones_agrupadas AS (
                SELECT 
                    l.objeto_contrato,
                    MIN(l.id_licitacion) as id_representativa,
                    COUNT(DISTINCT l.id_licitacion) as num_licitaciones,
                    MAX(o.nombre) as organism,
                    MIN(r.fecha_adjudicacion) as primera_adjudicacion,
                    SUM(r.importe_adjudicacion_con_iva) as importe_total,
                    SUM(lot.importe_lote_con_iva) as presupuesto_total,
                    COUNT(DISTINCT lot.id_lote) as total_lotes,
                    MAX(l.url_expediente) as url
                FROM dw.fact_resultado_lote r
                INNER JOIN dw.fact_lote lot ON r.id_lote = lot.id_lote
                INNER JOIN dw.fact_licitacion l ON lot.id_licitacion = l.id_licitacion
                INNER JOIN dw.dim_organo o ON l.id_organo = o.id_organo
                WHERE r.id_adjudicatario = %s
                  AND r.es_exito = true
                GROUP BY l.objeto_contrato
            )
            SELECT 
                id_representativa as id,
                CASE 
                    WHEN num_licitaciones > 1 
                    THEN objeto_contrato || ' [Marco: ' || num_licitaciones || ' licitaciones]'
                    ELSE objeto_contrato
                END as title,
                organism,
                TO_CHAR(primera_adjudicacion, 'DD/MM/YYYY') as fecha_adjudicacion,
                COALESCE(importe_total, 0) as importe,
                COALESCE(presupuesto_total, 0) as presupuesto_base,
                CASE 
                    WHEN presupuesto_total > 0 
                    THEN ROUND(((presupuesto_total - importe_total) / presupuesto_total * 100), 2)
                    ELSE 0
                END as descuento,
                url,
                total_lotes as num_lotes,
                num_licitaciones as agrupadas
            FROM licitaciones_agrupadas
            ORDER BY primera_adjudicacion DESC
            LIMIT 100
        """, (adjudicatario_id,))
        tenders = cursor.fetchall()
        print(f"Tenders won by adjudicatario {adjudicatario_id}: {len(tenders)} (grouped)")
        return tenders
    except Exception as e:
        print(f"Error getting adjudicatario tenders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
