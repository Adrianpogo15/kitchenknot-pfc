# Backend inicial

Se ha preparado un backend base con:

- Express como servidor HTTP
- carga de variables de entorno con `dotenv`
- conexion a PostgreSQL con `pg`
- ruta `GET /health`
- ruta `GET /api`
- ruta `GET /api/db-status` para comprobar la conexion a base de datos

## Comandos

Desde `server/`:

```bash
npm install
npm run dev
```

## Comprobaciones

- `GET /health`
- `GET /api`
- `GET /api/db-status`
