import {MongoClient, ServerApiVersion} from 'mongodb';
import { Logger } from '@src/utilities';
import _ from 'lodash';

const connectionOptions = {
    connectTimeoutMS: 90000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const serverApi = {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}

const {info} = new Logger();

export const connect = async function (connectionString: string, options: object) {
    if (!connectionString) {
        throw new Error('Missing mongodb connection string');
    }

    if (!Object.keys(options).length) {
        options = {};
    }

    // @ts-ignore
    if (!options.hasOwnProperty('database') || !options.database) {
        throw new Error('A valid database name is required to establish connection');
    }

    // @ts-ignore
    const {database} = options;
    const client = new MongoClient(connectionString, _.merge(connectionOptions, {serverApi}));

    info('Trying to establish connection with database server');
    
    const connection = await client.connect();  
    var db = client.db(database);    

    connection.on('close', () => {
        connection.removeAllListeners();
    });

    // connection.on('disconnect', (event) => {
    //     info(event)
    // });

    info('Established connection with database server');

    // Send a ping to confirm a successful connection to databases
    await db.command({ ping: 1 });
    info("Pinged your database. Connected successfuly!");

    return {client: db, connection, dbName: database};
}