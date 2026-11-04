# ms-usuarios · Contrato de la API

Microservicio de usuarios de la aplicación. Responsable: docente. Puerto: **3001**.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8.

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE usuarios_db;
CREATE USER 'usuarios_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'localhost';
```

2. Crear la tabla: en la consola `mysql -u usuarios_user -p usuarios_db` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env` y ajustar los roles de la empresa y la contraseña de la base de datos.
5. `npm run dev`

## Representación

```json
{ "id": 2, "nombre": "Laura Gómez", "email": "laura.gomez@empresa.com", "rol": "administrador", "activo": true }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| nombre | texto | Sí | No vacío |
| email | texto | Sí | Formato válido; en minúsculas; **único** (409) |
| rol | texto | Sí | Uno de los roles del `.env` |
| activo | booleano | No (por defecto `true`) | `true` o `false` |

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /usuarios | 200 arreglo | — |
| Filtrar | GET | /usuarios?rol=despacho | 200 arreglo | — |
| Consultar por lotes | GET | /usuarios?ids=1,3 | 200 arreglo | 400 |
| Obtener | GET | /usuarios/:id | 200 objeto | 400 · 404 |
| Crear | POST | /usuarios | 201 objeto + Location | 400 · 409 |
| Actualizar | PUT | /usuarios/:id | 200 objeto | 400 · 404 · 409 |
| Eliminar | DELETE | /usuarios/:id | 204 | 400 · 404 |

Ejemplo para crear:

```json
{ "nombre": "Marta Ríos", "email": "marta.rios@empresa.com", "rol": "despacho" }
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

## Relaciones

**Consulto a:** ninguno.

**Me consultan:** ninguno. Cada microservicio verificará el token por su cuenta (semana 3), sin pedirle nada a ms-usuarios.

## Pruebas

Colección de Postman en `docs/ms-usuarios.postman_collection.json` (13 casos).
