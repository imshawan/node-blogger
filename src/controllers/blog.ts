import { Request, Response } from 'express';

const get = async function (req: Request, res: Response) {  
  const page = {
    title: 'Home'
  };

  res.render('blog/index', page);
}

const create = async function (req: Request, res: Response) {  
  const page = {
    title: 'New post'
  };

  res.render('blog/create', page);
}

export default {
    get, create
  } as const;