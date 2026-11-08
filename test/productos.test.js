import assert from 'node:assert/strict';
import test from 'node:test';
import { pipeline } from 'node:stream/promises';
import {
  crearDestinoProductos,
  crearStreamProductos,
  crearTransformadorProductos,
} from '../src/productos.js';

test('procesa solamente productos con stock y calcula el IGV', async () => {
  const productos = [
    { id: 1, nombre: 'Teclado', precio: 100, stock: 2 },
    { id: 2, nombre: 'Mouse', precio: 50, stock: 0 },
  ];
  const resultado = [];

  await pipeline(
    crearStreamProductos(productos),
    crearTransformadorProductos(),
    crearDestinoProductos((producto) => resultado.push(producto)),
  );

  assert.deepEqual(resultado, [
    {
      id: 1,
      nombre: 'Teclado',
      precio: 100,
      stock: 2,
      precioConImpuesto: 118,
    },
  ]);
});
