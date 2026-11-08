import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import test from 'node:test';
import { analyzeStream } from '../src/file-stream.js';

test('convierte bloques binarios en objetos y genera un resumen', async () => {
  const chunks = [
    Buffer.alloc(64 * 1024, 1),
    Buffer.alloc(64 * 1024, 2),
    Buffer.alloc(32 * 1024, 3),
  ];
  const result = await analyzeStream(Readable.from(chunks));
  assert.equal(result.totalBytes, 160 * 1024);
  assert.equal(result.blocks, 3);
  assert.equal(result.largestBlock, 64 * 1024);
  assert.equal(result.samples.length, 3);
  assert.deepEqual(result.samples[2], {
    index: 3,
    bytes: 32 * 1024,
    accumulated: 160 * 1024,
    type: 'Buffer (chunk)',
  });
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
});
