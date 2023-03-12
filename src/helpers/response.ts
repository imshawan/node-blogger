import { Response } from "express";
import { StatusCodesWithError, StatusCodesWithMessage } from "@src/constants";

const handleApiResponse = function (code: number, response: Response, data: any) {
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
		error = StatusCodesWithError['_400'];

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
 
export {handleApiResponse};