import server from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import nconf from 'nconf';
import { Done } from 'mocha';
import path from 'path';
import _ from 'lodash';

const Should = should();
chai.use(chaiHttp);

const invalidCredentials = {
    username: 'boblexx',
    password: 'bob@123x'
}

var cookies = '';
var newUser = {
    username: 'new_userlex',
    password: 'new_user@123',
    confirmpassword: 'new_user@123',
    email: 'new_userlex@example.com',
    userid: 0
};
var credentials = {
    username: newUser.username,
    password: newUser.password,
};


// **** Tests **** //
describe(`Authentication API routes (${path.basename(__filename)})`, () => {

    describe('POST /register', () => {
        it('It should successfully register a user', (done: Done) => {
            chai.request(server.app)
            .post('/register')
            .send(newUser)
            .end((err, response) => {
                expect(response.body).haveOwnProperty('status');
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload).haveOwnProperty('token');
                expect(response.body.payload).haveOwnProperty('userid');
                expect(response.body.payload['userid']).to.be.an('number');

                newUser = _.merge(newUser, {userid: response.body.payload['userid']});

                done();
            })
        });
    });

    describe('POST /signin', () => {
        it('It should return unauthorized acces with a status code 401', (done: Done) => {
            chai.request(server.app)
            .post('/signin')
            .send(invalidCredentials)
            .end((err, response) => {
                response.should.have.status(HttpStatusCodes.UNAUTHORIZED);
                done();
            })
        });

        it('A valid login operation should return a response with status 200', (done: Done) => {
            chai.request(server.app)
            .post('/signin')
            .send(credentials)
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.headers).haveOwnProperty('set-cookie');
                expect(response.header['set-cookie']).to.be.an('array');
                expect(response.body.next).to.be.an('string')
                
                // validating the session user
                expect(response.body).haveOwnProperty('user');
                expect(response.body.user).to.be.an('object');
                expect(response.body.user.userid).equal(newUser.userid, 'Userid does not match with the newly registered user');
                expect(response.body.user.email).equal(newUser.email, 'email does not match with the newly registered user');

                cookies = response.header['set-cookie'].length ? response.header['set-cookie'][0] : '';

                done();
            })
        });

    });
});