# AgroRed S.A.S. · Aplicación web con microservicios

Redes y Servicios Multimedia · Universidad Autónoma de Occidente · Jornada nocturna · Grupo 1 · Módulo 3 (2026-03)

Aplicación de **AgroRed S.A.S.** (agroindustria y distribución) para gestionar productos, clientes y pedidos con inicio de sesión por rol. Microservicios REST en **Node.js + Express** organizados en capas, cada uno con su propia base de datos MySQL, protegidos con tokens JWT.

## Integrantes

| Integrante | Usuario de GitHub | Microservicio | Puerto |
|---|---|---|---|
| Juan Pablo Rueda Sánchez | [Juanrueda236](https://github.com/Juanrueda236) | [ms-productos](ms-productos) | 3002 |
| Juan José Osorio Reyes | [Ryuukatsuro25](https://github.com/Ryuukatsuro25) | [ms-clientes](ms-clientes) | 3003 |
| Valeria Polanco Muñoz | [Val-polanco](https://github.com/Val-polanco) | [ms-pedidos](ms-pedidos) | 3004 |
| Docente | — | [ms-usuarios](ms-usuarios) | 3001 |

Cada integrante sube su microservicio con su propia cuenta; el historial de commits es la evidencia del trabajo individual.

## Microservicios

| Microservicio | Entidad | Puerto | Base de datos | Referencia a |
|---|---|---|---|---|
| ms-usuarios | Usuario (entregado por la docente) | 3001 | usuarios_db | — |
| ms-productos | Producto | 3002 | productos_db | — |
| ms-clientes | Cliente | 3003 | clientes_db | — |
| ms-pedidos | Pedido | 3004 | pedidos_db | ms-clientes (`cliente_id`), ms-productos (`producto_id`) |

La única relación es **Pedidos → Clientes y Productos**: ms-pedidos guarda los ids y consulta a los otros dos por REST (`GET /:id` para validar, `GET ?ids=` para componer). Cada README tiene el contrato completo.

## Roles y permisos

| Entidad | Consultan (GET) | Crean, modifican y eliminan |
|---|---|---|
| Usuarios | administrador | administrador |
| Productos | administrador, comercial, produccion | administrador, produccion |
| Clientes | administrador, comercial, produccion | administrador, comercial |
| Pedidos | administrador, comercial, produccion | administrador, comercial |

## Estructura del repositorio

```
agrored-nocturno-g1/
├── README.md
├── ms-usuarios/     ← entregado por la docente (no se modifica)
├── ms-productos/    ← src/, db/schema.sql, docs/ (Postman), README.md, .env.example
├── ms-clientes/
├── ms-pedidos/      ← además src/clients/ (relaciones)
└── frontend/        ← interfaz web (grupal)
```

## Ejecutar todo en un PC

1. En cada carpeta `ms-*`: crear la base de datos y cargar `db/schema.sql` (ver su README).
2. Crear el `.env` de cada uno desde `.env.example`, con la **misma JWT_SECRET** en todos.
3. `npm install` y `npm run dev` en cada carpeta, cada uno en su propia terminal: ms-usuarios (3001), ms-productos (3002), ms-clientes (3003), ms-pedidos (3004).
4. Postman: importar `ms-*/docs/*.postman_collection.json` y ejecutar primero la carpeta 0 (inicio de sesión).

## Convenciones

- Atributos en `snake_case`, iguales en el JSON y en las columnas de MySQL.
- Cada integrante modifica solo su carpeta y hace commits pequeños con su cuenta: `ms-<recurso>: qué cambió`.
- Nunca se suben `node_modules` ni `.env`. Todos los datos son ficticios.
