import server from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import chai, {expect, should} from 'chai';
import chaiHttp from 'chai-http';
import path from 'path';
import _ from 'lodash';
import { authenticateAndFetchUser } from './utilities';
import { IRegisteredUser } from './types';

const Should = should();
chai.use(chaiHttp);

var user: IRegisteredUser | {} = {}

describe(`Processing tests for user API routes (${path.basename(__filename)})`, () => {
    before(async function () {
        user = await authenticateAndFetchUser();
    });

    it('It should attempt deletion of a user and return with a status code 200', (done) => {
        done()
    });
});