import server from '@src/server';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import path from 'path';
import _ from 'lodash';
import { authenticateAndFetchUser } from './utilities';
import { IRegisteredUser } from './types';

const Should = should();
chai.use(chaiHttp);

var user: IRegisteredUser = {};
var category = {
    name: 'Test category 1'
}

describe(`Processing tests for category API routes (${path.basename(__filename)})`, () => {
    before(async function () {
        user = await authenticateAndFetchUser();
    });

    it('It should create a new category and return response with a status code 200', (done) => {
        chai.request(server.app)
            .post('/api/v1/admin/categories/')
            .send(category)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload['name']).to.be.eql(category.name);
                expect(response.body.payload['cid']).to.be.an('number');
                expect(response.body.payload['counters']).to.be.an('object');
                expect(response.body.payload['tagsPerPost']).to.be.an('object');
                expect(response.body.payload['userid']).to.be.eql(user.userid);

                done();
            })
    });
});