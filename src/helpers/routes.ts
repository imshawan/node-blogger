/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

	router.get(route, middlewares, tryRoute(controller, pageRouteErrorHandler));
};

const mountAdminPageRoute = function (router: any, route: string, middlewares: Array<Function>, controller: Function) {
	const defaults: Array<Function> = [applyCSRFMiddleware];
	middlewares = [...defaults].concat([...middlewares]);

	if (typeof controller != 'function') {
		throw new Error(`'controller' must be a function, found ${typeof controller} instead`);
	}

	router.get(route, middlewares, tryRoute(controller, pageRouteErrorHandler));
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

function pageRouteErrorHandler (err: Error, req: Request, res: Response) {
	const error = createErrorObj(err);
	const data = {
		title: 'Error',
		path: req.originalUrl
	};

	res.locals.error = true;
	res.render('error', _.merge({error}, data));
}

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