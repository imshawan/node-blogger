import {connect} from './connection';
import { initializeSessionStore } from './database';
import { Logger } from '@src/utilities';
import { Cache } from './cache';
import { ICollection, IMongoDatabaseStats, IMongoDBStats } from '@src/types';
import {utilities as dbUtils} from './utils';

const logger = new Logger();
const cache = new Cache({
    name: 'mongodb',
    max: 40000,
    enabled: true
});

export const mongo: { client?: any; connection?: any; sessionStore?: any, cache: Cache } = {cache};

export const initializeDbConnection = async function (mongodb: any) {
    if (!Object.keys(mongodb).length) {
        throw new Error('Database configuration could not be loaded');
    }

    const {uri, db} = mongodb;
    if (!uri) {
        throw new Error('Database connection uri not found in the configuration');
    }

    if (!db) {
        throw new Error('Target database name is required for connection');
    }

    var dbCredentials = uri.match(/(?<=:\/\/)(.*)(?=@)/gi);
    if (!dbCredentials?.length || dbCredentials.length < 1) {
        logger.warn('username and password missing from the connection URI');
    }

    const {client, connection, dbName} = await connect(uri, {database: db}); 
    const sessionStore = await initializeSessionStore(uri, dbName);

    mongo.client = client;
    mongo.connection = connection;
    mongo.sessionStore = sessionStore;
}

export const getConnectionInfo = async function(): Promise<IMongoDBStats | {}> {
    if (!mongo.connection) {
        return {};
    }

    const adminDb = mongo.connection.db('admin');

    const [serverStatus, collections, dbStats] = await Promise.all([
        adminDb.command({ serverStatus: 1 }),
        mongo.client.listCollections().toArray() as ICollection[],
        mongo.client.stats() as IMongoDatabaseStats,
    ]);

    const connectionDetails: IMongoDBStats = {
        host: serverStatus.host,
        version: serverStatus.version,
        uptimeInSeconds: serverStatus.uptime,
        storageEngine: serverStatus.storageEngine.name,
        databaseName: dbStats.db,
        collections: collections.map(collection => collection.name),
        collectionsCount: dbStats.collections,
        views: dbStats.views,
        objects: dbStats.objects,
        averageObjectSize: dbStats.avgObjSize,
        dataSizeGB: dbUtils.parseBytes(dbStats.dataSize),
        storageSizeGB: dbUtils.parseBytes(dbStats.storageSize),
        totalFreeStorageSize: dbUtils.parseBytes(dbStats.totalFreeStorageSize),
        indexes: dbUtils.parseBytes(dbStats.indexes),
        indexSizeGB: dbUtils.parseBytes(dbStats.indexSize),
        indexFreeStorageSize: dbUtils.parseBytes(dbStats.indexFreeStorageSize),
        residentMemoryGB: dbUtils.parseBytes(serverStatus.mem.resident),
        virtualMemoryGB: dbUtils.parseBytes(serverStatus.mem.virtual),
        mappedMemoryGB: dbUtils.parseBytes(serverStatus.mem.mapped),
        bytesInGB: dbUtils.parseBytes(serverStatus.network.bytesIn),
        bytesOutGB: dbUtils.parseBytes(serverStatus.network.bytesOut),
        numberOfRequests: dbUtils.parseBytes(serverStatus.opcounters.total),
    };

    return connectionDetails;
}

export const closeConnection = async function (callback?: Function) {
    if (!callback) {
        callback = function (err: Error) {
            logger.error(err.message);
        }
    }

    if (!mongo.connection) {
        throw new Error('Cannot close connection as it does not exists');
    }

    try {
        mongo.connection.close();
    } catch (err) {
        callback(err);
    }
}