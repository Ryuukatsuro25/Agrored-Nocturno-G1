# ms-productos · AgroRed S.A.S.

Microservicio de **productos** de la aplicación de AgroRed: gestiona los productos que AgroRed fabrica o comercializa.
Responsable: **Juan Pablo Rueda Sánchez** · Puerto: **3002** · Base de datos propia: `productos_db` (MySQL).

Construido con Node.js + Express en capas (rutas → controlador → servicio → repositorio → modelo). El archivo `src/middlewares/auth.js` es una copia **sin cambios** del entregado por la docente en `ms-usuarios`. Versión del Taller 2: CRUD completo, filtros, persistencia en MySQL y seguridad con JWT.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8 (o MariaDB).

**1. Crear la base de datos y su usuario** (una sola vez, conectado como `root` en MySQL Workbench o en la consola `mysql -u root -p`):

```sql
CREATE DATABASE productos_db;
CREATE USER 'productos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON productos_db.* TO 'productos_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** (desde la carpeta `ms-productos`):

```
mysql -u productos_user -p productos_db
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
| PORT | 3002 | Puerto del microservicio |
| HOST | 127.0.0.1 | Solo acepta conexiones del mismo equipo |
| DB_HOST / DB_PORT | localhost / 3306 | Dónde está MySQL (en el Taller 3: la IP de servidor1) |
| DB_NAME / DB_USER / DB_PASSWORD | productos_db / productos_user / … | Base y usuario propios del microservicio |
| JWT_SECRET | (frase del grupo) | La misma en todos los microservicios; verifica los tokens |

Verificar: `http://localhost:3002/health` responde `{"servicio":"ms-productos","estado":"ok"}`. Las demás rutas exigen un token de ms-usuarios.

## Representación

Así responde `GET /productos/2`:

```json
{ "id": 2, "nombre": "Tomate chonto", "categoria": "hortaliza", "unidad": "kg", "precio": 3200 }
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| nombre | texto | Sí | No vacío; único sin distinguir mayúsculas (409) |
| categoria | texto | Sí | fruta, hortaliza o procesado |
| unidad | texto | Sí | kg o caja |
| precio | número | Sí | Mayor que 0, pesos por unidad |

**Regla de negocio:** No puede haber dos productos con el mismo nombre, sin distinguir mayúsculas (409). Además: precio > 0 y categoría y unidad dentro de su lista (400).

## Endpoints

Todas las rutas (salvo `/health`) exigen la cabecera `Authorization: Bearer <token>`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /productos | — | 200 + arreglo | 401 |
| Filtrar | GET | /productos?categoria=fruta | — | 200 + arreglo filtrado | 400 · 401 |
| Consultar por lotes | GET | /productos?ids=1,3,8 | — | 200 + arreglo con esos registros | 400 ids inválidos · 401 |
| Obtener | GET | /productos/:id | — | 200 + objeto | 400 id inválido · 401 · 404 |
| Crear | POST | /productos | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 409 nombre repetido |
| Actualizar | PUT | /productos/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /productos/:id | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Ejemplo · crear:

```
POST /productos
Authorization: Bearer <token>
Content-Type: application/json

{ "nombre": "Aguacate Hass", "categoria": "fruta", "unidad": "kg", "precio": 9800 }

→ 201 Created · Location: /productos/4
{ "id": 4, "nombre": "Aguacate Hass", "categoria": "fruta", "unidad": "kg", "precio": 9800 }
```

Ejemplo · listar con filtro:

```
GET /productos?categoria=fruta
→ 200 OK · arreglo con los registros que cumplen el filtro
```

Errores: siempre `{"error": "...", "detalles": [...]}` (detalles solo en validación).

## Seguridad

| Entidad | Consultan (GET) | Crean, modifican y eliminan |
|---|---|---|
| Productos | administrador, comercial, produccion | administrador, produccion |

Sin token o con un token inválido: 401. Con un rol sin permiso: 403.

## Relaciones

ms-productos no guarda referencias. **Es consultado** por ms-pedidos:

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-pedidos | GET /productos/:id · GET /productos?ids=… | id, nombre, precio |

Por eso el filtro `?ids=` es parte de este contrato. Cada petición que llega se registra en la terminal del servicio.

## Pruebas

Colección de Postman en `docs/ms-productos.postman_collection.json` (Import en Postman). Ejecute primero la carpeta 0 (inicio de sesión) con ms-usuarios corriendo.
