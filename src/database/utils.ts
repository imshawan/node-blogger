/*
 * Copyright (C) 2024 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { IOptions, IParamOptions, ISortedSetKey } from "@src/types";
import * as Utilities from "@src/utilities";
import { Collections } from "@src/constants";

const buildSearchQueryFromText = function (text: string) {
	let search = text;
	if (text.startsWith("*")) {
		search = search.substring(1);
	}
	if (text.endsWith("*")) {
		search = search.substring(0, search.length - 1);
	}
	search = Utilities.excapeRegExp(search);
	if (!text.startsWith("*")) {
		search = "^" + search;
	}
	if (!text.endsWith("*")) {
		search += "$";
	}
	return search;
};

const sleep = async function (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handleBatchKeysArray = async function (keysArray: Array<any>, handler: Function, params: { batch?: number, interval?: number } = {}) {
	if (!Array.isArray(keysArray) || !keysArray.length) {
		return;
	}

	if (!handler) {
		throw new Error('A handler function is required for the operation.')
	}
	
	if (typeof handler !== 'function') {
		throw new Error('handler must be a function, found it to be ' + typeof handler);
	}

	if (handler.constructor && handler.constructor.name !== 'AsyncFunction') {
		throw new Error('handler must be a async function');
	}

	const DEFAULT_BATCH_SIZE = 100;
	const batch = params.batch || DEFAULT_BATCH_SIZE;
	const interval = params.interval;

	async function handleNext(start: number): Promise<void> {
		const currentBatch = keysArray.slice(start, start + batch);

		if (!currentBatch.length) {
			return;
		}

		await handler(currentBatch);

		if (start + batch < keysArray.length) {
			if (interval) {
				await sleep(interval);
			}
			await handleNext(start + batch);
		}
	}
	
	await handleNext(0);
}

const mergeBatchSets = function (batchSetData: any[], start: number, stop: number, sort: number): any[] {
    function getFirst(): any {
        let selectedArray = batchSetData[0];
        for (let i = 1; i < batchSetData.length; i++) {
            if (batchSetData[i].length && (
                !selectedArray.length ||
                (sort === 1 && batchSetData[i][0].rank < selectedArray[0].rank) ||
                (sort === -1 && batchSetData[i][0].rank > selectedArray[0].rank)
            )) {
                selectedArray = batchSetData[i];
            }
        }
        return selectedArray.length ? selectedArray.shift() : null;
    }

    const result: any[] = [];
    let item: any = null;
    do {
        item = getFirst();
        if (item) {
            result.push(item);
        }
    } while (item && (result.length < (stop - start + 1) || stop === -1));
    return result;
}

const prepareSortedSetKeys = function (keysArray: Array<Array<string | number>>): ISortedSetKey[] {
	const data: ISortedSetKey[] = [];
    if (!Array.isArray(keysArray)) {
        keysArray = [keysArray];
    }
    if (keysArray.length) {
        keysArray.forEach(key => {
            if (Array.isArray(key) && key.length > 1) {
                let obj: ISortedSetKey = {
                    _key: String(key[0]),
                    value: isNaN(Number(key[1])) ? String(key[1]) : Number(key[1]),
                    rank: Number(key[2]) ?? 0
                }

                data.push(obj);
            }
        });
    }

	return data;
}

const parseBytes = function (bytes: number): number {
	if (!bytes) return 0;
	if (typeof bytes !== 'number') {
		throw new Error('bytes must be a number, found ' + typeof bytes);
	}

	let value = Number(bytes) / (1024 * 1024 * 1024);
	return parseFloat(value.toFixed(5));
}

const validateCollection =  function(name: string) {
    name = name.trim();
    const collections = Object.values(Collections).map(el => String(el));

    if (!name) {
        throw new Error('A valid collection name is required');
    }

    if (!collections.includes(name)) {
        throw new Error('Permission denied! Tried using an invalid collection name')
    } 
}

const getObjectOptions = function (options?: IParamOptions): IOptions {
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

export const utilities = {buildSearchQueryFromText, handleBatchKeysArray, mergeBatchSets, prepareSortedSetKeys, parseBytes, validateCollection, getObjectOptions}