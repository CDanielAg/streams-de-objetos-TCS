import { Readable, Transform, Writable } from 'node:stream';

export function crearStreamProductos(productos) {
  return Readable.from(productos, { objectMode: true });
}

export function crearTransformadorProductos() {
  return new Transform({
    objectMode: true,
    transform(producto, _codificacion, callback) {
      if (producto.stock <= 0) {
        callback();
        return;
      }

      callback(null, {
        ...producto,
        precioConImpuesto: Number((producto.precio * 1.18).toFixed(2)),
      });
    },
  });
}

export function crearDestinoProductos(alProcesar) {
  return new Writable({
    objectMode: true,
    write(producto, _codificacion, callback) {
      alProcesar(producto);
      callback();
    },
  });
}
