import fs from 'fs';
import path from 'path';
import uglify from 'uglify-js';
import {paths} from '@src/constants';
import { Logger } from '@src/utilities';

const logger = new Logger({prefix: 'build'});

export async function minifyJavaScripts(): Promise<void> {
    const filesToMinify = prepareFilesArray(paths.javaScriptsDir);
    const uglifyOptions = {
      warnings: true,
      output: {
        beautify: false,
      },
    };
    
    filesToMinify.forEach((elem: string) => {
        const filepath = path.join(paths.javaScriptsDir, elem)
        const file = fs.readFileSync(filepath, "utf-8");
        const {error, code, warnings} = uglify.minify(file, uglifyOptions);

        const output = path.join(paths.buildDir, 'public', 'scripts', elem);
        const outputDir = path.dirname(output);
        const outputFilename = path.basename(output);

        if (error) {
            logger.error(`[${outputFilename}] ${error.message}`);
            process.exit(1);
        }

        if (warnings && warnings.length) {
            warnings.forEach(warning => logger.warn(`[${outputFilename}] ${warning}`));
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        fs.writeFileSync(output, code);
    });
}


function prepareFilesArray(directory: string): Array<string> {
    const files: Array<string> = [];
    listFilesAndFolders(directory);

    function listFilesAndFolders(directoryPath: string, basePath='') {
        const items = fs.readdirSync(directoryPath);

        items.forEach(item => {
            const itemPath = path.join(directoryPath, item);
            const stats = fs.statSync(itemPath);
        
            const fullPath = path.join(basePath, item);
        
            if (stats.isDirectory()) {
                listFilesAndFolders(itemPath, fullPath); // Recursive call for subfolders
            } else if (stats.isFile()) {
                files.push(fullPath);
            }
        });
    }

    return files;
}