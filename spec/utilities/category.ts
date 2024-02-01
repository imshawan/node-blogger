import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import server from '@src/server';
import chai from 'chai';
import chaiHttp from 'chai-http';
import _ from 'lodash';
import { testUserCredentials } from 'spec/constants';
import { IResponseBody, IRegisteredUser } from 'spec/types';

chai.use(chaiHttp);

var category = {
    name: 'Test category 1',
}

export const createCategory = (user: IRegisteredUser): Promise<{name: string, cid: number}> => {
    return new Promise((resolve, reject) => {
        chai.request(server.app)
            .post('/api/v1/admin/categories/')
            .send(category)
            .set('Cookie', user.cookies || '')
            .end((err, response) => {
                const {message=''} = response.body.status || {};
                if (response.statusCode >= HttpStatusCodes.BAD_REQUEST) {
                    reject(message)
                }
                resolve(response.body.payload);
            });
    });
}