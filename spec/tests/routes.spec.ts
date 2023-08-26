import supertest, { SuperTest, Test, Response } from 'supertest';

import app from '@src/server';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

// StatusCodes
const {
  OK,
  UNAUTHORIZED,
} = HttpStatusCodes;


// **** Tests **** //
 export async function execute () {
    console.log('route')
 }