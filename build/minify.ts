import fs from 'fs';
import path from 'path';
import uglify from 'uglify-js';
import {paths} from '@src/constants';
import { Logger } from '@src/utilities';

const logger = new Logger({prefix: 'build'});

export async function minifyJavaScripts(displayWarn: boolean = false): Promise<void> {
    const filesToMinify = prepareFilesArray(paths.javaScriptsDir);
    let totalFiles = filesToMinify.length, current = 1;

    const uglifyOptions: uglify.MinifyOptions = {
        warnings: true,
        compress: {
            assignments: true,
            drop_console: true,
            drop_debugger: true,
            hoist_funs: true,
            hoist_vars: true,
            passes: 4,
            toplevel: true,
            dead_code: true,
        },
        mangle: {
            toplevel: true,
            reserved: ['$', 'exports', 'require']
        },
        output: {
            beautify: false,
            comments: false,
            braces: true,
            max_line_len: 120
        },
    };
    
    filesToMinify.forEach((elem: string) => {
        const filepath = path.join(paths.javaScriptsDir, elem)
        const file = fs.readFileSync(filepath, "utf-8");
        const {error, code, warnings} = uglify.minify(file, uglifyOptions);

        const output = path.join(paths.buildDir, 'public', 'scripts', elem);
        const outputDir = path.dirname(output);
        const outputFilename = path.basename(output);

        process.stdout.write(`Processing: ${current}/${totalFiles} modules\r`);

        if (error) {
            logger.error(`[${outputFilename}] ${error.message}`);
            process.exit(0);
        }

        if (warnings && warnings.length && displayWarn) {
            warnings.forEach(warning => logger.warn(`[${outputFilename}] ${warning}`));
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        fs.writeFileSync(output, code);
        current++;
    });

    logger.info(`Minified ${current-1}/${totalFiles} modules`);
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