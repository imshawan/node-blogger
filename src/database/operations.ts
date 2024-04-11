import { Collections } from "@src/constants";
import { mongo } from "./init";
import { IParamOptions, IMongoInsertOptions, IMongoDeleteOptions, IMongoUpdateOptions, 
    IMongoPaginateOptions, 
    MutableObject,
    ISortedSetKey,
    ISortedSetLexicalQuery,
    IOptions} from "@src/types";
import _ from "lodash";
import { ObjectId } from "bson";
import { utilities as dbUtils } from "./utils";
import { Db } from "mongodb";

const getFromDb = async function (key: object, fields?: Array<string>, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (options.multi) {
        let data: any = await mongo.client.collection(options.collection).find(key).sort(options.sort).toArray();
        if (Array.isArray(fields) && fields.length) {
            return data.map((elem: any) => filterObjectFields(elem, fields));
        } else {
            return data;
        }
    }
    
    const data = await mongo.client.collection(options.collection).findOne(key);
    return filterObjectFields(data, fields)
}

const getObjects = async function (key: string, fields?: Array<string>, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (options.multi) {
        let data: any = [];
        if (Object.hasOwnProperty.bind(options)('skip') && Object.hasOwnProperty.bind(options)('limit')) {
            let {skip, limit} = options;
            data = await mongo.client.collection(options.collection).find({_key: key}).sort(options.sort).skip(skip).limit(limit).toArray();
        } else {
            data = await mongo.client.collection(options.collection).find({_key: key}).sort(options.sort).toArray();
        }

        if (Array.isArray(fields) && fields.length) {
            return data.map((elem: any) => filterObjectFields(elem, fields));
        } else {
            return data;
        }
    }
    
    let data = mongo.cache.get(key);
    if (!data) {
        data = await mongo.client.collection(options.collection).findOne({_key: key});
    }

    mongo.cache.set(key, data);

    return filterObjectFields(data, fields);
}

const getObjectsBulk = async function (keysArray: string[], fields?: string[], options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (!keysArray || !Array.isArray(keysArray) || !keysArray.length) {
        return [];
    }

    if (!fields || !Array.isArray(fields)) {
        fields = [];
    }

    let records: Array<object> = [],
        project = {_id: 0, _scheme: 0};
        
    const bulk = mongo.cache.getBulk(keysArray);
    if (bulk?.data && bulk.data.length) {
        records = bulk.data;
    }

    if (bulk && bulk.misses.length) {
        let data = await mongo.client.collection(options.collection).find({_key: {$in: bulk.misses}}, { projection: project }).toArray();
        if (data.length) {
            data.forEach((item: { _key: string; }) => mongo.cache.set(item._key, item));
        }

        records = records.concat(data);
    }

    // Ensuring to return data as per sequence of elements in keysArray, so that it does not affect any previously sequenced data in keys array
    const recordsMap = new Map(records.map((obj: any) => [obj._key, {...obj, _key: undefined}]));
    const sortedRecordsWithKeysArray = keysArray.map(key => recordsMap.get(key));

    if (!fields.length) {
        return sortedRecordsWithKeysArray;
    }

    return sortedRecordsWithKeysArray.map((item: MutableObject) => {
        let obj: MutableObject = {};
        (fields ?? []).forEach(field => {
            if (item && item.hasOwnProperty(field)) {
                obj[field] = item[field];
            }
        });

        return Object.keys(obj).length ? obj : null;
    });
}

const getObjectsCount = async function (key: string, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    
    return await mongo.client.collection(options.collection).countDocuments({_key: key});
}

const setObjects = async function (key: string | null, data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoInsertOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (Array.isArray(data) && data.length) {
        data = data.map(e => {
            if (!Object.hasOwnProperty.bind(e)('_key') || !e._key) {
                e._key = key;
            }
            return e;
        });

        return await mongo.client.collection(options.collection).insertMany(data, mongoOptions);
    } else {
        if (!key) {
            throw new Error('A valid key is required for this operation.')
        }
        if (!isNaN(Number(key))) {
            throw new Error('Key must be a alpha-numeric value, found ' + typeof key);
        }

        data._key = key;
        mongoOptions = _.merge(mongoOptions, {upsert: true, returnDocument: 'after', returnOriginal: false})
    }

    const response = await mongo.client.collection(options.collection).findOneAndUpdate({_id: new ObjectId()}, {$set: data}, mongoOptions);
    return response && response.value ? response.value : response;
}

