import { Request } from "express";
import category from "@src/category";
import { MutableObject } from "@src/types";

const categoryApi: MutableObject = {};

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

categoryApi.delete = async (req: Request) => {
    const {id} = req.params;
    const {user} = req;

    // @ts-ignore
    const userid = Number(user.userid);

    await category.deleteCategory(id, userid)
}

export default categoryApi;