# Configuración de GitHub Actions para LicitaMonitor

Este proyecto utiliza GitHub Actions para CI/CD automatizado.

## Workflows Configurados

### 1. CI (Integración Continua)
**Archivo**: `.github/workflows/ci.yml`

Se ejecuta en:
- Pull Requests hacia `main`
- Pushes a ramas que no sean `main`

**Acciones**:
- ✅ Tests del backend (Python)
- ✅ Linting del backend (flake8)
- ✅ Tests del frontend (TypeScript)
- ✅ Build del frontend
- ✅ Build de imágenes Docker

### 2. Deploy (Despliegue Continuo)
**Archivo**: `.github/workflows/deploy.yml`

Se ejecuta en:
- Pushes a la rama `main`
- Manualmente desde GitHub Actions UI

**Acciones**:
- 🚀 Conexión SSH al servidor Oracle
- 📥 Pull de últimos cambios
- 🔨 Rebuild de contenedores Docker
- ▶️ Despliegue automático
- 🧹 Limpieza de imágenes antiguas

## Configuración de Secrets en GitHub

Para que los workflows funcionen, debes configurar los siguientes secrets en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Añade los siguientes secrets:

### Secrets Requeridos

```
SERVER_HOST = IP o dominio de tu servidor Oracle
SERVER_USER = Usuario SSH del servidor
SSH_PRIVATE_KEY = Clave privada SSH (contenido completo del archivo)
SSH_PORT = 22 (o el puerto SSH que uses)
```

## Cómo Generar SSH Key para Deploy

En tu máquina local:

```bash
# Generar par de claves SSH
ssh-keygen -t ed25519 -C "github-actions-licitamonitor" -f ~/.ssh/licitamonitor_deploy

# Copiar la clave pública al servidor
ssh-copy-id -i ~/.ssh/licitamonitor_deploy.pub usuario@servidor_oracle

# Copiar el contenido de la clave privada
cat ~/.ssh/licitamonitor_deploy
```

Luego pega el contenido completo de la clave privada en el secret `SSH_PRIVATE_KEY`.

## Preparación del Servidor Oracle

Asegúrate de que en tu servidor Oracle:

```bash
# 1. Crear directorio del proyecto
sudo mkdir -p /opt/docker/licitamonitor
sudo chown $USER:$USER /opt/docker/licitamonitor

# 2. Clonar el repositorio
cd /opt/docker/licitamonitor
git clone <url-repo> .

# 3. Configurar .env
cp .env.example .env
nano .env

# 4. Asegurar que la red database_network existe
docker network ls | grep database_network
```

## Flujo de Trabajo

### Desarrollo
1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits y push
3. Crear Pull Request
4. ✅ GitHub Actions ejecuta CI automáticamente
5. Si pasan los tests, hacer merge a `main`

### Despliegue
1. Al hacer merge a `main`
2. 🚀 GitHub Actions despliega automáticamente
3. Verifica el despliegue en GitHub Actions

## Despliegue Manual

También puedes desplegar manualmente:

1. Ve a Actions en GitHub
2. Selecciona "Deploy LicitaMonitor"
3. Click en "Run workflow"
4. Selecciona la rama `main`
5. Click en "Run workflow"

## Troubleshooting

### Error de conexión SSH
- Verifica que `SSH_PRIVATE_KEY` esté correctamente configurado
- Asegúrate de que la clave pública esté en el servidor
- Verifica firewall y puerto SSH

### Error en build de Docker
- Revisa los logs en GitHub Actions
- Verifica que el `docker-compose.yml` esté correcto
- Asegúrate de que la red `database_network` exista

### Despliegue falla pero CI pasa
- Verifica que el `.env` esté configurado en el servidor
- Asegúrate de que el contenedor `postgres` esté corriendo
- Revisa logs: `docker-compose logs -f`

## Monitoreo del Despliegue

Para ver el estado del despliegue:

```bash
# En el servidor Oracle
cd /opt/docker/licitamonitor
docker-compose ps
docker-compose logs -f
```

## Rollback

Si algo sale mal, puedes hacer rollback:

```bash
# En el servidor Oracle
cd /opt/docker/licitamonitor
git log --oneline  # Ver commits
git checkout <commit-hash-anterior>
docker-compose down
docker-compose up -d --build
```
