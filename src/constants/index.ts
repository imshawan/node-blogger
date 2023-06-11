export * from './StatusCodesWithError';
export * from './StatusCodesWithMessage';
export * from './ImageExts';
export * from './Collections';

import path from "path";

const baseDir = path.join(__dirname, '../../');

export const paths = {
    baseDir: baseDir,
    uploadsDir: path.join(baseDir, 'public', 'uploads'),
    uploadsDirString: ['uploads'].join('/'),
    templatesDir: path.join(baseDir, 'src', 'views'),
    templatePartialsDir: path.join(baseDir, 'src', 'views', 'partials'),
    adminTemplatesDir: path.join(__dirname, 'src', 'views', 'admin'),
    adminTemplatePartialsDir: path.join(__dirname, 'src', 'views', 'admin', 'partials'),
    assetsDir: path.join(baseDir, 'public'),
    javaScriptsDir: path.join(baseDir, 'public', 'scripts'),
};

export const siteName = 'Node Blogger';