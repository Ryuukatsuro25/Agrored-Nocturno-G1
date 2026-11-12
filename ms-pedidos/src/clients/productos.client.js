const HttpError = require('../utils/http-error');

const PRODUCTOS_URL = process.env.PRODUCTOS_URL;

async function pedir(ruta, token) {
  try {
    return await fetch(`${PRODUCTOS_URL}${ruta}`, {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    return null;
  }
}

async function existeProducto(id, token) {
  const respuesta = await pedir(`/productos/${id}`, token);

  if (!respuesta) {
    throw new HttpError(503, 'ms-productos no está disponible');
  }

  if (respuesta.status === 404) {
    return false;
  }

  if (!respuesta.ok) {
    throw new HttpError(
      502,
      `ms-productos respondió ${respuesta.status}`
    );
  }

  return true;
}

async function productosPorIds(ids, token) {
  if (ids.length === 0) {
    return new Map();
  }

  const respuesta = await pedir(
    `/productos?ids=${ids.join(',')}`,
    token
  );

  if (!respuesta || !respuesta.ok) {
    return null;
  }

  const productos = await respuesta.json();

  return new Map(
    productos.map((p) => [
      p.id,
      {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
      },
    ])
  );
}

module.exports = {
  existeProducto,
  productosPorIds,
};