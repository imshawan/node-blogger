import server from '@src/server';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import path from 'path';
import _ from 'lodash';
import { authenticateAndFetchUser } from './utilities';
import { IRegisteredUser } from './types';
import { IPost } from '@src/types';
import { createCategory } from './utilities/category';

const Should = should();
chai.use(chaiHttp);

var user: IRegisteredUser = {};
var post: IPost = {
    title: "Test post 1",
    content: "This is a post content",
    categories: []
}

describe(`Processing tests for Posts API routes (${path.basename(__filename)})`, () => {
    before(async function () {
        user = await authenticateAndFetchUser();
        let category = await createCategory(user);

        post.categories = ['category:' + category.cid];
    });

    it('It should create a new post and return response with a status code 200', (done) => {
        chai.request(server.app)
            .post('/api/v1/blog/')
            .send(post)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};

                expect(response.statusCode).equal(HttpStatusCodes.OK, message);
                expect(response.body).haveOwnProperty('payload');
                expect(response.body.payload['title']).to.be.eql(post.title);
                expect(response.body.payload['userid']).to.be.eql(user.userid);
                expect(response.body.payload).haveOwnProperty('slug');

                post = response.body.payload;

                done();
            })
    });
});