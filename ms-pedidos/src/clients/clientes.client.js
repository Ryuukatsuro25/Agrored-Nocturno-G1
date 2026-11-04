// =====================================================================
// CLIENTE HTTP de ms-clientes (acceso a algo externo, análogo al repositorio)
// La dirección del otro microservicio viene del .env (CLIENTES_URL).
// Cada petición reenvía el token del usuario: ms-clientes también lo exige.
// =====================================================================
const HttpError = require('../utils/http-error');

const CLIENTES_URL = process.env.CLIENTES_URL;

// Hace la petición reenviando el token. null si el otro servicio no respondió.
async function pedir(ruta, token) {
  try {
    return await fetch(`${CLIENTES_URL}${ruta}`, {
      headers: { Authorization: token },          // el token de la petición original
      signal: AbortSignal.timeout(3000),          // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                                  // ms-clientes caído o sin responder
  }
}

// VALIDACIÓN: ¿existe el cliente? Si ms-clientes no responde → 503
async function existeCliente(id, token) {
  const respuesta = await pedir(`/clientes/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-clientes no está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) throw new HttpError(502, `ms-clientes respondió ${respuesta.status}`);
  return true;
}

// COMPOSICIÓN: varios clientes en UNA sola petición → Map id → cliente (null si no responde)
async function clientesPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/clientes?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const lista = await respuesta.json();
  return new Map(lista.map((c) => [c.id, { id: c.id, nombre: c.nombre }]));
}

module.exports = { existeCliente, clientesPorIds };
