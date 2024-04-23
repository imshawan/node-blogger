import { database } from "@src/database";
import { MutableObject, ICategory } from "@src/types";
import _ from "lodash";
import { categoryFields } from "./data";
import categoryUtils from "./utils";

const getMostContributed = async function (userid: number, fields?: (keyof ICategory)[], page?: number, perPage?: number) {
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (!userid) {
        throw new Error('userid is required');
    }
    if (isNaN(perPage)) {
        throw new TypeError('perPage must be a number (int) found ' + typeof perPage);
    }
    if (isNaN(page)) {
        throw new TypeError('page must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = categoryFields;
    }

    let requiresDescription = fields.includes('description');
    if (fields.includes('blurb') && !requiresDescription) {
        fields.push('description');
    }

    const searchKeys = 'user:' + userid + ':category:post',
        start = (page - 1) * perPage,
        stop = (perPage + start);

    const [categoryKeysSets, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(searchKeys, start, stop),
        database.getObjectsCount(searchKeys)
    ]);

    let data = await database.getObjectsBulk(categoryKeysSets, fields);
    if (data.length) {
        data = data.map((item: ICategory) => {
            item.blurb = categoryUtils.prepareBlurb(item);
            if (!requiresDescription) {
                item.description = undefined;
            }
            return item;
        });
    }

    return {categories: data, total: total ?? 0}
}

export default {getMostContributed} as const;