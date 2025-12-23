-- Adminer 5.2.1 PostgreSQL 17.7 dump

CREATE SEQUENCE dim_adjudicatario_id_adjudicatario_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."dim_adjudicatario" (
    "id_adjudicatario" bigint DEFAULT nextval('dim_adjudicatario_id_adjudicatario_seq') NOT NULL,
    "nif" character varying(15),
    "nombre" text NOT NULL,
    "es_pyme" boolean,
    "pais" character varying(100),
    "provincia" character varying(100),
    "municipio" character varying(100),
    "sector_principal" character varying(100),
    "fecha_alta" date DEFAULT CURRENT_DATE,
    "id_grupo_empresarial" bigint,
    CONSTRAINT "dim_adjudicatario_pkey" PRIMARY KEY ("id_adjudicatario")
) WITH (oids = false);

CREATE UNIQUE INDEX dim_adjudicatario_nif_key ON dw.dim_adjudicatario USING btree (nif);

CREATE INDEX idx_adjudicatario_nombre ON dw.dim_adjudicatario USING btree (nombre);

CREATE INDEX idx_adjudicatario_grupo ON dw.dim_adjudicatario USING btree (id_grupo_empresarial);


CREATE TABLE "dw"."dim_cpv" (
    "codigo_cpv" character varying(9) NOT NULL,
    "descripcion" text NOT NULL,
    "nivel" smallint,
    "codigo_padre" character varying(9),
    CONSTRAINT "dim_cpv_pkey" PRIMARY KEY ("codigo_cpv")
) WITH (oids = false);


CREATE SEQUENCE dim_organo_id_organo_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."dim_organo" (
    "id_organo" bigint DEFAULT nextval('dim_organo_id_organo_seq') NOT NULL,
    "cod_dir3" character varying(20),
    "nif" character varying(15),
    "nombre" text NOT NULL,
    "tipo_administracion" character varying(50),
    "ambito_geografico" character varying(50),
    "actividad" character varying(255),
    "comunidad_autonoma" character varying(100),
    "provincia" character varying(100),
    "municipio" character varying(100),
    "codigo_postal" character varying(10),
    "url_perfil_contratante" text,
    "telefono_contacto" character varying(50),
    "email_contacto" character varying(255),
    "fecha_alta" date DEFAULT CURRENT_DATE,
    CONSTRAINT "dim_organo_pkey" PRIMARY KEY ("id_organo")
) WITH (oids = false);

CREATE UNIQUE INDEX dim_organo_cod_dir3_key ON dw.dim_organo USING btree (cod_dir3);

CREATE INDEX idx_organo_nombre ON dw.dim_organo USING btree (nombre);

CREATE INDEX idx_organo_ccaa_prov ON dw.dim_organo USING btree (comunidad_autonoma, provincia);


CREATE TABLE "dw"."dim_tiempo" (
    "id_fecha" integer NOT NULL,
    "fecha" date NOT NULL,
    "anio" integer NOT NULL,
    "trimestre" smallint NOT NULL,
    "mes" smallint NOT NULL,
    "dia" smallint NOT NULL,
    "nombre_mes" character varying(15),
    "semana_anio" smallint,
    CONSTRAINT "dim_tiempo_pkey" PRIMARY KEY ("id_fecha")
) WITH (oids = false);


CREATE SEQUENCE dim_ubicacion_id_ubicacion_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."dim_ubicacion" (
    "id_ubicacion" bigint DEFAULT nextval('dim_ubicacion_id_ubicacion_seq') NOT NULL,
    "codigo_nuts" character varying(10),
    "comunidad_autonoma" character varying(100),
    "provincia" character varying(100),
    "municipio" character varying(100),
    "codigo_postal" character varying(10),
    "pais" character varying(100),
    CONSTRAINT "dim_ubicacion_pkey" PRIMARY KEY ("id_ubicacion")
) WITH (oids = false);

CREATE INDEX idx_ubicacion_ccaa_prov_mun ON dw.dim_ubicacion USING btree (comunidad_autonoma, provincia, municipio);


CREATE SEQUENCE fact_criterio_adjudicacion_id_criterio_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "dw"."fact_criterio_adjudicacion" (
    "id_criterio" integer DEFAULT nextval('fact_criterio_adjudicacion_id_criterio_seq') NOT NULL,
    "id_licitacion" bigint NOT NULL,
    "descripcion" text,
    "tipo" character varying(20),
    "peso_pct" numeric(10,2),
    "formula" text,
    CONSTRAINT "fact_criterio_adjudicacion_pkey" PRIMARY KEY ("id_criterio")
) WITH (oids = false);

