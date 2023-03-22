import { Collections } from "@src/constants";
import { database } from "./init";
import { IParamOptions, IMongoInsertOptions, IMongoDeleteOptions, IMongoUpdateOptions, 
    IMongoPaginateOptions } from "@src/types";


const getObjects = async function (key: object, fields?: Array<string>, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (options.multi) {
        const data = await database.client.collection(options.collection).find(key);
        if (Array.isArray(fields) && fields.length) {
            return data.map((elem: any) => filterObjectFields(elem, fields));
        } else {
            return data;
        }
    }
    
    const data = await database.client.collection(options.collection).findOne(key);
    return filterObjectFields(data, fields)
}

const getObjectsCount = async function (key: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    
    return await database.client.collection(options.collection).find(key).count();
}

const setObjects = async function (data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoInsertOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (Array.isArray(data) && data.length) {
        return await database.client.collection(options.collection).insertMany(data, mongoOptions);
    }

    return await database.client.collection(options.collection).insertOne(data, mongoOptions);
}

const updateObjects = async function (key: object, data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoUpdateOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {new: true};
    }

    if (options.multi) {
        mongoOptions.multi = true;
    }

    return await database.client.collection(options.collection).update(key, data, mongoOptions);
}

const deleteObjects = async function (key: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoDeleteOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (!options.multi) {
        mongoOptions.justOne = true;
    }

    return await database.client.collection(options.collection).remove(key, mongoOptions);
}

const paginateObjects = async function (key: object, paginate: IMongoPaginateOptions, options?: IParamOptions) {
    const {limit, page} = paginate;
    let order = paginate.order || {};

    options = getObjectOptions(options || {});

    if (!Object.keys(order).length) {
        order = {$natural: -1}
    }

    return await database.client.collection(options.collection).find(key).sort(order).limit(limit)
    .skip(page * limit)
    .toArray();
}

const aggregateObjects = async function (pipeline: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    return await database.client.collection(options.collection).aggregate(pipeline).toArray();
}

function filterObjectFields(object: any, fields?: Array<string>) {
    if (!object || !Object.keys(object).length) {
        return object;
    }

    if (fields && Array.isArray(fields) && fields.length) {
        const obj = {};
        fields.forEach(el => {
            if (object[el]) {
                // @ts-ignore
                obj[el] = object[el];
            }
        });
        return obj;
    } else {
        return object;
    }
}

function getObjectOptions (options: IParamOptions): IParamOptions {
    if (options && Object.keys(options).length) {
        if (!options.hasOwnProperty('multi')) {
            options.multi = false;
        }
        if (!options.hasOwnProperty('collection')) {
            options.collection = Collections.DEFAULT;
        }
        if (options.hasOwnProperty('mongoOptions') && typeof options.mongoOptions !== 'object') {
            options.mongoOptions = {};
        }

        if (options.collection) {
            validateCollection(options.collection);
        }

    } else {
        options = {
            multi: false,
            collection: Collections.DEFAULT
        };
    }

    return options;
}

function validateCollection(name: string) {
    name = name.trim();

    if (!name) {
        throw new Error('A valid collection name is required');
    }

    if (!Object.keys(Collections).includes(name)) {
        throw new Error('Permission denied! Tried using an un-defined collection name')
    } 
}

const operations = {
    getObjects, setObjects, getObjectsCount, updateObjects, deleteObjects,
    paginateObjects, aggregateObjects,
};

export {operations};