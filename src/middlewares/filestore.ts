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

import { Request } from 'express';
import multer, { StorageEngine } from "multer";
import { paths } from '@src/constants';
import fs  from 'fs';
import path from 'path';
import { MimeTypeResolver, slugify } from '@src/utilities';


interface IFileStore {
    destination?: string
}

export class FileStore {
    destination?: string;
    diskStorage: StorageEngine | undefined
    resolver: MimeTypeResolver;
    
    constructor(options?: IFileStore) {
        this.destination = options?.destination;
        this.diskStorage = undefined;
        this.resolver = new MimeTypeResolver();

        this.initialize = this.initialize.bind(this);
        this.setDestination = this.setDestination.bind(this);
        this.setFilename = this.setFilename.bind(this);
        this.fileFilter = this.fileFilter.bind(this);
        this.generateFilename = this.generateFilename.bind(this);
        this.stripFileExtension = this.stripFileExtension.bind(this);
    }

    public initialize(){
        if (!this.destination) {
            this.destination = paths.uploadsDir;
        }

        if (!fs.existsSync(this.destination)) {
            fs.mkdirSync(this.destination, {recursive: true});
        }

        this.diskStorage = multer.diskStorage({
            destination: this.setDestination,
            filename: this.setFilename,
        });

        return multer({ storage: this.diskStorage, fileFilter: this.fileFilter }).any();
    }

    private fileFilter(req: Request, file: any, cb: Function) {
        // TODO implement file filter
        
        cb(null, true)
    }

    private getFilesDirByMimeType(mimetype: string): string {
        var folder = 'others';
        var splitted = mimetype.split('/');

        if (splitted.length) {
            folder = splitted[0].toLowerCase().trim() + 's';
        }

        return folder;
    }

    private setDestination (req: Request, file: any, cb: Function) {
        var {mimetype} = file;
        var destination = this.destination || paths.uploadsDir;
        var folder = this.getFilesDirByMimeType(mimetype);

        destination = path.join(destination, folder);

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, {recursive: true});
        }

        cb(null, destination);
    }

    private setFilename (req: Request, file: any, cb: Function) { 
        const {mimetype, originalname} = file;
        const filename = this.generateFilename(originalname, mimetype)
        const folder = this.getFilesDirByMimeType(mimetype);
        
        file.url = ['/uploads', folder, filename].join('/');

        cb(null, filename);
    }

    private generateFilename(filename: string, mimetype: string) {
        const strippedFilename = this.stripFileExtension(filename);
        const fileExtension = this.resolver.getFileExtensionByMimeType(mimetype);

        return [slugify(strippedFilename), '-', Date.now(), fileExtension].join('');
    }

    private stripFileExtension(filename: string) {
        if (!filename.length) return filename;

        const lastDotIndex = filename.lastIndexOf('.');
  
        if (lastDotIndex === -1) {
            return filename;
        }
        
        return filename.substring(0, lastDotIndex);
    }
}