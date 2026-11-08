import { pipeline } from 'node:stream/promises';
import {
  crearDestinoProductos,
  crearStreamProductos,
  crearTransformadorProductos,
} from './productos.js';

const productos = [
  { id: 1, nombre: 'Teclado', precio: 80, stock: 4 },
  { id: 2, nombre: 'Mouse', precio: 45.5, stock: 0 },
  { id: 3, nombre: 'Monitor', precio: 650, stock: 2 },
];

await pipeline(
  crearStreamProductos(productos),
  crearTransformadorProductos(),
  crearDestinoProductos((producto) => {
    console.log(
      `${producto.nombre}: S/ ${producto.precioConImpuesto.toFixed(2)} (incluye IGV)`,
    );
  }),
);
