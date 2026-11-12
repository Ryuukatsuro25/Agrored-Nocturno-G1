# ms-usuarios · versión completa (Módulo 3)

Redes y Servicios Multimedia · UAO. Microservicio común de todos los grupos:
gestiona los usuarios de la aplicación, guarda las contraseñas cifradas (bcrypt)
y entrega tokens JWT al iniciar sesión. **Nadie del grupo lo modifica**: se configura con su `.env`.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8.

1. Crear la base de datos y su usuario (como root, en MySQL Workbench o la consola):

```sql
CREATE DATABASE usuarios_db;
CREATE USER 'usuarios_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'localhost';
```

2. Crear la tabla con `db/schema.sql` (Workbench: File → Open SQL Script, o en la consola `SOURCE db/schema.sql;`).
3. `npm install`
4. Copiar `.env.example` como `.env` y ajustar los roles de su empresa y el `JWT_SECRET` del grupo.
5. `npm run dev`

Usuario inicial: `admin@empresa.com` / `Admin2026*` (rol administrador).

## Endpoints

| Método | URI | Quién | Respuesta exitosa | Errores |
|---|---|---|---|---|
| GET | /health | Público | 200 | — |
| POST | /usuarios/login | Público | 200 `{ token, usuario }` | 401 email o contraseña incorrectos |
| GET | /usuarios | administrador | 200 arreglo (filtros `?rol=` y `?ids=`) | 401 · 403 |
| GET | /usuarios/me | Cualquier rol | 200 los datos del dueño del token | 401 |
| GET | /usuarios/:id | administrador, o el propio usuario | 200 usuario | 400 · 401 · 403 · 404 |
| POST | /usuarios | administrador | 201 usuario + Location | 400 · 401 · 403 · 409 |
| PUT | /usuarios/:id | administrador | 200 usuario | 400 · 401 · 403 · 404 · 409 |
| DELETE | /usuarios/:id | administrador | 204 | 401 · 403 · 404 |

Un usuario que no es administrador solo puede consultar su propio registro (`/usuarios/me` o `/usuarios/<su id>`); el resto de operaciones son del administrador.

`password` se envía al crear (mínimo 8 caracteres) y es opcional al actualizar.
**Nunca aparece en una respuesta.**

## El token

`POST /usuarios/login` con `{"email": "...", "password": "..."}` responde:

```json
{ "token": "eyJhbGciOi...", "usuario": { "id": 1, "nombre": "...", "email": "...", "rol": "administrador", "activo": true } }
```

Las demás peticiones, en este y en todos los microservicios del grupo, envían la cabecera
`Authorization: Bearer <token>`. El token lleva `{ id, nombre, rol }`, vence según `JWT_EXPIRA`
y se verifica con `JWT_SECRET`, que debe ser **la misma en todos los microservicios del grupo**.

## El middleware para los demás microservicios

`src/middlewares/auth.js` se copia **sin cambios** a cada microservicio del grupo
(junto con `npm install jsonwebtoken`). Ofrece:

- `verificarToken`: exige un token válido → 401 si falta, es inválido o venció.
- `requiereRol('rol1', 'rol2')`: deja pasar solo esos roles → 403 a los demás.

## CORS (frontend en su PC)

ms-usuarios tiene CORS activo (`app.use(cors())` en `src/app.js`). Así, un frontend abierto
en el navegador desde otra dirección (doble clic en el HTML, o Live Server en otro puerto)
puede llamar a `http://localhost:3001`. Sin CORS, el navegador bloquea la respuesta y en la
consola aparece *blocked by CORS policy*.

Para conectar las pantallas de su entidad con su propio microservicio, hagan lo mismo en él:
`npm install cors` y `app.use(cors());` antes de `app.use(express.json());`.

En el Taller 3, detrás del gateway, el frontend y la API comparten dirección y CORS ya no hace falta.
