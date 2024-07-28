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

/*
 * based on npm module connect-multiparty
 * @link https://www.npmjs.com/package/connect-multiparty
 */

import httperrors from 'http-errors';
import { Form } from 'multiparty';
import qs from 'qs';
import onFinished from 'on-finished';
import { Request, Response, NextFunction } from 'express';

export class MultipartyForm {
    options: any;
    form: Form;
    data: { [key: string]: any };
    done: boolean;
    files: {};
    constructor(options: any = {}) {
        this.options = options || {};
        this.form = new Form(options);
        this.data = {};
        this.files = {};
        this.done = false;

        this.isMultipartForm = this.isMultipartForm.bind(this);
        this.parse = this.parse.bind(this);
        this.ondata = this.ondata.bind(this);
    }

    private isMultipartForm(req: Request): boolean {
        const { headers } = req;
        const contentType = headers['content-type'];

        if (!contentType) return false;

        else if (!contentType.includes('multipart/form-data')) return false;

        else return true;
    }

    private ondata(name: string | number, val: any, data: { [x: string]: any; }) {
        if (Array.isArray(data[name])) {
            data[name].push(val);
        } else if (data[name]) {
            data[name] = [data[name], val];
        } else {
            data[name] = val;
        }
    }

    public parse(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        if (req._parsed) return next();

        if ('GET' === req.method || 'HEAD' === req.method) {
            return next();
        }

        if (!this.isMultipartForm(req)) {
            return next();
        }

        // flagging as parsed
        // @ts-ignore
        req._parsed = true;

        this.form.on("field", (name, val) => {
            this.ondata(name, val, this.data);
        });

        this.form.on('file', (name, val) => {
            val.name = val.originalFilename;
            val.type = val.headers['content-type'] || null;
            this.ondata(name, val, this.files);
        });

        this.form.on('error', (err) => {
            if (this.done) return;

            this.done = true;

            var error = httperrors(400, err)

            if (!req.readable) return next(error)

            req.resume();
            onFinished(req, function () {
                next(error)
            });

        });

        this.form.on('close', () => {
            if (this.done) return;

            this.done = true;

            // expand names with qs & assign
            req.body = qs.parse(this.data, { allowDots: true });
            // @ts-ignore
            req.files = qs.parse(this.files, { allowDots: true });

            next();
        });

        this.form.parse(req);
    }
}