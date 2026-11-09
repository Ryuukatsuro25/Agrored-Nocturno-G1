# ms-clientes · AgroRed S.A.S.

Microservicio de **clientes** de AgroRed: gestiona los clientes empresariales que compran o distribuyen productos.
Responsable: **Juan José Osorio Reyes** · Puerto: **3003** · Base de datos propia: `clientes_db` (MySQL).

Construido con Node.js + Express en capas (rutas → controlador → servicio → repositorio → modelo). Estado de **Taller 2 · semana 1**: CRUD completo, filtros, regla de negocio, persistencia en MySQL, contrato y colección de Postman. La seguridad JWT se incorporará en la semana 2 con el `auth.js` entregado por la docente.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8 (o MariaDB).

**1. Crear la base de datos y su usuario** (una sola vez, conectado como `root`):

```sql
CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** desde `ms-clientes`:

```text
mysql -u clientes_user -p clientes_db
mysql> SOURCE db/schema.sql;
```

**3. Configurar e iniciar el servicio:**

```text
npm install
copy .env.example .env
npm run dev
```

Variables del `.env`:

| Variable | Ejemplo | Para qué |
|---|---|---|
| PORT | 3003 | Puerto del microservicio |
| HOST | 127.0.0.1 | Dirección local del servicio |
| DB_HOST / DB_PORT | localhost / 3306 | Dirección y puerto de MySQL |
| DB_NAME / DB_USER / DB_PASSWORD | clientes_db / clientes_user / … | Base y usuario propios del microservicio |

Verificación: `GET http://localhost:3003/health` debe responder `200` con `{"servicio":"ms-clientes","estado":"ok"}`.

## Representación

Ejemplo de `GET /clientes/1`:

```json
{ "id": 1, "nombre": "Distribuidora El Valle", "nit": "900123456-7", "ciudad": "Cali", "telefono": "6023334455", "tipo": "distribuidor" }
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No | Lo asigna MySQL; positivo y único |
| nombre | texto | Sí | No vacío |
| nit | texto | Sí | Formato `900123456-7`; único |
| ciudad | texto | Sí | No vacía |
| telefono | texto | Sí | Solo dígitos, de 7 a 10 |
| tipo | texto | Sí | `distribuidor` o `comercio` |

**Regla de negocio:** el NIT no puede repetirse. Si ya existe, la API responde `409 Conflict`. Las demás validaciones inválidas responden `400`.

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | `/clientes` | — | 200 + arreglo | — |
| Filtrar | GET | `/clientes?tipo=comercio` o `/clientes?ciudad=Cali` | — | 200 + arreglo filtrado | — |
| Consultar por lotes | GET | `/clientes?ids=1,3,8` | — | 200 + arreglo | 400 ids inválidos |
| Obtener | GET | `/clientes/:id` | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | `/clientes` | JSON sin id | 201 + objeto + `Location` | 400 · 409 |
| Actualizar | PUT | `/clientes/:id` | JSON completo sin id | 200 + objeto | 400 · 404 · 409 |
| Eliminar | DELETE | `/clientes/:id` | — | 204 sin cuerpo | 400 · 404 |

Ejemplo de creación:

```http
POST /clientes
Content-Type: application/json
```

```json
{ "nombre": "Frutas del Pacífico", "nit": "901555222-4", "ciudad": "Buenaventura", "telefono": "3154442211", "tipo": "distribuidor" }
```

Respuesta esperada: `201 Created` y cabecera `Location`.

## Relaciones · contrato para la semana 2

`ms-clientes` no guarda referencias a otros microservicios. En la integración de la semana 2 será consultado por `ms-pedidos`:

| Me consulta | Peticiones acordadas | Campos del contrato |
|---|---|---|
| ms-pedidos | `GET /clientes/:id` · `GET /clientes?ids=…` | id, nombre |

Por eso el filtro `?ids=` ya queda disponible al finalizar la semana 1. La autenticación y la integración efectiva se incorporarán en la semana 2.

## Pruebas

Importe `docs/ms-clientes.postman_collection.json`. La colección de esta entrega contiene los **casos 1 a 13** del CRUD y **no requiere token** ni ejecutar `ms-usuarios`.
