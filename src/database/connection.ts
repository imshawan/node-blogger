import {MongoClient, ServerApiVersion} from 'mongodb';
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

    console.log('Trying to establish connection with MongoDB');
    
    const connection = await client.connect();  
    var db = client.db(database);    

    console.log('Established connection with MongoDB');

    // Send a ping to confirm a successful connection to databases
    await db.command({ ping: 1 });
    console.log("Pinged your database. You have successfully connected to the database!");

    return {client: db, connection, dbName: database};
}