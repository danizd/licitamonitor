# ✅ Checklist Pre-Deploy a GitHub

## Archivos Esenciales

- [x] `.gitignore` - Actualizado con reglas completas
- [x] `.env.example` - Plantilla de variables de entorno
- [x] `README.md` - Documentación principal
- [x] `docker-compose.yml` - Configuración de contenedores
- [x] `Dockerfile.backend` - Imagen del backend
- [x] `Dockerfile.frontend` - Imagen del frontend
- [x] `.github/workflows/ci.yml` - Tests y builds automáticos
- [x] `.github/workflows/deploy.yml` - Despliegue automático
- [x] `.github/DEPLOYMENT.md` - Guía de despliegue

## Archivos Eliminados

- [x] `.env.local` - Variables locales (no debe estar en git)
- [x] `README.Docker.md` - Documentación de desarrollo local
- [x] `proyecto.zip` - Backup innecesario
- [x] `.portainer-env.example` - Específico de desarrollo local

## Configuración de Secrets en GitHub

Antes del primer deploy, configura estos secrets en GitHub:

1. `SERVER_HOST` - IP del servidor Oracle
2. `SERVER_USER` - Usuario SSH
3. `SSH_PRIVATE_KEY` - Clave privada SSH
4. `SSH_PORT` - Puerto SSH (opcional, default: 22)

## Estructura del Proyecto

```
licitamonitor/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Tests y builds
│   │   └── deploy.yml          # Despliegue automático
│   └── DEPLOYMENT.md           # Guía de despliegue
├── backend/
│   ├── main.py                 # Backend FastAPI
│   └── requirements.txt        # Dependencias Python
├── components/
│   └── NetworkGraph.tsx        # Componente de grafo
├── services/
│   ├── api.ts                  # Cliente API
│   └── mockData.ts             # Datos de prueba
├── .dockerignore               # Exclusiones Docker
├── .env.example                # Plantilla de variables
├── .gitignore                  # Exclusiones Git
├── App.tsx                     # Componente principal
├── docker-compose.yml          # Orquestación de contenedores
├── Dockerfile.backend          # Imagen backend
├── Dockerfile.frontend         # Imagen frontend
├── index.html                  # HTML principal
├── index.tsx                   # Entry point React
├── licitaciones_espana.sql     # Esquema de base de datos
├── nginx.conf                  # Configuración Nginx
├── package.json                # Dependencias Node.js
├── queries.ts                  # Queries TypeScript
├── README.md                   # Documentación principal
├── tsconfig.json               # Configuración TypeScript
├── types.ts                    # Tipos TypeScript
└── vite.config.ts              # Configuración Vite

## Preparación del Servidor Oracle

### 1. Crear Estructura de Directorios

```bash
sudo mkdir -p /opt/docker/licitamonitor
sudo chown $USER:$USER /opt/docker/licitamonitor
```

### 2. Verificar Contenedor PostgreSQL

```bash
docker ps | grep postgres
docker network inspect database_network
```

### 3. Configurar SSH para GitHub Actions

```bash
# Añadir clave pública de GitHub Actions
nano ~/.ssh/authorized_keys
```

## Comandos Útiles

### Ver estado de Git

```bash
git status
git log --oneline -10
```

### Verificar archivos que se subirán

```bash
git ls-files
```

### Ver archivos ignorados

```bash
git status --ignored
```

### Primer push al repositorio

```bash
git add .
git commit -m "Initial commit - LicitaMonitor"
git branch -M main
git remote add origin <url-repositorio>
git push -u origin main
```

## Flujo de Trabajo Recomendado

1. **Desarrollo local** → Trabajar en rama feature
2. **Commit y push** → Sube cambios a GitHub
3. **CI automático** → Tests y builds
4. **Pull Request** → Revisión de código
5. **Merge a main** → Despliegue automático

## Verificación Final

- [ ] No hay archivos `.env` en el repositorio
- [ ] `.env.example` tiene valores de ejemplo
- [ ] Todos los secrets están configurados en GitHub
- [ ] El servidor tiene la clave SSH pública
- [ ] La red `database_network` existe en el servidor
- [ ] El contenedor `postgres` está corriendo

## Post-Deploy

Después del primer despliegue:

```bash
# En el servidor Oracle
cd /opt/docker/licitamonitor
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Contacto

Para problemas o dudas, abre un issue en GitHub.
```
