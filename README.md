# 🎯 Galicia Tender Intel

> Plataforma de inteligencia de licitaciones públicas para análisis competitivo, detección de oportunidades y gestión estratégica de contratación pública.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## 📋 Descripción

**Galicia Tender Intel** es una aplicación web full-stack que centraliza y analiza datos de licitaciones públicas, proporcionando:

- 📊 **Zona de guerra**: Licitaciones activas con filtros inteligentes
- 🏢 **Mercado**: Análisis de organismos y oportunidades (matriz de calidad, ranking de bajas)
- 🕸️ **Competencia**: Red de competencia entre adjudicatarios
- 🔄 **Rebote**: Licitaciones desiertas listas para re-ofertar
- 🔍 **Búsqueda de Empresas**: Historial completo de adjudicaciones con agrupación de marcos de acuerdo

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Recharts (visualizaciones)
- Lucide Icons

**Backend:**
- FastAPI (Python)
- PostgreSQL (base de datos)
- psycopg2 (ORM)
- Uvicorn (ASGI server)

**DevOps:**
- Docker + Docker Compose
- Portainer (gestión de contenedores)
- Adminer (gestión de BD)
- Nginx (reverse proxy para frontend)

---

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local (sin Docker)

**Requisitos:**
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (accesible)

#### Frontend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración

# Ejecutar en modo desarrollo
npm run dev
```

#### Backend
```bash
# Navegar a carpeta backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env.local en la raíz del proyecto
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Ejecutar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Acceso:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

### Opción 2: Docker Compose (Desarrollo)

**Requisitos:**
- Docker Desktop

```bash
# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local

# Levantar todos los servicios con hot-reload
docker-compose -f docker-compose.dev.yml up

# O en segundo plano
docker-compose -f docker-compose.dev.yml up -d
```

**Acceso:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

### Opción 3: Despliegue en Servidor con Portainer

**Stack completo con PostgreSQL + Adminer + Backend + Frontend**

📖 **Guía detallada:** [DEPLOY_PORTAINER.md](./DEPLOY_PORTAINER.md)

**Requisitos:**
- Servidor con Docker y Portainer
- Acceso SSH (opcional)
- FileBrowser (opcional, para edición de código)

**Pasos rápidos:**
1. Sube el proyecto a `/opt/docker/galicia-tender-intel`
2. Portainer → Stacks → Add stack
3. Pega el contenido de `docker-compose.portainer.yml`
4. Configura variables de entorno:
   - `DB_NAME=licitaciones_espana`
   - `DB_USER=admin`
   - `DB_PASSWORD=tu_password`
   - `VITE_API_URL=http://TU_IP_SERVIDOR:8000/api`
5. Deploy the stack

**Acceso:**
- App: `http://tu-servidor-ip/`
- Adminer (DB): `http://tu-servidor-ip:8080`
- API Docs: `http://tu-servidor-ip:8000/docs`

---

## 📁 Estructura del Proyecto

```
galicia-tender-intel/
├── backend/
│   ├── main.py              # API FastAPI
│   └── requirements.txt     # Dependencias Python
├── components/
│   └── NetworkGraph.tsx     # Componente de red de competencia
├── services/
│   ├── api.ts              # Cliente API
│   └── mockData.ts         # Datos de prueba
├── App.tsx                 # Aplicación principal
├── types.ts                # Definiciones TypeScript
├── Dockerfile.backend      # Imagen Docker backend
├── Dockerfile.frontend     # Imagen Docker frontend
├── docker-compose.yml      # Orquestación Docker (base)
├── docker-compose.dev.yml  # Desarrollo con hot-reload
├── docker-compose.portainer.yml  # Producción con Portainer
└── nginx.conf              # Configuración Nginx
```

---

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```env
# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=false

# Backend
DB_HOST=localhost  # o 'db' en Docker
DB_PORT=5432
DB_NAME=licitaciones_espana
DB_USER=admin
DB_PASSWORD=tu_password

# Gemini API (opcional)
GEMINI_API_KEY=tu_api_key
```

### Base de Datos

