import { database } from "@src/database";
import { IParamOptions, IPost, MutableObject } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";

const getPostById = async function (id: number, fields: string[] = []): Promise<IPost> {
    if (!id) {
        throw new Error('id is required');
    }

    if (isNaN(id)) {
        throw new Error('id must be a number, found ' + typeof id)
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array but found ' + typeof fields);
        
    } else if (!fields) {
        fields = []
    }

    const postId = Number(id);
    return await database.getObjects({ _key: 'post:' + postId}, fields);   
}

export default {
    getPostById,
} as const;