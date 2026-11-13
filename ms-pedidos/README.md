# ms-pedidos · AgroRed S.A.S.

Microservicio de **pedidos** de AgroRed S.A.S. Gestiona los pedidos de los clientes: producto solicitado, cantidad, centro de distribución, estado y fecha.

**Responsable:** Valeria Polanco Muñoz  
**Puerto:** `3004`  
**Base de datos propia:** `pedidos_db` (MySQL)

Está construido con Node.js + Express usando arquitectura en capas:

`rutas → controlador → servicio → repositorio → modelo`

## Alcance actual · Taller 2, Semana 1

En esta etapa el microservicio incluye:

- API REST con CRUD completo.
- Filtros por `estado` y `cliente_id`.
- Validaciones y reglas de negocio.
- Persistencia en MySQL.
- Códigos de estado HTTP.
- Colección de Postman con los casos de prueba de la Semana 1.
- Contrato de las relaciones que se implementarán en la Semana 2.

**Todavía no se implementan JWT, permisos por rol ni llamadas REST a otros microservicios.**

---

## Cómo ejecutarlo

### Requisitos

- Node.js
- MySQL 8 o compatible
- npm

### 1. Crear la base de datos y el usuario

Ejecutar una sola vez como `root` en MySQL Workbench o consola:

```sql
CREATE DATABASE pedidos_db;
CREATE USER 'pedidos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON pedidos_db.* TO 'pedidos_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Crear la tabla y los registros iniciales

Desde la carpeta `ms-pedidos`:

```text
mysql -u pedidos_user -p pedidos_db
mysql> SOURCE db/schema.sql;
```

### 3. Configurar las variables de entorno

Copiar:

```text
.env.example
```

como:

```text
.env
```

y completar la contraseña local de MySQL.

Variables utilizadas:

| Variable | Ejemplo | Uso |
|---|---|---|
| `PORT` | `3004` | Puerto del microservicio |
| `HOST` | `127.0.0.1` | Dirección donde escucha el servicio |
| `DB_HOST` | `localhost` | Servidor MySQL |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DB_NAME` | `pedidos_db` | Base de datos |
| `DB_USER` | `pedidos_user` | Usuario de la base |
| `DB_PASSWORD` | — | Contraseña local |

El archivo `.env` **no se sube al repositorio**.

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

Verificación:

```text
GET http://127.0.0.1:3004/health
```

Respuesta esperada:

```json
{
  "servicio": "ms-pedidos",
  "estado": "ok"
}
```

---

## Representación de un pedido

Ejemplo de respuesta de `GET /pedidos/2`:

```json
{
  "id": 2,
  "cliente_id": 2,
  "producto_id": 2,
  "cantidad": 80,
  "centro_distribucion": "Bogotá",
  "estado": "recibido",
  "fecha": "2026-10-26"
}
```

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---:|---|
| `id` | entero | No | Lo asigna MySQL |
| `cliente_id` | entero | Sí | Entero positivo |
| `producto_id` | entero | Sí | Entero positivo |
| `cantidad` | entero | Sí | Entero mayor que 0 |
| `centro_distribucion` | texto | Sí | `Bogotá` o `Cali` |
| `estado` | texto | No | Al crear queda en `recibido`; valores permitidos: `recibido`, `despachado`, `entregado` |
| `fecha` | `AAAA-MM-DD` | No | Si no se envía al crear, el servicio usa la fecha actual |

En la Semana 1, `cliente_id` y `producto_id` se validan como enteros positivos. La comprobación de que esos registros existan en otros microservicios se implementará en la Semana 2.

---

## Reglas de negocio

El microservicio aplica, entre otras, estas reglas:

- `cantidad` debe ser un entero mayor que `0`.
- `centro_distribucion` debe ser `Bogotá` o `Cali`.
- Todo pedido nuevo debe comenzar en estado `recibido`.
- Si no se envía `fecha` al crear, el servicio asigna la fecha actual.
- Un pedido que ya está en estado `entregado` no puede modificarse; en ese caso se responde `409 Conflict`.