CREATE INDEX idx_criterio_licitacion ON dw.fact_criterio_adjudicacion USING btree (id_licitacion);

CREATE INDEX idx_criterio_tipo ON dw.fact_criterio_adjudicacion USING btree (tipo);


CREATE SEQUENCE fact_evento_licitacion_id_evento_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."fact_evento_licitacion" (
    "id_evento" bigint DEFAULT nextval('fact_evento_licitacion_id_evento_seq') NOT NULL,
    "id_licitacion" bigint NOT NULL,
    "id_fecha_evento" integer NOT NULL,
    "fecha_evento" timestamp NOT NULL,
    "tipo_evento" character varying(100),
    "estado_resultante" character varying(50),
    CONSTRAINT "fact_evento_licitacion_pkey" PRIMARY KEY ("id_evento")
) WITH (oids = false);

CREATE INDEX idx_evento_licitacion_fecha ON dw.fact_evento_licitacion USING btree (id_licitacion, fecha_evento);


CREATE SEQUENCE fact_licitacion_id_licitacion_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."fact_licitacion" (
    "id_licitacion" bigint DEFAULT nextval('fact_licitacion_id_licitacion_seq') NOT NULL,
    "contract_folder_id" character varying(100) NOT NULL,
    "version_expediente" integer DEFAULT '1',
    "tipo_expediente" character varying(50),
    "id_organo" bigint NOT NULL,
    "id_ubicacion" bigint,
    "id_fecha_publicacion" integer NOT NULL,
    "fecha_publicacion" date NOT NULL,
    "estado" character varying(50),
    "objeto_contrato" text NOT NULL,
    "tipo_contrato" character varying(50),
    "subtipo_contrato" character varying(100),
    "valor_estimado" numeric(18,2),
    "presupuesto_base_sin_iva" numeric(18,2),
    "presupuesto_base_con_iva" numeric(18,2),
    "plazo_ejecucion_dias" integer,
    "tipo_procedimiento" character varying(100),
    "tramitacion" character varying(50),
    "usa_subasta_electronica" boolean,
    "sujeto_regulacion_armonizada" boolean,
    "programa_financiacion" text,
    "num_lotes" integer,
    "num_licitadores_total" integer,
    "url_expediente" text,
    "url_pliego_administrativo" text,
    "url_pliego_tecnico" text,
    "fecha_limite_ofertas" date,
    "dias_para_ofertar" integer,
    "es_urgente" boolean DEFAULT false,
    "es_lote_multiple" boolean DEFAULT false,
    "peso_precio" numeric(5,2) DEFAULT '0',
    "peso_calidad" numeric(5,2) DEFAULT '0',
    "es_subasta" boolean DEFAULT false,
    "es_fondos_eu" boolean DEFAULT false,
    "document_hash" character varying(100),
    CONSTRAINT "fact_licitacion_pkey" PRIMARY KEY ("id_licitacion")
) WITH (oids = false);

CREATE INDEX idx_licitacion_organo_fecha ON dw.fact_licitacion USING btree (id_organo, fecha_publicacion);

CREATE INDEX idx_licitacion_estado_fecha ON dw.fact_licitacion USING btree (estado, fecha_publicacion);

CREATE INDEX idx_licitacion_tipo_proc ON dw.fact_licitacion USING btree (tipo_procedimiento);

CREATE INDEX idx_licitacion_fecha_limite ON dw.fact_licitacion USING btree (fecha_limite_ofertas);


CREATE SEQUENCE fact_lote_id_lote_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."fact_lote" (
    "id_lote" bigint DEFAULT nextval('fact_lote_id_lote_seq') NOT NULL,
    "id_licitacion" bigint NOT NULL,
    "numero_lote" character varying(50),
    "objeto_lote" text,
    "id_cpv_principal" character varying(9),
    "importe_lote_sin_iva" numeric(18,2),
    "importe_lote_con_iva" numeric(18,2),
    "id_ubicacion_ejecucion" bigint,
    "plazo_ejecucion_dias" integer,
    CONSTRAINT "fact_lote_pkey" PRIMARY KEY ("id_lote")
) WITH (oids = false);

