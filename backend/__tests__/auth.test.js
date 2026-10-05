const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('Auth API', () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/skillbridge_test';
    }
    process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_minimum_32_chars';
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/signup should create user', async () => {
    const email = `test${Date.now()}@test.com`;
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email,
      password: 'password123',
      role: 'student',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(email);
  });

  it('POST /api/auth/login should authenticate', async () => {
    const email = `login${Date.now()}@test.com`;
    await request(app).post('/api/auth/signup').send({
      name: 'Login User',
      email,
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});
