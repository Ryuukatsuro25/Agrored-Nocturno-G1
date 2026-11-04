# ms-pedidos · AgroRed S.A.S.

Microservicio de **pedidos** de la aplicación de AgroRed: gestiona los pedidos de los clientes: qué producto, cuánto y desde qué centro de distribución.
Responsable: **Valeria Polanco Muñoz** · Puerto: **3004** · Base de datos propia: `pedidos_db` (MySQL).

Construido con Node.js + Express en capas (rutas → controlador → servicio → repositorio → modelo). Versión del Taller 2: CRUD completo, filtros, persistencia en MySQL y seguridad con JWT, más las relaciones con ms-clientes y ms-productos.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8 (o MariaDB).

**1. Crear la base de datos y su usuario** (una sola vez, conectado como `root` en MySQL Workbench o en la consola `mysql -u root -p`):

```sql
CREATE DATABASE pedidos_db;
CREATE USER 'pedidos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON pedidos_db.* TO 'pedidos_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** (desde la carpeta `ms-pedidos`):

```
mysql -u pedidos_user -p pedidos_db
mysql> SOURCE db/schema.sql;
```

**3. Configurar e iniciar el servicio:**

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

Variables del `.env` (el archivo nunca se sube al repositorio):

| Variable | Ejemplo | Para qué |
|---|---|---|
| PORT | 3004 | Puerto del microservicio |
| HOST | 127.0.0.1 | Solo acepta conexiones del mismo equipo |
| DB_HOST / DB_PORT | localhost / 3306 | Dónde está MySQL (en el Taller 3: la IP de servidor1) |
| DB_NAME / DB_USER / DB_PASSWORD | pedidos_db / pedidos_user / … | Base y usuario propios del microservicio |
| JWT_SECRET | (frase del grupo) | La misma en todos los microservicios; verifica los tokens |
| CLIENTES_URL | http://127.0.0.1:3003 | Dónde está ms-clientes |
| PRODUCTOS_URL | http://127.0.0.1:3002 | Dónde está ms-productos |

Verificar: `http://localhost:3004/health` responde `{"servicio":"ms-pedidos","estado":"ok"}`. Las demás rutas exigen un token de ms-usuarios.

## Representación

Así responde `GET /pedidos/2`:

```json
{ "id": 2, "cliente_id": 2, "producto_id": 2, "cantidad": 80, "centro_distribucion": "Bogotá", "estado": "recibido", "fecha": "2026-10-26",
  "cliente": { "id": 2, "nombre": "Fruver La Sabana" },
  "producto": { "id": 2, "nombre": "Tomate chonto", "precio": 3200 } }
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| cliente_id | entero | Sí | Debe existir en ms-clientes (400 si no; 503 si no responde) |
| producto_id | entero | Sí | Debe existir en ms-productos (400 si no; 503 si no responde) |
| cantidad | entero | Sí | Mayor que 0 |
| centro_distribucion | texto | Sí | Bogotá o Cali |
| estado | texto | Al crear no (siempre recibido); en PUT sí | recibido, despachado o entregado |
| fecha | fecha AAAA-MM-DD | Al crear no (hoy); en PUT sí | Fecha válida |

**Regla de negocio:** Todo pedido nuevo empieza en estado recibido (400 si llega otro) y sin fecha se registra con la de hoy; un pedido ya entregado no se puede modificar (409). Además: cantidad entera > 0 y centro de distribución dentro de su lista (400).

## Endpoints

Todas las rutas (salvo `/health`) exigen la cabecera `Authorization: Bearer <token>`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /pedidos | — | 200 + arreglo | 401 |
| Filtrar | GET | /pedidos?estado=recibido | — | 200 + arreglo filtrado | 400 · 401 |
| Obtener | GET | /pedidos/:id | — | 200 + objeto | 400 id inválido · 401 · 404 |
| Crear | POST | /pedidos | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 503 |
| Actualizar | PUT | /pedidos/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 401 · 403 · 404 · 409 · 503 |
| Eliminar | DELETE | /pedidos/:id | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Ejemplo · crear:

```
POST /pedidos
Authorization: Bearer <token>
Content-Type: application/json

{ "cliente_id": 1, "producto_id": 2, "cantidad": 50, "centro_distribucion": "Cali" }

→ 201 Created · Location: /pedidos/4
{ "id": 4, "cliente_id": 1, "producto_id": 2, "cantidad": 50, "centro_distribucion": "Cali", "estado": "recibido", "fecha": "2026-11-03",
  "cliente": { "id": 1, "nombre": "Distribuidora El Valle" }, "producto": { "id": 2, "nombre": "Tomate chonto", "precio": 3200 } }
```

Ejemplo · listar con filtro:

```
GET /pedidos?estado=recibido
→ 200 OK · arreglo con los registros que cumplen el filtro
```

Errores: siempre `{"error": "...", "detalles": [...]}` (detalles solo en validación).

## Seguridad

| Entidad | Consultan (GET) | Crean, modifican y eliminan |
|---|---|---|
| Pedidos | administrador, comercial, produccion | administrador, comercial |

Sin token o con un token inválido: 401. Con un rol sin permiso: 403.

## Relaciones

ms-pedidos **guarda las referencias** y consulta a los otros dos microservicios, reenviando el token del usuario:

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| cliente_id | ms-clientes | GET /clientes/:id | GET /clientes?ids=… | id, nombre |
| producto_id | ms-productos | GET /productos/:id | GET /productos?ids=… | id, nombre, precio |

Si la referencia no existe: 400. Si el otro microservicio no responde al escribir: 503; al leer, la respuesta sale con el objeto en `null` y un `aviso` (degradación controlada). Para un listado se hace **una sola** consulta por lotes a cada microservicio. El código está en `src/clients/`.

## Pruebas

Colección de Postman en `docs/ms-pedidos.postman_collection.json` (Import en Postman). Ejecute primero la carpeta 0 (inicio de sesión) con ms-usuarios corriendo.
