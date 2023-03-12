import { NextFunction, Request, Response } from "express";
import { handleApiResponse } from "./response";

const mountPageRoute = function (router: any, route: string, middlewares: Array<Function>, controller: Function) {
	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

	router.get(route, middlewares, tryRoute(controller));
};

const mountApiRoute = function (router: any, method: string, route: string, middlewares: Array<Function>, controller: Function) {
	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

    router[method](route, middlewares, tryRoute(controller, (err: Error, res: Response) => {
		handleApiResponse(400, res, err);
	}));
};

function tryRoute (controller: any, handler?: Function) {
	if (controller && controller.constructor && controller.constructor.name === 'AsyncFunction') {
		return async function (req: Request, res: Response, next: NextFunction) {
			try {
				await controller(req, res, next);
			} catch (err) {
				if (handler && typeof handler === 'function') {                    
					return handler(err, res);
				}

				next(err);
			}
		};
	}
	return controller;
};

export {
    mountApiRoute, mountPageRoute
};