import path from "path";

export const paths = {
    baseDir: __dirname,
    uploadsDir: path.join(__dirname, 'public', 'uploads'),
    uploadsDirString: ['uploads'].join('/'),
    templatesDir: path.join(__dirname, 'src', 'views'),
    adminTemplatesDir: path.join(__dirname, 'src', 'views', 'admin'),
    templatePartialsDir: path.join(__dirname, 'src', 'views', 'partials'),
    adminTemplatePartialsDir: path.join(__dirname, 'src', 'views', 'admin', 'partials'),
    assetsDir: path.join(__dirname, 'public'),
    javaScriptsDir: path.join(__dirname, 'public', 'scripts'),
};

export const siteName = 'Node Blogger';