import { Request } from "express";
import category from "@src/category";

const create = async (req: Request) => {
    const categoryData = req.body;
    console.log('req.files', req.files);
    

    // @ts-ignore
    categoryData.userid = req.user.userid;

    return await category.create(categoryData)
}

export default {
    create,
  } as const;