CREATE INDEX idx_lote_licitacion ON dw.fact_lote USING btree (id_licitacion);

CREATE INDEX idx_lote_cpv ON dw.fact_lote USING btree (id_cpv_principal);


CREATE SEQUENCE fact_resultado_lote_id_resultado_lote_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."fact_resultado_lote" (
    "id_resultado_lote" bigint DEFAULT nextval('fact_resultado_lote_id_resultado_lote_seq') NOT NULL,
    "id_lote" bigint NOT NULL,
    "id_adjudicatario" bigint NOT NULL,
    "id_fecha_adjudicacion" integer,
    "fecha_adjudicacion" date,
    "importe_adjudicacion_sin_iva" numeric(18,2),
    "importe_adjudicacion_con_iva" numeric(18,2),
    "numero_licitadores" integer,
    "resultado" character varying(50),
    "es_ute" boolean DEFAULT false,
    "nombre_ute_virtual" text,
    "es_exito" boolean DEFAULT false,
    CONSTRAINT "fact_resultado_lote_pkey" PRIMARY KEY ("id_resultado_lote")
) WITH (oids = false);

CREATE INDEX idx_resultado_adjudicatario ON dw.fact_resultado_lote USING btree (id_adjudicatario);

CREATE INDEX idx_resultado_fecha ON dw.fact_resultado_lote USING btree (fecha_adjudicacion);

CREATE INDEX idx_resultado_exito ON dw.fact_resultado_lote USING btree (es_exito);


CREATE TABLE "mv_indicadores_cpv" ("codigo_cpv" character varying(9), "descripcion" text, "total_licitaciones" bigint, "baja_media_sector_pct" numeric, "presupuesto_medio" numeric, "competidores_promedio" numeric);


CREATE TABLE "dw"."rel_licitacion_cpv" (
    "id_licitacion" bigint NOT NULL,
    "codigo_cpv" character varying(9) NOT NULL,
    "es_principal" boolean DEFAULT false,
    CONSTRAINT "rel_licitacion_cpv_pkey" PRIMARY KEY ("id_licitacion", "codigo_cpv")
) WITH (oids = false);


CREATE TABLE "dw"."rel_lote_cpv" (
    "id_lote" bigint NOT NULL,
    "codigo_cpv" character varying(9) NOT NULL,
    "es_principal" boolean DEFAULT false,
    CONSTRAINT "rel_lote_cpv_pkey" PRIMARY KEY ("id_lote", "codigo_cpv")
) WITH (oids = false);


CREATE SEQUENCE rel_resultado_participante_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "dw"."rel_resultado_ute_participante" (
    "id_participacion" bigint DEFAULT nextval('rel_resultado_participante_id_seq') NOT NULL,
    "id_resultado_lote" bigint NOT NULL,
    "id_adjudicatario" bigint NOT NULL,
    "es_lider_ute" boolean DEFAULT false,
    "porcentaje_participacion" numeric(5,2),
    CONSTRAINT "pk_rel_resultado_ute" PRIMARY KEY ("id_participacion")
) WITH (oids = false);

CREATE INDEX idx_rel_ute_resultado ON dw.rel_resultado_ute_participante USING btree (id_resultado_lote);

CREATE INDEX idx_rel_ute_adjudicatario ON dw.rel_resultado_ute_participante USING btree (id_adjudicatario);


