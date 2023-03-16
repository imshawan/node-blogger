import { Request, Response } from 'express';

const get = async function (req: Request, res: Response) {
  const page = {
    title: 'Home'
  };

  res.render('blog/index', page);
}

export default {
    get,
  } as const;