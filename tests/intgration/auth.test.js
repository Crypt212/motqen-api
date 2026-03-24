/**
 * @fileoverview Tests for Authentications
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import initApp from '../../src/app.js';
import getRandomElements from '../../src/utils/randomElements.js';
import * as OTPModule from '../../src/utils/OTP.js';
import redisClient from '../../src/libs/redis.js';
import prisma from '../../src/libs/database.js';

// jest.useFakeTimers();

describe('register a worker user', () => {
  let app;
  let refreshToken = "";
  let accessToken = "";
  let specializationsMap = [];
  let governmentId;
  let cityId;
  let tokenType;
  let verifiedToken;
  let userId;
  const testPhoneNumber = "01234567890";
  const deviceId = "1";
  const otp = "123456";

  beforeAll(async () => {
    spyOn(OTPModule, 'generateOTP').and.returnValue(otp);
    await redisClient.connect();
    app = await initApp();
  });
  afterAll(() => {
    if (userId)
      prisma.user.delete({ where: { id: userId } });
  });
  test('should get specializations and subspecializations', async () => {
    const response = await request(app)
      .get('/api/v1/specializations')
      .set("X-Device-Fingerprint", deviceId)
      .expect(200);

    getRandomElements(response.body.data.specializations, 2).forEach(element => {
      specializationsMap.push({ mainId: element.id, subIds: [] });
    })
    for (let i = 0; i < specializationsMap.length; i++) {
      const element = specializationsMap[i];
      const response = await request(app)
        .get('/api/v1/specializations/' + element.mainId + '/sub-specializations')
        .set("X-Device-Fingerprint", deviceId)
        .expect(200);


      getRandomElements(response.body.data.subSpecializations, 3).forEach(subElement => {
        specializationsMap[i].subIds.push(subElement.id);
      })
    }
    console.log(specializationsMap);
  });
  test('should get governments and cities', async () => {
    const goveResponse = await request(app)
      .get('/api/v1/governments')
      .set("X-Device-Fingerprint", deviceId)
      .expect(200);

    governmentId = getRandomElements(goveResponse.body.data.governments, 1)[0];

    const cityResponse = await request(app)
      .get('/api/v1/governments/' + governmentId + '/cities')
      .set("X-Device-Fingerprint", deviceId)
      .expect(200);

    cityId = getRandomElements(cityResponse.body.data.cities, 1)[0];
  });
  test('should verify otp', async () => {

    await request(app)
      .post('/api/v1/auth/otp/request')
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .set("X-Device-Fingerprint", deviceId)
      .send({ "phoneNumber": "01000000000", "method": "SMS" })
      .expect(200);


    const response = await request(app)
      .post('/api/v1/auth/otp/verify')
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .set("X-Device-Fingerprint", deviceId)
      .send({ "phoneNumber": testPhoneNumber, "otp": otp, "method": "SMS" })
      .expect(200);

    tokenType = response.body.data.tokenType;
    verifiedToken = response.body.data.accessToken;
  });

  test('should register a new worker user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/worker/register')
      .type('form')
      .set("X-Device-Fingerprint", deviceId)
      .set("Authorization", verifiedToken)
      .field('userData', {
        firstName: "Ahmed",
        middleName: "Mohammed",
        lastName: "Test",
      })
      .field('workerProfile', {
        experienceYears: 1,
        isInTeam: true,
        acceptsUrgentJobs: true,
        specializationsTree: specializationsMap,
      })
      .attach('personal_image', './tests/intgration/test.png')
      .attach('id_image', './tests/intgration/test.png')
      .attach('id_with_personal_image', './tests/intgration/test.png')
    //   .field('userData', {
    //     "firstName": "Ahmed",
    //     "middleName": "Mohammed",
    //     "lastName": "Test",
    //     "governmentId": governmentId,
    //     "cityId": cityId,
    //   });
    // .field('clientProfile' {
    //
    //   })
  });
});
