export * from './StatusCodesWithError';
export * from './StatusCodesWithMessage';
export * from './ImageExts';
export * from './Collections';
export * from './sorting';

import path from "path";

const baseDir = path.join(__dirname, '../../');

export const paths = {
    baseDir: baseDir,
    uploadsDir: path.join(baseDir, 'public', 'uploads'),
    uploadsDirString: ['uploads'].join('/'),
    buildDir: path.join(baseDir, 'dist'),
    templatesDir: path.join(baseDir, 'src', 'views'),
    templatePartialsDir: path.join(baseDir, 'src', 'views', 'partials'),
    adminTemplatesDir: path.join(baseDir, 'src', 'views', 'admin'),
    adminTemplatePartialsDir: path.join(baseDir, 'src', 'views', 'admin', 'partials'),
    assetsDir: path.join(baseDir, 'public'),
    javaScriptsDir: path.join(baseDir, 'public', 'scripts'),
};

export const siteName = 'Node Blogger';