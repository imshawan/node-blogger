import { Collections } from "@src/constants";
import { mongo } from "./init";
import { IParamOptions, IMongoInsertOptions, IMongoDeleteOptions, IMongoUpdateOptions, 
    IMongoPaginateOptions, 
    MutableObject} from "@src/types";
import _ from "lodash";
import { ObjectId } from "bson";


const getObjects = async function (key: object, fields?: Array<string>, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (options.multi) {
        let data: any = [];
        if (Object.hasOwnProperty.bind(options)('skip') && Object.hasOwnProperty.bind(options)('limit')) {
            let {skip, limit} = options;
            data = await mongo.client.collection(options.collection).find(key).sort(options.sort).skip(skip).limit(limit).toArray();
        } else {
            data = await mongo.client.collection(options.collection).find(key).sort(options.sort).toArray();
        }

        if (Array.isArray(fields) && fields.length) {
            return data.map((elem: any) => filterObjectFields(elem, fields));
        } else {
            return data;
        }
    }
    
    const data = await mongo.client.collection(options.collection).findOne(key);
    return filterObjectFields(data, fields)
}

const getObjectsCount = async function (key: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    
    return await mongo.client.collection(options.collection).find(key).count();
}

const setObjects = async function (data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoInsertOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (Array.isArray(data) && data.length) {
        return await mongo.client.collection(options.collection).insertMany(data, mongoOptions);
    } else {
        mongoOptions = _.merge(mongoOptions, {upsert: true, returnDocument: 'after', returnOriginal: false})
    }

    const response = await mongo.client.collection(options.collection).findOneAndUpdate({_id: new ObjectId()}, {$set: data}, mongoOptions);
    return response && response.value ? response.value : response;
}

const updateObjects = async function (key: object, data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoUpdateOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {new: true};
    }

    if (options.multi) {
        return await mongo.client.collection(options.collection).updateOne(key, data, mongoOptions);
    }

    return await mongo.client.collection(options.collection).updateMany(key, data, mongoOptions);
}

const deleteObjects = async function (key: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoDeleteOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (!options.multi) {
        return await mongo.client.collection(options.collection).deleteOne(key);
    }

    return await mongo.client.collection(options.collection).deleteMany(key);
}

const paginateObjects = async function (key: object, paginate: IMongoPaginateOptions, options?: IParamOptions) {
    const {limit, page} = paginate;
    let order = paginate.order || {};

    options = getObjectOptions(options || {});

    if (!Object.keys(order).length) {
        order = {$natural: -1}
    }

    return await mongo.client.collection(options.collection).find(key).sort(order).limit(limit)
    .skip(page * limit)
    .toArray();
}

const aggregateObjects = async function (pipeline: object, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    return await mongo.client.collection(options.collection).aggregate(pipeline).toArray();
}

const incrementFieldCount = async function (field: string, key: string = 'global:counters') {
    return await incrementObjectFieldValueBy(key, field, 1);
}

const decrementFieldCount = async function (field: string, key: string = 'global:counters') {
    return await incrementObjectFieldValueBy(key, field, -1);
}

async function incrementObjectFieldValueBy (key: string, field: string, value: number) {
    if (!key || isNaN(value)) {
        return null;
    }
    const options = getObjectOptions();
    const increment = {
        [field]: value
    };
    const operationOptions = { returnOriginal: false, new: true, upsert: true, returnDocument : "after" }

    const result = await mongo.client.collection(options.collection).findOneAndUpdate({ _key: key }, { $inc: increment }, operationOptions);
    return result && result.value ? result.value[field] : null;
};

function filterObjectFields(object: any, fields?: Array<string>) {
    if (!object || !Object.keys(object).length) {
        return object;
    }

    if (fields && Array.isArray(fields) && fields.length) {
        const obj: MutableObject = {};
        fields.forEach((el: any) => {
            if (object.hasOwnProperty(el)) {
                obj[el] = object[el];
            } else {
                obj[el] = null;
            }
        });
        return obj;
    } else {
        return object;
    }
}

function getObjectOptions (options?: IParamOptions): IParamOptions {
    if (!options) {
        options = {};
    }

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
        if (!options.sort || !Object.keys(options.sort).length) {
            options.sort = {$natural: -1}
        }

    } else {
        options = {
            multi: false,
            collection: Collections.DEFAULT,
            sort: {$natural: -1}
        };
    }

    return options;
}

function validateCollection(name: string) {
    name = name.trim();
    const collections = Object.values(Collections).map(el => String(el));

    if (!name) {
        throw new Error('A valid collection name is required');
    }

    if (!collections.includes(name)) {
        throw new Error('Permission denied! Tried using an un-defined collection name')
    } 
}

const operations = {
    getObjects, setObjects, getObjectsCount, updateObjects, deleteObjects,
    paginateObjects, aggregateObjects, incrementFieldCount, decrementFieldCount
};

export {operations as database};