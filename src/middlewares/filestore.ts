import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine, Multer } from "multer";
import { paths } from '@src/constants';
import fs  from 'fs';
import path from 'path';
import { MimeTypeResolver } from '@src/utilities';


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

        return multer({ storage: this.diskStorage }).any();
    }

    private setDestination (req: Request, file: any, cb: Function) {
        console.log(file);
        var {mimetype} = file;
        var fileType = 'others', destination = this.destination || paths.uploadsDir;

        mimetype = mimetype.split('/');
        if (mimetype.length) {
            fileType = mimetype[0].toLowerCase().trim() + 's';
        }

        destination = path.join(destination, fileType);

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, {recursive: true});
        }

        cb(null, destination);
    }

    private setFilename (req: Request, file: any, cb: Function) { 
        const {mimetype, originalname} = file;
        const fileExtension = this.resolver.getFileExtensionByMimeType(mimetype);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = [originalname, '-', uniqueSuffix, fileExtension].join('');
        

        cb(null, filename);
    }
}