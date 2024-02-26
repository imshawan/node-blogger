import { ISortedSetKey } from "@src/types";
import * as Utilities from "@src/utilities";

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
	return parseFloat(value.toFixed(4));
}

export const utilities = {buildSearchQueryFromText, handleBatchKeysArray, mergeBatchSets, prepareSortedSetKeys, parseBytes}