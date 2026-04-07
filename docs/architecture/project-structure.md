# Estructura de carpetas del proyecto

## Raiz

```text
PFC/
├── client/
├── server/
├── docs/
└── README.md
```

## Frontend (`client`)

```text
client/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── src/
    ├── api/
    ├── components/
    │   ├── common/
    │   ├── forms/
    │   ├── recipe/
    │   └── shopping/
    ├── constants/
    ├── context/
    ├── hooks/
    ├── navigation/
    ├── screens/
    │   ├── auth/
    │   ├── home/
    │   ├── profile/
    │   ├── recipes/
    │   ├── search/
    │   ├── shopping/
    │   └── settings/
    ├── services/
    ├── store/
    │   └── slices/
    ├── styles/
    ├── types/
    └── utils/
```

### Criterio de organizacion del frontend

- `api/`: configuracion del cliente HTTP y endpoints.
- `components/`: componentes reutilizables.
- `navigation/`: navegacion principal, tabs y stacks.
- `screens/`: pantallas completas de la aplicacion agrupadas por modulo.
- `services/`: logica de acceso a backend o transformaciones de datos.
- `store/`: estado global si se usa Redux Toolkit o similar.
- `types/`: interfaces y tipos compartidos.

## Backend (`server`)

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── ratings/
│   │   ├── recipes/
│   │   ├── shopping/
│   │   └── users/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── ratings/
│   │   ├── recipes/
│   │   ├── shopping/
│   │   └── users/
│   ├── services/
│   │   ├── external/
│   │   └── internal/
│   ├── utils/
│   └── validators/
├── tests/
│   ├── integration/
│   └── unit/
└── database/
    ├── migrations/
    ├── schema/
    └── seeders/
```

### Criterio de organizacion del backend

- `controllers/`: reciben peticiones HTTP y delegan la logica.
- `routes/`: definen endpoints por modulo.
- `services/internal/`: logica de negocio propia.
- `services/external/`: integracion con TheMealDB.
- `repositories/`: consultas y acceso a base de datos.
- `validators/`: validaciones de entrada.
- `middleware/`: autenticacion, control de errores, permisos.
- `database/`: scripts SQL, migraciones y datos de prueba.

## Documentacion (`docs`)

```text
docs/
├── api/
├── architecture/
├── database/
├── planning/
└── screens/
```

### Uso de la documentacion

- `api/`: endpoints, contratos y ejemplos de respuesta.
- `architecture/`: decisiones tecnicas y estructura del proyecto.
- `database/`: modelo entidad-relacion y scripts de base de datos.
- `planning/`: planificacion del proyecto, hitos y tareas.
- `screens/`: descripcion funcional de cada pantalla.
