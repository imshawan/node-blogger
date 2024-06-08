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

import { NextFunction, Response, Request } from "express";
import { StatusCodesWithError, StatusCodesWithMessage } from "@src/constants";
import { Options } from "express-rate-limit";

const handleApiResponse = function (code: number, response: Response, data?: any) {
	const {req} = response;
	const payload = {
		status: {},
		payload: {}
	};
	let message = String(StatusCodesWithMessage._200), error = null;

    if (code < 300) {
		payload.status = {
			success: true,
			error,
			route: req.originalUrl,
			message: 'Ok',
		};
		payload.payload = data || {};
        
    } else if (data instanceof Error) {
        message = data.message;
		// @ts-ignore 
		error = StatusCodesWithError[`_${code}`];

		payload.status = {
			success: false,
			error,
			route: req.originalUrl,
			message,
		};
	} else {
        // @ts-ignore 
		message = (data ? data.message : StatusCodesWithMessage[`_${code}`]) || null;
        // @ts-ignore 
		error = StatusCodesWithError[`_${code}`];

		payload.status = {
			success: false,
			error,
			route: req.originalUrl,
			message,
		};
		payload.payload = data || {};
	}
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('X-Powered-By', 'NodeBlogger');
	response.status(code).json(payload);
}

const handleRateLimiting = function(req: Request, res: Response, next: NextFunction, options: Options) {
	handleApiResponse(options.statusCode, res, options.message);
}
 
export {handleApiResponse, handleRateLimiting};