import { Request, Response, NextFunction } from "express";
import { modules, baseScripts } from "@src/meta";
import {siteName, paths} from '../../constants';
import fs from 'fs';
import ejs from 'ejs';

export const overrideRender = (req: Request, res: Response, next: NextFunction) => {
    const render = res.render;

    // @ts-ignore
    res.render = async function renderOverride(template: string, options: any, callback: Function) {
        const self = this;
        const req = this.req;

        if (!template) return next();
        
        const pageOptions = options || {};
        const templatePath = [paths.templatesDir, '/', template, '.ejs'].join('');
        const headerPath = [paths.templatePartialsDir, '/', 'header.ejs'].join('');
        const footerPath = [paths.templatePartialsDir, '/', 'footer.ejs'].join('');
        const pageClass = generatePageClass(req, res);

        pageOptions.title = [pageOptions.title, ' | ', siteName].join('');
        pageOptions.pageClass = pageClass;
        pageOptions.modules = modules;

        pageOptions.scripts = [];
        pageOptions.baseScripts = baseScripts;
        pageOptions.pageScript = ['client/', template].join('');

        const [header, body, footer] = await Promise.all([
            renderTemplateTohtml(headerPath, pageOptions),
            renderTemplateTohtml(templatePath, pageOptions),
            renderTemplateTohtml(footerPath, pageOptions)
        ]);

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

function renderTemplateTohtml(templatePath: string, payload?: object): Promise<string> {
    if (!payload) {
        payload = {}
    }

    return new Promise((resolve, reject) => {
        fs.readFile(templatePath, 'utf8', function (err, rawTemplate) {
            if (err) {
                reject(err.message)
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
                var pagePayload = ${JSON.stringify(options).replace(/<\//g, '<\\/')}
            </script>`
}