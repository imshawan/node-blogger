import _ from 'lodash';
import { MongoClient } from 'mongodb';
import MongoStore from 'connect-mongo';
import { getTTLSessionSeconds } from '@src/application';
import {connectionOptions, serverApi} from './connection';

export const initializeSessionStore = async (connectionString: string, dbName: string): Promise<MongoStore> => {
	if (!connectionString)  {
		throw new Error('Connection string is required.');
	}

	const sessionStore = MongoStore.create({
		clientPromise: connect(connectionString),
		ttl: getTTLSessionSeconds(),
        dbName
	});
    
	return sessionStore;
}

const connect = async function (connectionString: string) {
	return await MongoClient.connect(connectionString, _.merge(connectionOptions, {serverApi}));
};