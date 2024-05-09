import { Locks } from '@src/constants';

export * from './cache';

/**
 * @date 22-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @interface IParamOptions
 * @description Common types for options parameter of all database operation functions
 */

interface IParamOptions {
    multi?: boolean,
    collection?: string
    mongoOptions?: object
    skip?: number
    limit?: number
    sort?: object
}

interface IOptions extends IParamOptions {
    collection: string
}

/**
 * @date 22-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @interface IMongoOptions
 * @description Valid mongodb options that can be used with data insertion methods
 * 
 * @see {@link https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/} 
 *      {@link https://www.mongodb.com/docs/manual/reference/method/db.collection.insertMany/}
 */

interface IMongoInsertOptions {
    ordered?: boolean
    writeConcern?: object
}

/**
 * @date 22-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @interface IMongoUpdateOptions
 * @description Valid mongodb options that can be used with data updation methods
 * @see {@link https://www.mongodb.com/docs/manual/reference/method/db.collection.update/}
 */

interface IMongoUpdateOptions {
    multi?: boolean
    new?: boolean
    upsert?: boolean
    writeConcern?: object
    collation?: object
    arrayFilters?: Array<any>
    hint?:  object|string
    let?: object
}

/**
 * @date 22-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @interface IMongoDeleteOptions
 * @description Valid mongodb options that can be used with data deletion methods
 * @see {@link https://www.mongodb.com/docs/manual/reference/method/db.collection.remove/}
 */

interface IMongoDeleteOptions {
    justOne?: boolean
    writeConcern?: object
    collation?: object
    let?: object
}

/**
 * @date 22-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @interface IMongoPaginateOptions
 * @description Valid mongodb options that can be used with data pagination methods
 * @see {@link https://www.mongodb.com/docs/manual/reference/method/cursor.skip/}
 */

interface IMongoPaginateOptions {
    order?: object
    page: number
    limit: number
}

/**
 * @date 20-10-2023
 * @interface IMongoConnectionProps
 * @description This interface defines the structure of an object representing the components of a MongoDB connection URL
 */
interface IMongoConnectionProps {
    protocol: string;
    username: string;
    password: string;
    clusterAddress: string;
}

interface ISortedSetKey {
    _key: string
    value: string | number,
    rank?: number
}

interface ISortedSetLexicalQuery {
    _key: string;
    value?: {
        $gt?: string | number;
        $gte?: string;
        $lt?: string;
        $lte?: string;
    };
}

interface IMongoDBStats {
    /** MongoDB server host */
    host: string;
    /** MongoDB version */
    version: string;
    /** Uptime of the MongoDB server in seconds */
    uptimeInSeconds: number;
    /** Storage engine used by MongoDB */
    storageEngine: string;
    /** Name of the database */
    databaseName: string;
    /** Names of collections in the database */
    collections: string[];
    /** Number of collections in the database */
    collectionsCount: number;
    /** Number of views in the database */
    views: number;
    /** Total number of objects (documents) in all collections */
    objects: number;
    /** Average size of objects (documents) in bytes */
    averageObjectSize: number;
    /** Total size of data in gigabytes */
    dataSizeGB: number;
    /** Total size of storage allocated for data in gigabytes */
    storageSizeGB: number;
    /** Total free space available for storage in gigabytes */
    totalFreeStorageSize: number;
    /** Number of indexes in all collections */
    indexes: number;
    /** Total size of indexes in gigabytes */
    indexSizeGB: number;
    /** Total free space available for indexes in gigabytes */
    indexFreeStorageSize: number;
    /** Amount of resident memory used by MongoDB in gigabytes */
    residentMemoryGB: number;
    /** Amount of virtual memory used by MongoDB in gigabytes */
    virtualMemoryGB: number;
    /** Amount of mapped memory used by MongoDB in gigabytes */
    mappedMemoryGB: number;
    /** Amount of bytes in received by the MongoDB server in gigabytes */
    bytesInGB: number;
    /** Amount of bytes out sent by the MongoDB server in gigabytes */
    bytesOutGB: number;
    /** Total number of requests made to the MongoDB server */
    numberOfRequests: number;
}

interface IMongoDatabaseStats {
    /** Name of the database */
    db: string;
    /** Number of collections in the database */
    collections: number;
    /** Number of views in the database */
    views: number;
    /** Total number of objects (documents) in all collections */
    objects: number;
    /** Average size of objects (documents) in bytes */
    avgObjSize: number;
    /** Total size of data in bytes */
    dataSize: number;
    /** Total size of storage allocated for data in bytes */
    storageSize: number;
    /** Total free space available for storage in bytes */
    totalFreeStorageSize: number;
    /** Number of extents */
    numExtents: number;
    /** Number of indexes in all collections */
    indexes: number;
    /** Total size of indexes in bytes */
    indexSize: number;
    /** Total free space available for indexes in bytes */
    indexFreeStorageSize: number;
    /** Total size of database files on disk in bytes */
    fileSize: number;
    /** Size of namespace file in MB */
    nsSizeMB: number;
    /** Status of the operation (1 if successful) */
    ok: number;
}

interface IDatabase {
    /** Name of the database */
    name: string;
    /** Size of the database on disk in bytes */
    sizeOnDisk: number;
    /** Indicates whether the database is empty or not */
    empty: boolean;
}

interface ICollection {
    /** Name of the collection */
    name: string;
    /** Type of the collection */
    type: string;
    /** Options for the collection */
    options: object;
    /** Information about the collection */
}

interface IMongoDatabasesList {
    /** Array of database objects */
    databases: Database[];
    /** Total size of all databases on disk in bytes */
    totalSize: number;
    /** Total size of all databases on disk in megabytes */
    totalSizeMb: number;
    /** Status of the operation (1 if successful) */
    ok: number;
}

interface ILockData {
    _key: string;
    type: keyof typeof Locks;
    caller: number;
    lockedAt: Date;
    expiresAt: number;
  }
  

export {
    IMongoInsertOptions, IParamOptions, IMongoDeleteOptions, IOptions,
    IMongoUpdateOptions, IMongoPaginateOptions, IMongoConnectionProps, ISortedSetKey, ISortedSetLexicalQuery,
    IMongoDatabaseStats, IMongoDatabasesList, ICollection, IMongoDBStats, ILockData
}