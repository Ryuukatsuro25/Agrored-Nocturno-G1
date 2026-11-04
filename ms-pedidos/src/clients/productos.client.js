// =====================================================================
// CLIENTE HTTP de ms-productos (acceso a algo externo, análogo al repositorio)
// La dirección del otro microservicio viene del .env (PRODUCTOS_URL).
// Cada petición reenvía el token del usuario: ms-productos también lo exige.
// =====================================================================
const HttpError = require('../utils/http-error');

const PRODUCTOS_URL = process.env.PRODUCTOS_URL;

// Hace la petición reenviando el token. null si el otro servicio no respondió.
async function pedir(ruta, token) {
  try {
    return await fetch(`${PRODUCTOS_URL}${ruta}`, {
      headers: { Authorization: token },          // el token de la petición original
      signal: AbortSignal.timeout(3000),          // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                                  // ms-productos caído o sin responder
  }
}

// VALIDACIÓN: ¿existe el producto? Si ms-productos no responde → 503
async function existeProducto(id, token) {
  const respuesta = await pedir(`/productos/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-productos no está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) throw new HttpError(502, `ms-productos respondió ${respuesta.status}`);
  return true;
}

// COMPOSICIÓN: varios productos en UNA sola petición → Map id → producto (null si no responde)
async function productosPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/productos?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const lista = await respuesta.json();
  return new Map(lista.map((p) => [p.id, { id: p.id, nombre: p.nombre, precio: p.precio }]));
}

module.exports = { existeProducto, productosPorIds };
