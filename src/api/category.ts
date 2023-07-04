import { Request } from "express";
import category from "@src/category";

const create = async (req: Request) => {
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

export default {
    create,
  } as const;