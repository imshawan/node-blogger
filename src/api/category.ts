import { Request } from "express";
import category from "@src/category";
import { MutableObject } from "@src/types";
import _ from 'lodash';

const categoryApi: MutableObject = {
    tags: {}
};

categoryApi.create = async (req: Request) => {
    const categoryData = req.body;
    const {files} = req;

    if (files && files.length) {
        const thumb = (files as any[]).find((file: any) => file.fieldname == 'thumb');
        if (thumb && Object.hasOwnProperty.bind(thumb)('url')) {
            req.body.thumb = thumb.url;
        }
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

    const tag = {cid: Number(id), tagid: Number(tagId)}

    await category.tags.remove(tag, userid);
}

export default categoryApi;