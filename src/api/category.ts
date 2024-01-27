import { Request } from "express";
import category from "@src/category";
import { MutableObject } from "@src/types";
import _ from 'lodash';
import * as Helpers from "@src/helpers";
import { isParsableJSON } from "@src/utilities";

const categoryApi: MutableObject = {
    tags: {}
};
const categoryFields = ['name', 'cid', 'thumb', 'parent'];

categoryApi.get = async (req: Request) => {
    const {query, params} = req;
    let {search, sortBy} = query;
    let {cid} = params;
    let includeSubCategories = true;

    if (cid) {
        if (!Number(cid)) {
            throw new Error('cid must be a number found ' + typeof cid);
        }

        return await category.data.getCategoryByCid(cid);
    }

    let perPage = Number(query.perPage);
    let page = Number(query.page);
    let url = [req.baseUrl, req.url].join('')

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }
    if (Object.hasOwnProperty.bind(query)('subCategories')) {
        let {subCategories} = query;
        subCategories = String(subCategories);

        if (isParsableJSON(subCategories)) {
            includeSubCategories = JSON.parse(subCategories.toLowerCase().trim());
        }
    } 

    var categories = []

    if (search) {
        search = String(search).trim();
        categories = await category.data.getCategoryByName(search, perPage, page, categoryFields, null, includeSubCategories);
    } else {
        categories = await category.data.getAllCategories(perPage, page, categoryFields, null, includeSubCategories);
    }

    return Helpers.paginate(categories, perPage, page, url)
}

categoryApi.create = async (req: Request) => {
    const categoryData = req.body;
    const {files} = req;

    if (files && files.length) {
        const thumb = (files as any[]).find((file: any) => file.fieldname == 'thumb');
        if (thumb && Object.hasOwnProperty.bind(thumb)('url')) {
            req.body.thumb = thumb.url;
        }
    }

    if (categoryData.parent) {
        if (isNaN(categoryData.parent)) {
            throw new TypeError('parent category id must be an integer found ' + typeof categoryData.parent);
        }

        categoryData.parent = Number(categoryData.parent);
    }

    // @ts-ignore
    categoryData.userid = req.user.userid;

    return await category.create(categoryData)
}

categoryApi.edit = async (req: Request) => {
    const categoryData = req.body;
    const {files} = req;
    const id = req.params.id;
    const {tags} = categoryData;

    if (files && files.length) {
        const thumb = (files as any[]).find((file: any) => file.fieldname == 'thumb');
        if (thumb && Object.hasOwnProperty.bind(thumb)('url')) {
            req.body.thumb = thumb.url;
        }
    }

    if (categoryData.parent) {
        if (isNaN(categoryData.parent)) {
            throw new TypeError('parent category id must be an integer found ' + typeof categoryData.parent);
        }

        categoryData.parent = Number(categoryData.parent);
    }

    // @ts-ignore
    categoryData.userid = req.user.userid;
    categoryData.cid = id;

    return await category.update(req.body);
}

categoryApi.delete = async (req: Request) => {
    const {id} = req.params;
    const {user} = req;

    // @ts-ignore
    const userid = Number(user.userid);

    await category.deleteCategory(id, userid)
}

/**
 * @description Business logic for the tags management of categories
 */

categoryApi.tags.create = async (req: Request) => {
    const {id} = req.params;
    const {user} = req;
    const {name} = req.body;

    // @ts-ignore
    const userid = Number(user.userid);

    if (_.isNaN(id)) {
        throw new Error('category id must be a number, found ' + typeof id);
    }

    const tag = {
        name,
        cid: Number(id),
        userid,
    }

    return await category.tags.create(tag);
}


categoryApi.tags.remove = async (req: Request) => {
    const {id, tagId} = req.params;
    const {user} = req;

    // @ts-ignore
    const userid = Number(user.userid);

    if (_.isNaN(id)) {
        throw new Error('category id must be a number, found ' + typeof id);
    }
    if (_.isNaN(tagId)) {
        throw new Error('tagId id must be a number, found ' + typeof tagId);
    }

    const tag = {cid: Number(id), tagId: Number(tagId)}

    await category.tags.remove(tag, userid);
}

categoryApi.tags.getByName = async (req: Request) => {
    const {cid, name} = req.params;
    const userid = Helpers.parseUserId(req);

    if (_.isNaN(cid)) {
        throw new Error('category id must be a number, found ' + typeof cid);
    }

    return await category.tags.getByCategoryIdAndName(Number(cid), name);
}

export default categoryApi;