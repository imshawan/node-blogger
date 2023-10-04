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

export {
    IMongoInsertOptions, IParamOptions, IMongoDeleteOptions,
    IMongoUpdateOptions, IMongoPaginateOptions
}