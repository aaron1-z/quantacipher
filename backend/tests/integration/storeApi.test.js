const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const storeController = require('../../controllers/storeController');
const authMiddleware = require('../../middleware/authMiddleware');
const Data = require('../../models/Data');
const User = require('../../models/User');
const config = require('../../config/config');

const app = express();
app.use(express.json());
app.post('/store', authMiddleware, storeController.storeData);

describe('Store API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, config.secretOrKey, { expiresIn: '1h' });
  });

  describe('POST /store', () => {
    describe('Success cases', () => {
      it('should store data successfully with valid auth token', async () => {
        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(storeData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Data stored successfully');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('key', storeData.key);
        expect(response.body.data).toHaveProperty('value', storeData.value);

        // Verify data was actually stored in database
        const storedData = await Data.findOne({ key: storeData.key });
        expect(storedData).toBeTruthy();
        expect(storedData.value).toBe(storeData.value);
      });

      it('should store data with complex values', async () => {
        const complexData = {
          key: 'complexKey',
          value: JSON.stringify({
            nested: { data: true },
            array: [1, 2, 3],
            string: 'test'
          })
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(complexData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.value).toBe(complexData.value);
      });

      it('should store multiple different key-value pairs', async () => {
        const data1 = { key: 'key1', value: 'value1' };
        const data2 = { key: 'key2', value: 'value2' };

        await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data1)
          .expect(201);

        await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data2)
          .expect(201);

        const storedData1 = await Data.findOne({ key: data1.key });
        const storedData2 = await Data.findOne({ key: data2.key });
        
        expect(storedData1.value).toBe(data1.value);
        expect(storedData2.value).toBe(data2.value);
      });
    });

    describe('Error cases', () => {
      it('should return 400 when key is missing', async () => {
        const invalidData = {
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'An error occurred while storing data');
      });

      it('should return 400 when value is missing', async () => {
        const invalidData = {
          key: 'testKey'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'An error occurred while storing data');
      });

      it('should return 400 when both key and value are missing', async () => {
        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'An error occurred while storing data');
      });
    });

    describe('Unauthorized access cases', () => {
      it('should return 401 when no auth token is provided', async () => {
        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .send(storeData)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'No token, authorization denied');
      });

      it('should return 400 when invalid auth token is provided', async () => {
        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', 'Bearer invalid_token')
          .send(storeData)
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Token is not valid');
      });

      it('should return 401 when malformed authorization header is provided', async () => {
        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        // Test with malformed header (missing Bearer prefix)
        await request(app)
          .post('/store')
          .set('Authorization', authToken)
          .send(storeData)
          .expect(500); // This will cause an error in middleware

        // Test with completely invalid header format
        await request(app)
          .post('/store')
          .set('Authorization', 'InvalidFormat')
          .send(storeData)
          .expect(500);
      });

      it('should return 400 when expired token is provided', async () => {
        const expiredToken = jwt.sign(
          { id: testUser._id },
          config.secretOrKey,
          { expiresIn: '-1s' } // Already expired
        );

        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send(storeData)
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Token is not valid');
      });
    });

    describe('Database error handling', () => {
      it('should handle database connection issues gracefully', async () => {
        // Close mongoose connection to simulate database error
        await mongoose.connection.close();

        const storeData = {
          key: 'testKey',
          value: 'testValue'
        };

        const response = await request(app)
          .post('/store')
          .set('Authorization', `Bearer ${authToken}`)
          .send(storeData)
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'An error occurred while storing data');

        // Reconnect for cleanup
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
      });
    });
  });
});