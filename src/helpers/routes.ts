import { NextFunction, Request, Response } from "express";
import { handleApiResponse } from "./response";
import { breadcrumbs, applyCSRFMiddleware } from "@src/middlewares";
import _ from "lodash";

const mountPageRoute = function (router: any, route: string, middlewares: Array<Function>, controller: Function) {
	const defaults: Array<Function> = [breadcrumbs.bind(null, ''), applyCSRFMiddleware];
	middlewares = [...defaults].concat([...middlewares]);

	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

	router.get(route, middlewares, tryRoute(controller));
};

const mountAdminPageRoute = function (router: any, route: string, middlewares: Array<Function>, controller: Function) {
	const defaults: Array<Function> = [applyCSRFMiddleware];
	middlewares = [...defaults].concat([...middlewares]);

	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

	router.get(route, middlewares, tryRoute(controller, (err: Error, req: Request, res: Response) => {
		const error = createErrorObj(err);
		const data = {
			title: 'Error',
			path: req.originalUrl
		};

		res.render('error', _.merge({error}, data));
	}));
};

const mountApiRoute = function (router: any, method: string, route: string, middlewares: Array<Function>, controller: Function) {
	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

	const defaults: Array<Function> = [applyCSRFMiddleware];
	middlewares = [...middlewares].concat(defaults);

    router[method](route, middlewares, tryRoute(controller, (err: Error, req: Request, res: Response) => {
		handleApiResponse(400, res, err);
	}));
};

function tryRoute (controller: Function, handler?: Function) {
	if (controller && controller.constructor && controller.constructor.name === 'AsyncFunction') {
		return async function (req: Request, res: Response, next: NextFunction) {
			try {
				await controller(req, res, next);
			} catch (err) {
				if (handler && typeof handler === 'function') {                    
					return handler(err, req, res);
				}

				next(err);
			}
		};
	}
	return controller;
};

function createErrorObj(err: Error) {
	const {name, message} = err;
	return {
		name, message,
		_breadcrumbs: false,
		hidePageHeader: true
	}
}

export {
    mountApiRoute, mountPageRoute, mountAdminPageRoute,
};