---

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores principales |
|---|---|---|---|---|---|
| Listar | GET | `/pedidos` | — | `200` + arreglo | — |
| Filtrar por estado | GET | `/pedidos?estado=recibido` | — | `200` + arreglo | — |
| Filtrar por cliente | GET | `/pedidos?cliente_id=2` | — | `200` + arreglo | `400` si el id es inválido |
| Obtener | GET | `/pedidos/:id` | — | `200` + objeto | `400`, `404` |
| Crear | POST | `/pedidos` | JSON sin `id` | `201` + objeto + `Location` | `400` |
| Actualizar | PUT | `/pedidos/:id` | JSON completo sin `id` | `200` + objeto actualizado | `400`, `404`, `409` |
| Eliminar | DELETE | `/pedidos/:id` | — | `204` sin cuerpo | `400`, `404` |

### Ejemplo de creación

```http
POST /pedidos
Content-Type: application/json
```

```json
{
  "cliente_id": 1,
  "producto_id": 2,
  "cantidad": 50,
  "centro_distribucion": "Cali"
}
```

Respuesta esperada:

```text
201 Created
Location: /pedidos/<id>
```

El pedido creado queda con estado `recibido`.

### Ejemplo de filtro

```text
GET /pedidos?estado=recibido
```

Devuelve un arreglo con los pedidos cuyo estado sea `recibido`.

---

## Persistencia

Los datos se almacenan en MySQL mediante el repositorio:

```text
src/repositories/pedidos.repository.js
```

La tabla se crea con:

```text
db/schema.sql
```

`cliente_id` y `producto_id` son columnas enteras normales y **no tienen llaves foráneas hacia otros microservicios**, porque cada microservicio es dueño de su propia base de datos.

---

## Relaciones · Semana 2

`ms-pedidos` guarda las referencias `cliente_id` y `producto_id`.

Al crear o actualizar un pedido, el servicio verifica por REST que el cliente
y el producto existan. Al consultar pedidos, obtiene los datos relacionados
mediante consultas por lotes `?ids=` y agrega los objetos `cliente` y
`producto` a la respuesta.

| Atributo | Microservicio consultado | Para validar | Para componer | Datos usados |
|---|---|---|---|---|
| `cliente_id` | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` | `id`, `nombre` |
| `producto_id` | `ms-productos` | `GET /productos/:id` | `GET /productos?ids=...` | `id`, `nombre`, `precio` |

### Manejo de errores en las relaciones

- Si una referencia no existe al crear o actualizar, se responde `400 Bad Request`.
- Si el microservicio relacionado no responde durante una escritura, se responde `503 Service Unavailable`.
- Si un servicio relacionado no responde durante una consulta, el pedido se devuelve con el objeto correspondiente en `null` y un campo `aviso`.
- Para listar pedidos se realiza una sola consulta `?ids=` por cada microservicio relacionado, evitando una petición por cada pedido.
- El token recibido por `ms-pedidos` se reenvía a `ms-clientes` y `ms-productos`.

## Pruebas con Postman

Colección:

```text
docs/ms-pedidos.postman_collection.json
```

La colección corresponde a la **Semana 1** y no requiere autenticación.

Incluye:

1. Listar todos → `200`
2. Filtrar por estado → `200`
3. Consulta por lotes `?ids=` → **no aplica a ms-pedidos**
4. Obtener un registro existente → `200`
5. Obtener un id inexistente → `404`
6. Obtener con id no numérico → `400`
7. Crear con datos válidos → `201`
8. Crear con datos inválidos → `400`
9. Crear violando la regla de negocio → `400`
10. Actualizar un registro existente → `200`
11. Actualizar un id inexistente → `404`
12. Eliminar un registro existente → `204`
13. Eliminar el mismo registro nuevamente → `404`

La seguridad JWT, los permisos por rol y las pruebas de relaciones se incorporarán en la Semana 2.
