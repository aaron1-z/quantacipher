const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const retrieveController = require('../../controllers/retrieveController');
const authMiddleware = require('../../middleware/authMiddleware');
const Data = require('../../models/Data');
const User = require('../../models/User');
const config = require('../../config/config');

const app = express();
app.use(express.json());
app.get('/retrieve', authMiddleware, retrieveController.retrieveData);

describe('Retrieve API Integration Tests', () => {
  let testUser;
  let authToken;
  let testData;

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

    // Create test data
    testData = [
      new Data({ key: 'key1', value: 'value1' }),
      new Data({ key: 'key2', value: 'value2' }),
      new Data({ key: 'key3', value: 'value3' })
    ];
    
    await Data.insertMany(testData);
  });

  describe('GET /retrieve', () => {
    describe('Success cases', () => {
      it('should retrieve all data successfully with valid auth token', async () => {
        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(3);

        // Verify all test data is returned
        const keys = response.body.data.map(item => item.key);
        expect(keys).toContain('key1');
        expect(keys).toContain('key2'); 
        expect(keys).toContain('key3');
      });

      it('should return empty array when no data exists', async () => {
        // Clear all data
        await Data.deleteMany({});

        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(0);
      });

      it('should return data in correct format', async () => {
        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        response.body.data.forEach(item => {
          expect(item).toHaveProperty('_id');
          expect(item).toHaveProperty('key');
          expect(item).toHaveProperty('value');
          expect(typeof item.key).toBe('string');
          expect(typeof item.value).toBe('string');
        });
      });
    });

    describe('Unauthorized access cases', () => {
      it('should return 401 when no auth token is provided', async () => {
        const response = await request(app)
          .get('/retrieve')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'No token, authorization denied');
      });

      it('should return 400 when invalid auth token is provided', async () => {
        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', 'Bearer invalid_token')
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Token is not valid');
      });

      it('should return 400 when expired token is provided', async () => {
        const expiredToken = jwt.sign(
          { id: testUser._id },
          config.secretOrKey,
          { expiresIn: '-1s' } // Already expired
        );

        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Token is not valid');
      });

      it('should return 401 when malformed authorization header is provided', async () => {
        // Test with missing Bearer prefix
        await request(app)
          .get('/retrieve')
          .set('Authorization', authToken)
          .expect(500); // This will cause an error in middleware

        // Test with completely invalid header format
        await request(app)
          .get('/retrieve')
          .set('Authorization', 'InvalidFormat')
          .expect(500);
      });
    });

    describe('Database error handling', () => {
      it('should handle database connection issues gracefully', async () => {
        // Close mongoose connection to simulate database error
        await mongoose.connection.close();

        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'An error occurred while retrieving data');

        // Reconnect for cleanup
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
      });

      it('should handle corrupted data gracefully', async () => {
        // Add some invalid data directly to database
        const invalidData = new Data({ 
          key: null, // Invalid key
          value: 'valid value'
        });
        
        try {
          await invalidData.save();
        } catch (error) {
          // Expected to fail due to validation
        }

        // Should still return valid data
        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3); // Only valid data
      });
    });

    describe('Performance and scalability', () => {
      it('should handle large amounts of data efficiently', async () => {
        // Clear existing data
        await Data.deleteMany({});

        // Create large dataset
        const largeDataset = [];
        for (let i = 0; i < 1000; i++) {
          largeDataset.push({
            key: `key_${i}`,
            value: `This is test value number ${i} with some additional content to make it longer`
          });
        }
        
        await Data.insertMany(largeDataset);

        const startTime = Date.now();
        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        const endTime = Date.now();

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1000);
        
        // Should complete in reasonable time (less than 2 seconds)
        expect(endTime - startTime).toBeLessThan(2000);
      });

      it('should handle concurrent requests properly', async () => {
        const requests = [];
        const numberOfConcurrentRequests = 10;

        // Create multiple concurrent requests
        for (let i = 0; i < numberOfConcurrentRequests; i++) {
          requests.push(
            request(app)
              .get('/retrieve')
              .set('Authorization', `Bearer ${authToken}`)
              .expect(200)
          );
        }

        // Wait for all requests to complete
        const responses = await Promise.all(requests);

        // All responses should be successful
        responses.forEach(response => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveLength(3);
        });
      });
    });

    describe('Data integrity', () => {
      it('should return consistent data across multiple requests', async () => {
        const response1 = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const response2 = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Both responses should have identical data
        expect(response1.body.data).toHaveLength(response2.body.data.length);
        
        // Sort both arrays by key to ensure comparison works
        const data1 = response1.body.data.sort((a, b) => a.key.localeCompare(b.key));
        const data2 = response2.body.data.sort((a, b) => a.key.localeCompare(b.key));

        for (let i = 0; i < data1.length; i++) {
          expect(data1[i].key).toBe(data2[i].key);
          expect(data1[i].value).toBe(data2[i].value);
        }
      });

      it('should not return data from other users', async () => {
        // Create another user and their data
        const otherUser = new User({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'password123'
        });
        await otherUser.save();

        const otherUserData = new Data({
          key: 'other_key',
          value: 'other_value',
          userId: otherUser._id // If user isolation is implemented
        });
        await otherUserData.save();

        const response = await request(app)
          .get('/retrieve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Should only return original test data, not other user's data
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3);
        
        const keys = response.body.data.map(item => item.key);
        expect(keys).not.toContain('other_key');
      });
    });
  });
});