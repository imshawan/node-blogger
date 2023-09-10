import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import server from '@src/server';
import chai from 'chai';
import chaiHttp from 'chai-http';
import _ from 'lodash';
import { testUserCredentials } from 'spec/constants';
import { IResponseBody, IRegisteredUser } from 'spec/types';

chai.use(chaiHttp);

export const registerTestUser = function registerTestUser(): Promise<IRegisteredUser> {
    return new Promise((resolve, reject) => {
        chai.request(server.app)
            .post('/register')
            .send(testUserCredentials)
            .end((err, response) => {
                if (err) return reject(err);

                const body: IResponseBody = response.body;
                if (Object.hasOwnProperty.bind(body)('payload')) {
                    resolve(body.payload)
                } else resolve({});
            });
    });
}

export const signInTestUser = function signInTestUser(): Promise<IRegisteredUser> {
    return new Promise((resolve, reject) => {
        chai.request(server.app)
            .post('/signin')
            .send(testUserCredentials)
            .end((err, response) => {
                if (err) return reject(err);

                const {message=''} = response.body.status || {};
                if (response.statusCode === HttpStatusCodes.UNAUTHORIZED) {
                    return reject(new Error(message))
                }

                const body: IResponseBody = response.body;
                const cookies = response.header['set-cookie'].length ? response.header['set-cookie'][0] : '';

                if (Object.hasOwnProperty.bind(body)('user')) {
                    resolve(_.merge(body.user, {cookies}) || {})
                } else resolve({});
            });
    });
}

export const authenticateAndFetchUser = async function authenticateAndFetchUser(): Promise<IRegisteredUser> {
    var user: IRegisteredUser = {};

    try {
        user = await signInTestUser();
    } catch (err) {
        await registerTestUser();
        user = await signInTestUser();
    }

    return user;
}