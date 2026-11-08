import { createHash } from 'node:crypto';
import { Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export function createChunkObjectTransform() {
  let index = 0;
  let accumulated = 0;
  return new Transform({
    readableObjectMode: true,
    transform(chunk, _encoding, callback) {
      index += 1;
      accumulated += chunk.length;
      callback(null, {
        index,
        bytes: chunk.length,
        accumulated,
        type: 'Buffer (chunk)',
        buffer: chunk,
      });
    },
  });
}

export function createObjectCollector({ sampleSize = 6 } = {}) {
  const startedAt = performance.now();
  const hash = createHash('sha256');
  const samples = [];
  let blocks = 0;
  let totalBytes = 0;
  let largestBlock = 0;
  const writable = new Writable({
    objectMode: true,
    write(chunkObject, _encoding, callback) {
      blocks += 1;
      totalBytes += chunkObject.bytes;
      largestBlock = Math.max(largestBlock, chunkObject.bytes);
      hash.update(chunkObject.buffer);
      if (samples.length < sampleSize) {
        samples.push({
          index: chunkObject.index,
          bytes: chunkObject.bytes,
          accumulated: chunkObject.accumulated,
          type: chunkObject.type,
        });
      }
      callback();
    },
  });
  return {
    writable,
    summary() {
      return {
        totalBytes,
        blocks,
        largestBlock,
        durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
        sha256: hash.digest('hex'),
        samples,
      };
    },
  };
}

export async function analyzeStream(readable, options) {
  const collector = createObjectCollector(options);
  await pipeline(readable, createChunkObjectTransform(), collector.writable);
  return collector.summary();
}
