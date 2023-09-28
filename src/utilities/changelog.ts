import { execSync } from "child_process";
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { Logger } from "./logger";
import pkg from '../../package.json';

interface ICommit {
    commit: string
    author: string
    email: string
    date: string
}


export class Changelog {
    categories: { new: ICommit[]; features: ICommit[]; bugFixes: ICommit[]; others: ICommit[]; };
    categoryNames: { new: string; features: string; bugFixes: string; others: string; };
    changelogFilePath: string;
    logger: Logger;
    constructor() {
        this.categories = {
            new: [] as ICommit[],
            features: [] as ICommit[],
            bugFixes: [] as ICommit[],
            others: [] as ICommit[],
        };
        this.categoryNames = {
            new: 'What\'s new',
            features: 'Features',
            bugFixes: 'Fixes',
            others: 'Miscellaneous'
        };
        this.changelogFilePath = path.resolve(__dirname, "../../CHANGELOG.md");
        this.logger = new Logger({prefix: path.basename(__filename)});
    }

    private getCommits(): Array<ICommit> {
        const parsedCommits: Array<ICommit> = [];

        const commits = execSync(`git log --format=commit:%s;author:%cn;email:%ce;date:%cs;`).toString("utf-8");
        const commitsArray = commits.split("\n").filter((message: string) => message && message !== "");

        commitsArray.forEach(commit => {
            const keyValuePairs = commit.split(';');
            const parsedData: ICommit = {
                commit: "",
                author: "",
                email: "",
                date: ""
            };

            for (const pair of keyValuePairs) {
                let [key, value] = pair.split(':');
                
                if (key && value) {
                    // @ts-ignore
                    parsedData[key.trim()] = value.trim();
                }
            }
            parsedCommits.push(parsedData);
        });

        return parsedCommits;
    }

    private categorise(commitArray: Array<ICommit>): { new: ICommit[]; features: ICommit[]; bugFixes: ICommit[]; others: ICommit[]; } {
        const categorised = this.categories;

        if (!Array.isArray(commitArray)) return categorised;
        if (!commitArray.length) return categorised;

        commitArray.forEach((commitObj: ICommit) => {
            if (Object.hasOwnProperty.bind(commitObj)('commit')) {
                let {commit} = commitObj;
                let category: keyof typeof categorised;

                if (/^([\d\.]+)$/.test(commit)) {
                    return;
                } else if (commit.includes("addition")) {
                    category = "new";
                } else if (/(updated)|(support)/i.test(commit)) {
                    category = "features";
                } else if (/fix/i.test(commit)) {
                    category = "bugFixes";
                } else {
                    category = "others";
                }

                categorised[category].push(commitObj);
            }
        });

        return categorised;
    }

    public getCategorized() {
        const commits = this.getCommits();
        return this.categorise(commits);
    }

    public get() {
        return this.getCommits();
    }

    public write() {
        const commits = this.getCommits();
        const categorised = this.categorise(commits);
        const categories = this.categories;
        const categorisedCommits: {
            new: string[];
            features: string[];
            bugFixes: string[];
            others: string[];
        } = {
            new: [],
            features: [],
            bugFixes: [],
            others: [],
        };

        const keys = Object.keys(categorised) as Array<keyof typeof categories>;
        const date = moment();
        var markdown = `# ${pkg.name} v${pkg.version} - (${date.format('MMMM')}, ${date.format('YYYY')})\n\n`;

        keys.forEach((key) => {
            if (Object.hasOwnProperty.bind(categorised)(key)) {
                const selected = categorised[key];
                categorisedCommits[key] = selected.map((item) => item.commit); 
            }
        });

        keys.forEach((key) => {
            markdown += '## ' + this.categoryNames[key] + '\n\n';
            markdown += categorisedCommits[key].map(elem => '- ' + elem ).join('\n');
            markdown += '\n\n';
        });

        this.logger.info(`Generating change-logs for ${pkg.name} v${pkg.version}`);
        fs.writeFileSync(this.changelogFilePath, markdown);
    }
}