const updateObjects = async function (key: string, data: any, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoUpdateOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {new: true};
    }

    if (options.multi) {
        return await mongo.client.collection(options.collection).updateMany({_key: key}, {$set: data}, mongoOptions);
    }

    const ack = await mongo.client.collection(options.collection).updatedOne({_key: key}, {$set: data}, mongoOptions);

    mongo.cache.delete(key);

    return ack;
}

const deleteObjects = async function (key: string, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let mongoOptions: IMongoDeleteOptions = options.mongoOptions || {};

    if (!mongoOptions || !Object.keys(mongoOptions).length) {
        mongoOptions = {};
    }

    if (!options.multi) {
        return await mongo.client.collection(options.collection).deleteOne({_key: key});
    }

    const ack = await mongo.client.collection(options.collection).deleteMany({_key: key});

    mongo.cache.delete(key);

    return ack;
}

const deleteObjectsWithKeys = async function (keysArray: string | string[], options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (!keysArray) {
        return;
    }

    if (!Array.isArray(keysArray)) {
        keysArray = [keysArray]
    }

    await mongo.client.collection(options.collection).deleteMany({ _key: { $in: keysArray } });
    
    mongo.cache.deleteBulk(keysArray);
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

const incrementFieldCount = async function (field: string, key: string = 'global:counters', options?: IParamOptions) {
    return await incrementObjectFieldValueBy(key, field, 1, options);
}

const decrementFieldCount = async function (field: string, key: string = 'global:counters', options?: IParamOptions) {
    return await incrementObjectFieldValueBy(key, field, -1, options);
}

const sortedSetAddKey = async function (key: string, value: string | number, rank: number, options?: IParamOptions): Promise<void> {
    options = getObjectOptions(options || {});

    if (!key || !value) {
        throw new Error('key and value is a required parameter');
    }
    if (!rank) {
        rank = 0;
    }

    await sortedSetAddKeys([
        [key, value, rank]
    ], options);
}

const sortedSetAddKeys = async function (keysArray: Array<Array<string | number>>, options?: IParamOptions): Promise<void> {
    options = getObjectOptions(options || {});
    const data: ISortedSetKey[] = dbUtils.prepareSortedSetKeys(keysArray);

    if (data.length) {
        await setObjects(null, data, _.merge(options, {multi: true}));
    }
}

const sortedSetRemoveKey =  async function (key: string, value: string | number, options?: IParamOptions): Promise<void> {
    options = getObjectOptions(options || {});

    if (!key || !value) {
        throw new Error('key and value is a required parameter');
    }

    await sortedSetRemoveKeys([
        [key, value]
    ], options);
}

const sortedSetRemoveKeys = async function (keysArray: Array<Array<string | number>>, options?: IParamOptions): Promise<void> {
    options = getObjectOptions(options || {});

    if (!Array.isArray(keysArray)) {
        keysArray = [keysArray];
    }

    if (keysArray.length) {
        let bulk = mongo.client.collection(options.collection).initializeUnorderedBulkOp();

        keysArray.forEach(key => {
            if (Array.isArray(key) && key.length > 1) {
                bulk.find({ _key: String(key[0]), value: String(key[1]) }).delete();
            }
        });

        await bulk.execute();
    }
}

const getSortedSetsLexical = async function (
	key: string,
	min: string,
	max: string,
	start?: number,
	count?: number,
	options?: IParamOptions
) {
    return await findSortedSetsLexical(key, min, max, 1, start, count, options)
};

const getSortedSetsLexicalReverse = async function (
	key: string,
	min: string,
	max: string,
	start?: number,
	count?: number,
	options?: IParamOptions
) {
    return await findSortedSetsLexical(key, min, max, -1, start, count, options);
};

const getSortedSetsLexicalCount = async function (key: string, min: string, max: string, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    let data = await findSortedSetsLexical(key, min, max, 1, 0, 0, options);
    return data && data.length ? data.length : 0;
}

const getSortedSetsSearch = async function (params: { withRanks?: boolean; match: string; key: string; skip?:number, limit?: number; }, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    const project: {_id: number, value: number, rank?: number} = { _id: 0, value: 1 };
    let {key, limit, withRanks, skip} = params;

    if (withRanks) {
        project.rank = 1;
    }

    const match = params.match;
    let regex;
    try {
        regex = new RegExp(match);
    } catch (err) {
        return [];
    }

    const cursor = mongo.client.collection(options.collection).find({_key: key, value: { $regex: regex, $options: 'i' }}, { projection: project });
    if (skip) {
        cursor.skip(skip);
    }

    if (limit) {
        cursor.limit(limit);
    }

    const data = await cursor.toArray();
    if (!withRanks) {
        return data.map((item: ISortedSetKey) => item.value);
    }
    return data;
};

const getSortedSetsSearchCount = async function (key: string, match: string, options?: IParamOptions) {
    options = getObjectOptions(options || {});

    if (!match || !key) {
        throw new Error('match and key are both required parameters');
    }

    let regex;
    try {
        regex = new RegExp(match);
    } catch (err) {
        return [];
    }

    return mongo.client.collection(options.collection).countDocuments({_key: key, value: { $regex: regex }});
};

const fetchSortedSetsRangeReverse = async function (key: string | string[], start: number, stop: number, options?: IParamOptions) {
    return await fetchSortedSetsRange(key, start, stop, '-inf', '+inf', -1, false, options);
};

const fetchSortedSetsRangeWithRanks = async function (key: string | string[], start: number, stop: number, options?: IParamOptions) {
    return await fetchSortedSetsRange(key, start, stop, '-inf', '+inf', 1, true, options);
};

const fetchSortedSetsRangeReverseWithRanks = async function (key: string | string[], start: number, stop: number, options?: IParamOptions) {
    return await fetchSortedSetsRange(key, start, stop, '-inf', '+inf', -1, true, options);
};

const fetchSortedSetsRange = async function fetchSortedSetsRange(
	key: string | string[],
	start: number,
	stop: number,
	min: string = '-inf',
	max: string = '+inf',
	sort: number = 1,
	withRanks: boolean = false,
	options?: IParamOptions
) {
    options = getObjectOptions(options || {});

    if (!key || (Array.isArray(key) && (start < 0 && start > stop || key.length === 0))) {
        return [];
    }

    async function execute(_key: string | string[] | object, fields: any, skip: number, limit: number): Promise<ISortedSetKey[]> {
        return await mongo.client.collection(options?.collection).find({ ...query, ...{ _key } }, { projection: fields })
            .sort({ rank: sort })
            .skip(skip)
            .limit(limit)
            .toArray();
    }

    const query: MutableObject = Array.isArray(key) ? (key.length > 1 ? { _key: { $in: key } } : { _key: key[0] }) : { _key: key };

    if (min !== '-inf') {
        query.rank = { $gte: min };
    }
    if (max !== '+inf') {
        query.rank = query.rank || {};
        query.rank.$lte = max;
    }
    if (max === min && max !== undefined) {
        query.rank = max;
    }

    const fields: any = { _id: 0, _key: 0 };
    if (!withRanks) {
        fields.rank = 0;
    }

    let reverse = false;
    if (start === 0 && stop < -1) {
        reverse = true;
        sort *= -1;
        start = Math.abs(stop + 1);
        stop = -1;
    } else if (start < 0 && stop > start) {
        const tmp1 = Math.abs(stop + 1);
        stop = Math.abs(start + 1);
        start = tmp1;
    }

    let limit = stop - start + 1;
    if (limit <= 0) {
        limit = 0;
    }

    let result: any[] = [];
    if (Array.isArray(key) && key.length > 100) {
        const batches: any[] = [];
        const batchSize = Math.ceil(key.length / Math.ceil(key.length / 100));

        await dbUtils.handleBatchKeysArray(key, async (currentBatch: any) => batches.push(currentBatch), { batch: batchSize });
        const batchData = await Promise.all(batches.map(batch => execute({ $in: batch }, { _id: 0, _key: 0 }, 0, stop + 1)));

        result = dbUtils.mergeBatchSets(batchData, 0, stop, sort);

        if (start > 0) {
            result = result.slice(start, stop !== -1 ? stop + 1 : undefined);
        }
    } else {
        result = await execute(query._key, fields, start, limit);
    }

    if (reverse) {
        result.reverse();
    }
    if (!withRanks) {
        result = result.map((item: ISortedSetKey) => item.value);
    }

    return result;
}

const getSortedSetValue = async function (key: string, value: any, withRank: boolean = false, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    if (!key) {
        return null;
    }

    const result = await mongo.client.collection(options.collection).findOne({ _key: key, value: value }, { projection: { _id: 0, _key: 0, value: 0 } });
    if (!result) {
        return null;
    }
    if (withRank) {
        return result.rank;
    }

    return result;
};

const updateSortedSetValue = async function (key: string, value: any, data: object, options?: IParamOptions) {
    let opts = getObjectOptions(options || {}) as IOptions;
    if (!key || !value || !Object.keys(data).length) {
        return null;
    }

    await (mongo.client as Db).collection(opts.collection).findOneAndUpdate({ _key: key, value: value }, {$set: data});
}

const removeSortedSetValue = async function (key: string, value: any, options?: IParamOptions) {
    let opts = getObjectOptions(options || {}) as IOptions;
    if (!key || !value) {
        return null;
    }

    await (mongo.client as Db).collection(opts.collection).findOneAndDelete({ _key: key, value: value });
}

const getSortedSetsValue = async function (keys: string, value: any, withRank: boolean = false, options?: IParamOptions) {
    options = getObjectOptions(options || {});
    if (!Array.isArray(keys) || !keys.length) {
        return [];
    }
    
    const results = await mongo.client.collection(options.collection).find({ _key: { $in: keys }, value: value }, { projection: { _id: 0, value: 0 } }).toArray();
    if (!results.length) {
        return [];
    }

    if (withRank) {
        return mapResultsToRanks(results, keys);
    }

    return results;
};

async function findSortedSetsLexical (
	key: string,
	min: string,
	max: string,
	sort: number,
	start?: number,
	limit?: number,
	options?: IParamOptions
) {
	options = getObjectOptions(options || {});

	var query: ISortedSetLexicalQuery = { _key: key, value: {} };
	start = start ?? 0;
	limit = limit ?? 0;
	query = buildLexicalQuery(query, min, max);

	const data = await mongo.client.collection(options.collection)
		.find(query, { projection: { _id: 0, value: 1 } })
		.sort({ value: sort })
		.skip(start)
		.limit(limit === -1 ? 0 : limit)
		.toArray();

	return data.map((item: { value: ISortedSetKey }) => item && item.value);
};

function buildLexicalQuery(query: ISortedSetLexicalQuery, min: string | number, max: string | number): ISortedSetLexicalQuery {
    min = String(min);
    max = String(max);

    if (min !== '-') {
        if (min.startsWith('(')) {
            query.value = { ...query.value, $gt: min.slice(1) };
        } else if (min.startsWith('[')) {
            query.value = { ...query.value, $gte: min.slice(1) };
        } else {
            query.value = { ...query.value, $gte: min };
        }
    }
    if (max !== '+') {
        query.value = query.value || {};
        if (max.startsWith('(')) {
            query.value.$lt = max.slice(1);
        } else if (max.startsWith('[')) {
            query.value.$lte = max.slice(1);
        } else {
            query.value.$lte = max;
        }
    }

    return query;
}

function mapResultsToRanks(result: ISortedSetKey[], keys: string[]): (number | null | undefined)[] {
    const map: { [key: string]: ISortedSetKey } = {};

    result.forEach(item => {
        if (item) {
            map[item._key] = item;
        }
    });

    return keys.map(key => (map[key] ? map[key].rank : null));
}

async function incrementObjectFieldValueBy (key: string, field: string, value: number, options?: IParamOptions): Promise<number> {
    if (!key || isNaN(value)) {
        return 0;
    }
    options = getObjectOptions(options);
    const increment = {
        [field]: value
    };
    const operationOptions = { returnOriginal: false, new: true, upsert: true, returnDocument : "after" }

    const result = await mongo.client.collection(options.collection).findOneAndUpdate({ _key: key }, { $inc: increment }, operationOptions);
    const fieldValue = result && result.value ? result.value[field] : null;

    if (!fieldValue) {
        return await incrementObjectFieldValueBy(key, field, value, options);
    }

    return fieldValue;
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

function getObjectOptions (options?: IParamOptions): IOptions {
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

    return options as IOptions;
}

function validateCollection(name: string) {
    name = name.trim();
    const collections = Object.values(Collections).map(el => String(el));

    if (!name) {
        throw new Error('A valid collection name is required');
    }

    if (!collections.includes(name)) {
        throw new Error('Permission denied! Tried using an invalid collection name')
    } 
}

const operations = {
	getFromDb,
	getObjects,
	getObjectsBulk,
	setObjects,
	getObjectsCount,
	updateObjects,
	deleteObjects,
	paginateObjects,
	aggregateObjects,
	deleteObjectsWithKeys,
	incrementFieldCount,
	decrementFieldCount,
	sortedSetAddKey,
	sortedSetAddKeys,
	getSortedSetsSearch,
    getSortedSetsSearchCount,
	sortedSetRemoveKey,
	sortedSetRemoveKeys,
	getSortedSetsLexicalCount,
	getSortedSetsLexicalReverse,
	getSortedSetsLexical,
	fetchSortedSetsRangeReverseWithRanks,
	fetchSortedSetsRangeWithRanks,
	fetchSortedSetsRangeReverse,
	fetchSortedSetsRange,
	getSortedSetsValue,
	getSortedSetValue,
	updateSortedSetValue,
	removeSortedSetValue,
};

export {operations as database};