**Esquema:** `dw` (Data Warehouse)

**Tablas principales:**
- `fact_licitacion` - Licitaciones
- `fact_lote` - Lotes de licitaciones
- `fact_resultado_lote` - Resultados de adjudicación
- `dim_adjudicatario` - Empresas adjudicatarias
- `dim_organo` - Organismos públicos
- `rel_resultado_ute_participante` - UTEs y participantes

---

## 🛠️ Desarrollo

### Scripts NPM

```bash
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter
```

### Comandos Docker

```bash
# Desarrollo con hot-reload
docker-compose -f docker-compose.dev.yml up

# Producción local
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reconstruir después de cambios
docker-compose up -d --build

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra datos)
docker-compose down -v
```

### Backend (FastAPI)

```bash
# Ejecutar con hot-reload
uvicorn main:app --reload

# Ver documentación interactiva
# http://localhost:8000/docs
```

---

## 📊 Características Principales

### 1. War Room
- Licitaciones activas con deadline vigente
- Filtrado y búsqueda
- Vista detallada con enlace a expediente

### 2. Market Intelligence
- **Matriz de Calidad de Clientes**: Scatter plot con escala logarítmica que muestra volumen vs. tasa de éxito
- **Ranking de Bajas Temerarias**: Organismos que requieren mayor descuento para ganar
- Codificación por colores (verde, azul, naranja) según performance

### 3. Competition Network
- Grafo interactivo D3.js de competidores
- Filtra marcos de acuerdo (>3 adjudicatarios)
- Top 30 competidores por volumen

### 4. Rebound
- Licitaciones desiertas de últimos 90 días
- Clasificación por motivo (sin ofertas, inadmitidas, etc.)
- Datos de contacto del organismo

### 5. Búsqueda de Empresas
- Autocompletado por nombre o NIF
- Historial completo de adjudicaciones
- **Agrupación de marcos de acuerdo**: Licitaciones con mismo objeto_contrato se agrupan automáticamente
- Cálculo de descuento promedio

---

## 🔧 Solución de Problemas

### Frontend no conecta con Backend
```bash
# Verifica que VITE_API_URL sea correcta
cat .env.local | grep VITE_API_URL

# En producción Docker, reconstruye frontend
docker-compose up -d --build frontend
```

### Error de conexión a base de datos
```bash
# Verifica conectividad
docker exec -it galicia-tender-backend sh
ping db  # En Docker debe resolver

# Verifica credenciales
docker exec galicia-tender-backend env | grep DB_
```

### Importar datos SQL
```bash
# Con Docker
docker exec -i galicia-tender-db psql -U admin -d licitaciones_espana < dump.sql

# Local
psql -h localhost -U admin -d licitaciones_espana -f dump.sql
```

---

## 📚 Documentación Adicional

- [Guía de Despliegue con Portainer](./DEPLOY_PORTAINER.md)
- [Configuración Docker](./README.Docker.md)
- [API Documentation](http://localhost:8000/docs) (cuando el backend está corriendo)

---

## 🔒 Seguridad

**Recomendaciones para producción:**

1. Cambia credenciales por defecto de PostgreSQL
2. Usa Portainer Secrets para passwords
3. Configura firewall (UFW/iptables)
4. Implementa HTTPS con Nginx + Let's Encrypt o Traefik
5. Cierra puerto 8080 (Adminer) después de configurar
6. Backups automáticos de PostgreSQL:
   ```bash
   docker exec galicia-tender-db pg_dump -U admin licitaciones_espana > backup.sql
   ```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 👥 Soporte

Para soporte, abre un issue en el repositorio o contacta al equipo de desarrollo.

---

## 🎯 Roadmap

- [ ] Autenticación y roles de usuario
- [ ] Dashboard personalizable
- [ ] Alertas automáticas de nuevas licitaciones
- [ ] Exportación de reportes (PDF/Excel)
- [ ] API pública con rate limiting
- [ ] Análisis predictivo con ML
- [ ] Integración con plataformas de contratación

---

**Desarrollado con ❤️ para optimizar la gestión de licitaciones públicas**
