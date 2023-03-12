import supertest, { SuperTest, Test, Response } from 'supertest';

import app from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

// StatusCodes
const {
  OK,
  UNAUTHORIZED,
} = HttpStatusCodes;


// **** Tests **** //

describe('AuthRouter', () => {

  let agent: SuperTest<Test>;

  // Run before all tests
  beforeAll((done) => {
    agent = supertest.agent(app);
    done();
  });


  // ** Test logout ** //
  describe(`"GET:/"`, () => {

    // Successful logout
    it(`should return a response with a status of ${OK}`, (done) => {
      agent.get('/')
        .end((_: Error, res: Response) => {
          expect(res.status).toBe(HttpStatusCodes.OK);
          done();
        });
    });
  });
});