ALTER TABLE ONLY "dw"."dim_cpv" ADD CONSTRAINT "dim_cpv_codigo_padre_fkey" FOREIGN KEY (codigo_padre) REFERENCES dim_cpv(codigo_cpv) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."fact_criterio_adjudicacion" ADD CONSTRAINT "fact_criterio_adjudicacion_id_licitacion_fkey" FOREIGN KEY (id_licitacion) REFERENCES fact_licitacion(id_licitacion) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."fact_evento_licitacion" ADD CONSTRAINT "fact_evento_licitacion_id_fecha_evento_fkey" FOREIGN KEY (id_fecha_evento) REFERENCES dim_tiempo(id_fecha) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_evento_licitacion" ADD CONSTRAINT "fact_evento_licitacion_id_licitacion_fkey" FOREIGN KEY (id_licitacion) REFERENCES fact_licitacion(id_licitacion) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."fact_licitacion" ADD CONSTRAINT "fact_licitacion_id_fecha_publicacion_fkey" FOREIGN KEY (id_fecha_publicacion) REFERENCES dim_tiempo(id_fecha) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_licitacion" ADD CONSTRAINT "fact_licitacion_id_organo_fkey" FOREIGN KEY (id_organo) REFERENCES dim_organo(id_organo) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_licitacion" ADD CONSTRAINT "fact_licitacion_id_ubicacion_fkey" FOREIGN KEY (id_ubicacion) REFERENCES dim_ubicacion(id_ubicacion) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."fact_lote" ADD CONSTRAINT "fact_lote_id_cpv_principal_fkey" FOREIGN KEY (id_cpv_principal) REFERENCES dim_cpv(codigo_cpv) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_lote" ADD CONSTRAINT "fact_lote_id_licitacion_fkey" FOREIGN KEY (id_licitacion) REFERENCES fact_licitacion(id_licitacion) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_lote" ADD CONSTRAINT "fact_lote_id_ubicacion_ejecucion_fkey" FOREIGN KEY (id_ubicacion_ejecucion) REFERENCES dim_ubicacion(id_ubicacion) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."fact_resultado_lote" ADD CONSTRAINT "fact_resultado_lote_id_adjudicatario_fkey" FOREIGN KEY (id_adjudicatario) REFERENCES dim_adjudicatario(id_adjudicatario) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_resultado_lote" ADD CONSTRAINT "fact_resultado_lote_id_fecha_adjudicacion_fkey" FOREIGN KEY (id_fecha_adjudicacion) REFERENCES dim_tiempo(id_fecha) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."fact_resultado_lote" ADD CONSTRAINT "fact_resultado_lote_id_lote_fkey" FOREIGN KEY (id_lote) REFERENCES fact_lote(id_lote) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."rel_licitacion_cpv" ADD CONSTRAINT "rel_licitacion_cpv_codigo_cpv_fkey" FOREIGN KEY (codigo_cpv) REFERENCES dim_cpv(codigo_cpv) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."rel_licitacion_cpv" ADD CONSTRAINT "rel_licitacion_cpv_id_licitacion_fkey" FOREIGN KEY (id_licitacion) REFERENCES fact_licitacion(id_licitacion) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."rel_lote_cpv" ADD CONSTRAINT "rel_lote_cpv_codigo_cpv_fkey" FOREIGN KEY (codigo_cpv) REFERENCES dim_cpv(codigo_cpv) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."rel_lote_cpv" ADD CONSTRAINT "rel_lote_cpv_id_lote_fkey" FOREIGN KEY (id_lote) REFERENCES fact_lote(id_lote) NOT DEFERRABLE;

ALTER TABLE ONLY "dw"."rel_resultado_ute_participante" ADD CONSTRAINT "fk_rel_adjudicatario" FOREIGN KEY (id_adjudicatario) REFERENCES dim_adjudicatario(id_adjudicatario) NOT DEFERRABLE;
ALTER TABLE ONLY "dw"."rel_resultado_ute_participante" ADD CONSTRAINT "fk_rel_resultado" FOREIGN KEY (id_resultado_lote) REFERENCES fact_resultado_lote(id_resultado_lote) NOT DEFERRABLE;

DROP TABLE IF EXISTS "mv_indicadores_cpv";
CREATE VIEW "mv_indicadores_cpv" AS SELECT cpv.codigo_cpv,
    cpv.descripcion,
    count(DISTINCT lot.id_licitacion) AS total_licitaciones,
    round(avg(
        CASE
            WHEN ((fr.es_exito = true) AND (lot.importe_lote_con_iva > (0)::numeric)) THEN ((100.0 * (lot.importe_lote_con_iva - fr.importe_adjudicacion_con_iva)) / lot.importe_lote_con_iva)
            ELSE NULL::numeric
        END), 2) AS baja_media_sector_pct,
    round(avg(lot.importe_lote_con_iva), 0) AS presupuesto_medio,
    round(avg(fr.numero_licitadores), 1) AS competidores_promedio
   FROM (((dim_cpv cpv
     JOIN rel_lote_cpv rc ON (((rc.codigo_cpv)::text = (cpv.codigo_cpv)::text)))
     JOIN fact_lote lot ON ((lot.id_lote = rc.id_lote)))
     LEFT JOIN fact_resultado_lote fr ON ((fr.id_lote = lot.id_lote)))
  GROUP BY cpv.codigo_cpv, cpv.descripcion;

-- 2025-12-13 10:50:03 UTC
