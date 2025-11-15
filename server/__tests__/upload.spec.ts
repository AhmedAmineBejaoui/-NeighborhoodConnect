import request from 'supertest';
import app from '../index';

describe('POST /uploads', () => {
  it('upload une image et renvoie une url', async () => {
    const res = await request(app)
      .post('/uploads')
      .attach('file', Buffer.from('hello'), { filename: 'test.txt', contentType: 'text/plain' })
      .field('prefix', 'tests');

    expect(res.status).toBe(200);
    expect(res.body.url).toBeTruthy();
    expect(res.body.path).toMatch(/^tests\//);
  });
});
