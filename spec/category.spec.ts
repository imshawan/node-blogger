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
var categoryNameUpdated =  'Test Category 2';
var category = {
    name: 'Test category 1',
    cid: 0
}
var subCategory = {
    name: 'Sub category 1',
    cid: 0,
    parent: 0
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

                category = response.body.payload;

                done();
            })
    });

    it('It should create a new sub-category with a reference to a previously created category as it\'s parent', (done) => {
        subCategory.parent = category.cid;

        chai.request(server.app)
            .post('/api/v1/admin/categories/')
            .send(subCategory)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload['name']).to.be.eql(subCategory.name);
                expect(response.body.payload['userid']).to.be.eql(user.userid);
                expect(response.body.payload['parent']).to.be.eql(category.cid);

                subCategory = response.body.payload;

                done();
            })
    });

    it('It should update an existing category and return the new updated category', (done) => {
        chai.request(server.app)
            .put('/api/v1/admin/categories/' + category.cid)
            .send({...category, name: categoryNameUpdated})
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload['name']).to.be.eql(categoryNameUpdated);
                expect(response.body.payload['cid']).to.be.eql(category.cid);
                expect(response.body.payload['userid']).to.be.eql(user.userid);

                done();
            })
    });

    it('It should fetch the category by it\'s category id', (done) => {
        chai.request(server.app)
            .get('/api/v1/admin/categories/' + category.cid)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload['name']).to.be.eql(categoryNameUpdated);
                expect(response.body.payload['cid']).to.be.eql(category.cid);
                expect(response.body.payload['userid']).to.be.eql(user.userid);

                done();
            })
    });

    it('It should return all the categories and sub-categories available with pagination', (done) => {
        chai.request(server.app)
            .get('/api/v1/admin/categories')
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload).haveOwnProperty('data');
                expect(response.body.payload['data']).to.be.an('array');
                expect(response.body.payload).haveOwnProperty('currentPage').to.be.an('number');
                expect(response.body.payload).haveOwnProperty('perPage').to.be.an('number');
                expect(response.body.payload).haveOwnProperty('totalPages').to.be.an('number');
                expect(response.body.payload).haveOwnProperty('totalItems').to.be.an('number');
                expect(response.body.payload).haveOwnProperty('navigation').to.be.an('object');
                expect(response.body.payload).haveOwnProperty('start').to.be.an('number');
                expect(response.body.payload).haveOwnProperty('end').to.be.an('number');
                
                expect(response.body.payload.navigation).haveOwnProperty('current');
                expect(response.body.payload.navigation).haveOwnProperty('previous');
                expect(response.body.payload.navigation).haveOwnProperty('next');

                done();
            })
    });

    it('It should return only the categories available with pagination', (done) => {
        chai.request(server.app)
            .get('/api/v1/admin/categories?subCategories=false')
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};
                const {data} = response.body.payload;

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body.payload['data']).to.be.an('array');
                expect(response.body.payload['data'].length).to.be.greaterThan(1);
                expect(data[0]['parent']).to.be.an('undefined');

                done();
            });
    });

    it('It should delete the created category by it\'s id', (done) => {
        chai.request(server.app)
            .delete('/api/v1/admin/categories/' + category.cid)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};
                expect(response.statusCode).equal(HttpStatusCodes.OK, message);

                done();
            })
    });
});