import server from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import nconf from 'nconf';
import { Done } from 'mocha';
import path from 'path';

const Should = should();
chai.use(chaiHttp);

const credentials = {
    username: 'boblex',
    password: 'bob@123'
}
const invalidCredentials = {
    username: 'boblexx',
    password: 'bob@123x'
}


// **** Tests **** //
describe(`Authentication API routes (${path.basename(__filename)})`, () => {

    describe('POST /signin', () => {
        it('It should return a response with 200', (done: Done) => {
            chai.request(server.app)
            .post('/signin')
            .send(credentials)
            .end((err, response) => {
                response.should.have.status(HttpStatusCodes.OK);
                expect(response.body.next).equal('/');
                done();
            })
        });

        it('It should return unauthorized acces with a status code 401', (done: Done) => {
            chai.request(server.app)
            .post('/signin')
            .send(invalidCredentials)
            .end((err, response) => {
                response.should.have.status(HttpStatusCodes.UNAUTHORIZED);
                done();
            })
        });

    });
});