import { execSync } from "child_process";
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { Logger } from "./logger";
import pkg from '../../package.json';
import { MutableObject, IPagination } from "@src/types";
import _ from 'lodash';
import { log } from "console";

interface ICommit {
    commit: string
    author: string
    email: string
    date: string
}
interface IPaginatedCommits {
    totalItems: number;
    totalPages: number;
    commits: Array<ICommit>;
}
type IPaginatedCategorisedCommits = Omit<IPaginatedCommits, 'commits'> & {
    commits: { [key: string]: ICommit[] }
}


export class Changelog {
    private readonly categories: { new: ICommit[]; features: ICommit[]; bugFixes: ICommit[]; others: ICommit[]; };
    private readonly categoryNames: { new: string; features: string; bugFixes: string; others: string; };
    private readonly changelogFilePath: string;
    private readonly logger: Logger;
    private readonly perPage: number;
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
        this.perPage = 15;
    }

    private getTotalCommits(): number {
        const commitCount = execSync('git rev-list --count HEAD').toString("utf-8");
        if (commitCount && !_.isNaN(commitCount)) {
            return Number(commitCount);
        }
        
        return 0;
    }

    private getCommits(pageNumber?: number, perPage?: number): Array<ICommit> {
        const parsedCommits: Array<ICommit> = [];
        let command = `git log --format=commit:-%s;author:-%cn;email:-%ce;date:-%cs;`;

        if (pageNumber) {
            if (typeof pageNumber !== 'number') {
                throw new TypeError('pageNumber must be a number, found ' + typeof pageNumber);
            }
            if (perPage && typeof perPage  !== 'number') {
                throw new TypeError('perPage must be a number, found ' + typeof perPage);
            } else if (!perPage) {
                perPage = this.perPage;
            }

            const skip = Number(pageNumber) * Number(perPage);
            const limit = perPage;
            log(skip, limit)

            command = `git log --skip=${skip} -n ${limit} --format=commit:-%s;author:-%cn;email:-%ce;date:-%cs;`;
        }

        const commits = execSync(command).toString("utf-8");
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
                let [key, value] = pair.split(':-');
                
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
                } else if (/(#new)|(add)|(addition)/i.test(commit)) {
                    category = "new";
                    commitObj.commit = commit.replace('#new:', '').trim();
                } else if (/(#update)|(support)/i.test(commit)) {
                    category = "features";
                    commitObj.commit = commit.replace('#update:', '').trim();
                } else if (/#fix/i.test(commit)) {
                    category = "bugFixes";
                    commitObj.commit = commit.replace('#fix"', '').trim();
                } else {
                    category = "others";
                }

                categorised[category].push(commitObj);
            }
        });

        return categorised;
    }

    private groupCommitsByMonth(commits: Array<ICommit>) {
        const grouped: MutableObject = {};
    
        for (const commit of commits) {
            const date = moment(commit.date);
            const monthYearKey = `${date.format('MMMM')}-${date.format('YYYY')}`;
    
            if (!grouped[monthYearKey]) {
                grouped[monthYearKey] = [];
            }
    
            grouped[monthYearKey].push(commit);
        }
    
        return grouped;
    }

    public getCategorized() {
        const commits = this.getCommits();
        return this.categorise(commits);
    }

    public getCategorizedAndPaginated(pageNumber: number, perPage: number): IPaginatedCategorisedCommits {
        const commits = this.getCommits(pageNumber, perPage);
        const totalItems = this.getTotalCommits()
        const totalPages = Math.ceil(totalItems / perPage);

        const categorisedData = this.categorise(commits);
        return {totalItems, totalPages, commits: categorisedData};
    }

    public get() {
        return this.getCommits();
    }

    public getPaginated(pageNumber: number, perPage: number): IPaginatedCommits {
        const totalItems = this.getTotalCommits()
        const totalPages = Math.ceil(totalItems / perPage);

        const commits = this.getCommits(pageNumber, perPage);
        return {totalItems, totalPages, commits};
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
                const groupedCommits = this.groupCommitsByMonth(selected);

                markdown += '## ' + this.categoryNames[key] + '\n';

                for (const monthYearKey in groupedCommits) {
                    const commitMessagesForMonth = groupedCommits[monthYearKey];
                    const [month, year] = monthYearKey.split('-');
                    
                    markdown += `\n### ${month}, ${year}:\n`;
                    for (const commitMessage of commitMessagesForMonth) {
                        markdown += `- ${commitMessage.commit}\n`;
                    }
                }

                markdown += '\n\n';
            }
        });

        this.logger.info(`Generating change-logs for ${pkg.name} v${pkg.version}`);
        fs.writeFileSync(this.changelogFilePath, markdown);
    }
}