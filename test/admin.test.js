import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import AdminModel from '../models/adminModel.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await AdminModel.deleteMany();
});

describe('Admin routes', () => {
  it('should register a new admin', async () => {
    const res = await request(app).post('/api/admin/register').send({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: '12345678',
      phone: '03121234567',
      address: 'Islamabad, PK',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Admin registered successfully');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should login an existing admin', async () => {
    await request(app).post('/api/admin/register').send({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: '12345678',
      phone: '03121234567',
      address: 'Islamabad, PK',
    });

    const res = await request(app).post('/api/admin/login').send({
      email: 'admin@test.com',
      password: '12345678',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Admin login successful');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should update the admin info', async () => {
    await request(app).post('/api/admin/register').send({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: '12345678',
      phone: '03121234567',
      address: 'Islamabad, PK',
    });

    const loginRes = await request(app).post('/api/admin/login').send({
      email: 'admin@test.com',
      password: '12345678',
    });

    const token = loginRes.body.accessToken;
    const createdAdmin = await AdminModel.findOne({ email: 'admin@test.com' });

    const res = await request(app)
      .put(`/api/admin/update/${createdAdmin._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Admin',
        password: 'newpassword123',
        phone: '0987654321',
        address: 'New Address, PK',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.admin.name).toBe('Updated Admin');
    expect(res.body.admin.phone).toBe('0987654321');
    expect(res.body.admin.address).toBe('New Address, PK');
  });

  it('should delete the admin', async () => {
    await request(app).post('/api/admin/register').send({
      name: 'Delete Admin',
      email: 'delete@test.com',
      password: 'password123',
      phone: '03001112233',
      address: 'Karachi, PK',
    });

    const loginRes = await request(app).post('/api/admin/login').send({
      email: 'delete@test.com',
      password: 'password123',
    });

    const token = loginRes.body.accessToken;
    const createdAdmin = await AdminModel.findOne({ email: 'delete@test.com' });

    const res = await request(app)
      .delete(`/api/admin/delete/${createdAdmin._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Admin deleted successfully');
  });
});
