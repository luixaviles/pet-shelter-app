import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { getExtensionForMimeType } from '../src/services/firebase.service';
import { parseCorsOrigin } from '../src/config/config';
import { createApp } from '../src/server';

describe('getExtensionForMimeType', () => {
  it('maps common image MIME types to matching file extensions', () => {
    assert.equal(getExtensionForMimeType('image/jpeg'), 'jpg');
    assert.equal(getExtensionForMimeType('image/jpg'), 'jpg');
    assert.equal(getExtensionForMimeType('image/png'), 'png');
    assert.equal(getExtensionForMimeType('image/webp'), 'webp');
    assert.equal(getExtensionForMimeType('image/gif'), 'gif');
    assert.equal(getExtensionForMimeType('image/svg+xml'), 'svg');
    assert.equal(getExtensionForMimeType('IMAGE/WEBP; charset=utf-8'), 'webp');
  });

  it('falls back to png for non-image or empty MIME types', () => {
    assert.equal(getExtensionForMimeType(''), 'png');
    assert.equal(getExtensionForMimeType('application/octet-stream'), 'png');
  });
});

describe('parseCorsOrigin', () => {
  it('supports comma-separated origins', () => {
    assert.deepEqual(parseCorsOrigin('http://localhost:4200, https://pets.example.com', 'production'), [
      'http://localhost:4200',
      'https://pets.example.com',
    ]);
  });

  it('supports single origin and wildcard', () => {
    assert.equal(parseCorsOrigin('https://pets.example.com', 'production'), 'https://pets.example.com');
    assert.equal(parseCorsOrigin('*', 'production'), '*');
  });

  it('defaults to * in dev and false in production when unset', () => {
    assert.equal(parseCorsOrigin(undefined, 'development'), '*');
    assert.equal(parseCorsOrigin('', 'development'), '*');
    assert.equal(parseCorsOrigin(undefined, 'production'), false);
  });
});

describe('Express 5 server integration', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>(resolve => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close(err => (err ? reject(err) : resolve()));
    });
  });

  it('serves GET /api/pets with Helmet security headers', async () => {
    const res = await fetch(`${baseUrl}/api/pets`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');

    const body = (await res.json()) as { success: boolean; data: unknown[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  it('returns 404 for unknown pet id', async () => {
    const res = await fetch(`${baseUrl}/api/pets/non-existent-id-999999`);
    assert.equal(res.status, 404);

    const body = (await res.json()) as { success: boolean; error: string };
    assert.equal(body.success, false);
    assert.match(body.error, /not found/);
  });

  it('applies rate limiting headers on POST /api/pets', async () => {
    const res = await fetch(`${baseUrl}/api/pets`, {
      method: 'POST',
    });
    assert.equal(res.status, 400);
    assert.ok(res.headers.get('ratelimit') || res.headers.get('ratelimit-policy'));
  });

  it('handles malformed JSON via Express 5 errorHandler', async () => {
    const res = await fetch(`${baseUrl}/api/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid-json',
    });
    assert.equal(res.status, 400);

    const body = (await res.json()) as { success: boolean; error: string };
    assert.equal(body.success, false);
    assert.equal(body.error, 'Invalid JSON in request body');
  });
});
