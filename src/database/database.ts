import { MongoClient } from 'mongodb';
import MongoStore from 'connect-mongo';
import { getTTLSessionSeconds } from '@src/application';

export const initializeSessionStore = async (client: MongoClient, dbName: string): Promise<MongoStore> => {
	const sessionStore = MongoStore.create({
		client: client,
		ttl: getTTLSessionSeconds(),
        dbName
	});
    
	return sessionStore;
}