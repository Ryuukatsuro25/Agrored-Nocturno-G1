# ms-productos · AgroRed S.A.S.

Microservicio de **productos** de AgroRed: gestiona los productos que la empresa fabrica o comercializa.
Responsable: **Juan Pablo Rueda Sánchez** · Puerto: **3002** · Base de datos propia: `productos_db` (MySQL).

Construido con Node.js + Express en capas (rutas → controlador → servicio → repositorio → modelo). Estado de **Taller 2 · semana 1**: CRUD completo, filtros, regla de negocio, persistencia en MySQL, contrato y colección de Postman. La seguridad JWT se incorporará en la semana 2 con el `auth.js` entregado por la docente.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8 (o MariaDB).

**1. Crear la base de datos y su usuario** (una sola vez, conectado como `root`):

```sql
CREATE DATABASE productos_db;
CREATE USER 'productos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON productos_db.* TO 'productos_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** desde `ms-productos`:

```text
mysql -u productos_user -p productos_db
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
| PORT | 3002 | Puerto del microservicio |
| HOST | 127.0.0.1 | Dirección local del servicio |
| DB_HOST / DB_PORT | localhost / 3306 | Dirección y puerto de MySQL |
| DB_NAME / DB_USER / DB_PASSWORD | productos_db / productos_user / … | Base y usuario propios del microservicio |

Verificación: `GET http://localhost:3002/health` debe responder `200` con `{"servicio":"ms-productos","estado":"ok"}`.

## Representación

Ejemplo de `GET /productos/2`:

```json
{ "id": 2, "nombre": "Tomate chonto", "categoria": "hortaliza", "unidad": "kg", "precio": 3200 }
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No | Lo asigna MySQL; positivo y único |
| nombre | texto | Sí | No vacío; único sin distinguir mayúsculas |
| categoria | texto | Sí | `fruta`, `hortaliza` o `procesado` |
| unidad | texto | Sí | `kg` o `caja` |
| precio | número | Sí | Mayor que 0 |

**Regla de negocio:** no puede haber dos productos con el mismo nombre, sin distinguir mayúsculas. La API responde `409 Conflict`. Las demás validaciones inválidas responden `400`.

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | `/productos` | — | 200 + arreglo | — |
| Filtrar | GET | `/productos?categoria=fruta` | — | 200 + arreglo filtrado | — |
| Consultar por lotes | GET | `/productos?ids=1,3,8` | — | 200 + arreglo | 400 ids inválidos |
| Obtener | GET | `/productos/:id` | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | `/productos` | JSON sin id | 201 + objeto + `Location` | 400 · 409 |
| Actualizar | PUT | `/productos/:id` | JSON completo sin id | 200 + objeto | 400 · 404 · 409 |
| Eliminar | DELETE | `/productos/:id` | — | 204 sin cuerpo | 400 · 404 |

Ejemplo de creación:

```http
POST /productos
Content-Type: application/json
```

```json
{ "nombre": "Aguacate Hass", "categoria": "fruta", "unidad": "kg", "precio": 9800 }
```

Respuesta esperada: `201 Created` y cabecera `Location`.

## Relaciones · contrato para la semana 2

`ms-productos` no guarda referencias a otros microservicios. En la integración de la semana 2 será consultado por `ms-pedidos`:

| Me consulta | Peticiones acordadas | Campos del contrato |
|---|---|---|
| ms-pedidos | `GET /productos/:id` · `GET /productos?ids=…` | id, nombre, precio |

Por eso el filtro `?ids=` ya queda disponible al finalizar la semana 1. La autenticación y la integración efectiva se incorporarán en la semana 2.

## Pruebas

Importe `docs/ms-productos.postman_collection.json`. La colección de esta entrega contiene los **casos 1 a 13** del CRUD y **no requiere token** ni ejecutar `ms-usuarios`.
