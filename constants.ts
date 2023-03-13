import path from "path";

export const paths = {
    baseDir: __dirname,
    uploadsDir: path.join(__dirname, 'public', 'uploads'),
    uploadsDirString: ['uploads'].join('/'),
    templatesDir: path.join(__dirname, 'src', 'views'),
    templatePartialsDir: path.join(__dirname, 'src', 'views', 'partials'),
};

export const siteName = 'Node Blogger';