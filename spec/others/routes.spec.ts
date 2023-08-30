import server from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import path from 'path';

const Should = should();
chai.use(chaiHttp);

// **** Tests **** //
describe(`Other API Tasks (${path.basename(__filename)})`, () => {

  describe('GET /api/*/*', () => {
      it('It should return a 404 response', () => {
          chai.request(server.app)
          .get('/api/*/*')
          .end((err, response) => {
              response.should.have.status(HttpStatusCodes.NOT_FOUND);
          })
      })
  });
});