# Red Anti-Social

Red Anti-Social es una aplicación web para interactuar con publicaciones y usuarios. Permite registrarse e iniciar sesión, crear publicaciones, consultar sus detalles y comentarios, explorar etiquetas y ver perfiles con sus publicaciones y relaciones de seguimiento.

La interfaz está construida con React, TypeScript y Vite. Usa una API REST independiente para gestionar usuarios, publicaciones, comentarios, etiquetas e imágenes.

## Ejecutar el proyecto en local

### Requisitos

- Node.js y npm.
- Docker Desktop con Docker Compose, para iniciar los servicios que necesita el backend.

### 1. Iniciar el backend

En la carpeta del backend, iniciar MongoDB y Redis:

```bash
docker compose up -d
```

La primera vez que se inicia MongoDB, inicializar el replica set:

```bash
docker compose exec mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

Si el replica set ya se inicializó, no hace falta repetir ese comando.

Luego, desde la carpeta del backend, instalar dependencias e iniciar el servidor:

```bash
npm install
npm run dev
```

La API quedará disponible en `http://localhost:3000`.

### 2. Iniciar la aplicación web

En otra terminal, desde la carpeta de este proyecto:

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación. Abrir esa dirección en el navegador.

## URL de la API

- **Base de la API:** [http://localhost:3000](http://localhost:3000)
- **Documentación Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
