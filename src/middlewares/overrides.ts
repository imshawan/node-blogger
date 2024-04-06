/*
 * Copyright (C) 2023 Shawan Mandal <hello@imshawan.dev>.
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

import { Request, Response, NextFunction } from "express";
import { baseScripts, vendorScripts, adminScripts } from "@src/application";
import {siteName, paths} from '@src/constants';
import fs from 'fs';
import ejs from 'ejs';
import { application, styleSheets, getConfigurationStoreByScope } from "@src/application";
import path from "path";
import { isAdministrator } from "@src/user";
import { version } from "@src/constants";

export const overrideRender = (req: Request, res: Response, next: NextFunction) => {
    const render = res.render;

    // @ts-ignore
    res.render = async function renderOverride(template: string, options: any, callback: Function) {
        const self = this;
        const req = this.req;
        const {isAdminRoute} = res.locals;
        const {user} = req;
        const partialsDir = paths[isAdminRoute ? 'adminTemplatePartialsDir' : 'templatePartialsDir'];
        let footer = '';

        if (!template) return next();
        
        const pageOptions = options || {};
        const templatePath = [paths[isAdminRoute ? 'adminTemplatesDir' : 'templatesDir'], '/', template, '.ejs'].join('');
        const headerPath = path.join(partialsDir, 'header.ejs');
        const footerPath = path.join(partialsDir, 'footer.ejs');
        const pageClass = generatePageClass(req, res);
        const csrfToken = req.user && req.csrfToken && req.csrfToken();

        pageOptions.navHeading = pageOptions.title;
        pageOptions.title = [pageOptions.title, ' | ', siteName].join('');
        pageOptions.user = user || {};
        
        pageOptions.pageClass = pageClass;
        pageOptions.modules = vendorScripts;

        pageOptions.scripts = [];
        pageOptions.baseScripts = isAdminRoute ? baseScripts.concat(adminScripts) : baseScripts;
        pageOptions.pageScript = ['client/', (isAdminRoute ? 'admin/' + template : template)].join('');
        pageOptions._application = await parseApplicationInformation(req);
        pageOptions._breadcrumb = res.locals.breadcrumb || [];
        pageOptions._csrf_token = csrfToken;
        pageOptions._isError = res.locals.error || false;
        pageOptions._config = getConfigurationStoreByScope(isAdminRoute ? 'admin' : 'client');
        pageOptions.hidePageHeader = pageOptions.hidePageHeader || false;
        res.locals.csrftoken = csrfToken;

        if (!pageOptions.sidebar) {
            pageOptions.sidebar = [];
        }
        if (!pageOptions.navigation) {
            pageOptions.navigation = [];
        }

        const [header, body] = await Promise.all([
            renderTemplateTohtml(headerPath, pageOptions),
            renderTemplateTohtml(templatePath, pageOptions),
        ]);

        if (!pageOptions._isError) {
            footer = await renderTemplateTohtml(footerPath, pageOptions);
        }

        const pageData = generatePageDataScript(pageOptions);

        // @ts-ignore
        const str = [header, pageData, body, footer].join('\n');

        if (typeof callback !== 'function') {            
            self.send(str);
        } else {
            callback(null, str);
        }
    };

    next();
};

export const overrideHeaders = async function (req: Request, res: Response, next: NextFunction) {
    const xPoweredBy = application.configurationStore?.xPoweredByHeaders || 'NodeBlogger';
    res.setHeader('X-Powered-By', xPoweredBy);
    next();
}

function renderTemplateTohtml(templatePath: string, payload?: object): Promise<string> {
    if (!payload) {
        payload = {}
    }

    return new Promise((resolve, reject) => {
        fs.readFile(templatePath, 'utf8', function (err, rawTemplate) {
            if (err) {                     
                if (err.code == 'ENOENT') {
                    return resolve('');
                } else {
                    return reject(err.message);
                }
            }
    
            const ejs_string = rawTemplate,
            template = ejs.render(ejs_string, payload,
                {
                  root: paths.templatesDir,
                });
            
            resolve(template);
        });
    })
}


function generatePageClass (req: Request, res: Response): string {
	const pageClasses: Array<string> = [];
    const basePathUrl: Array<string> = req.url ? req.url.split('/') : [];

    pageClasses.push(`page-status-${res.statusCode}`);

	if (basePathUrl.length) {
		basePathUrl.forEach((e, i) => {
			let paramsToString = basePathUrl.slice(0, i + 1).join('-');
			let classes = 'page' + (paramsToString.length > 1 ? paramsToString : '');
			pageClasses.push(classes);
		});
	}
    
	return [...new Set(pageClasses)].join(' ');
}

function generatePageDataScript(options: object): string {
    if (!Object.keys(options)) {
        options = {};
    }

    return `<script id="page-data">
                const Application = ${JSON.stringify(options).replace(/<\//g, '<\\/')}
            </script>`
}

async function parseApplicationInformation(req: Request) {
    const {user} = req;

    // @ts-ignore
    const administrator = user && user.userid && await isAdministrator(user);

    const obj = {
        authenticated: req.isAuthenticated(),
        isAdministrator: administrator,
        version,
    };

    return obj;
}