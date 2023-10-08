import { Request, Response } from 'express';
import { WebManifest } from '@src/helpers';
import { meta } from '@src/meta';
import { IManifestData } from '@src/types';
import nconf from 'nconf';

const robots = async function (req: Request, res: Response) {
    const userAgents: Array<string> = meta.configurationStore?.robots?.userAgents || ['*'];
    const disallowed: Array<string> = meta.configurationStore?.robots?.disallowed || ['/admin/'];
    const allowed: Array<string> = meta.configurationStore?.robots?.allowed || ['/'];
    let robotsTxt = '';
    
    robotsTxt += userAgents.map(el => `User-agent: ${el}\n`).join('');
    robotsTxt += allowed.map(el => `Allow: ${el}\n`).join('');
    robotsTxt += disallowed.map(el => `Disallow: ${el}\n`).join('');

    robotsTxt += `\nSitemap: ${nconf.get('host')}/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
}

const sitemap = async function (req: Request, res: Response) {}

const manifest = async function (req: Request, res: Response) {
    const manifestInfo: IManifestData = {
        name: meta.configurationStore?.siteName,
        short_name: meta.configurationStore?.siteShortName,
        theme_color: meta.configurationStore?.manifest?.themeColor,
        background_color: meta.configurationStore?.manifest?.backgroundColor,
        start_url: nconf.get('host')
    };
    const manifest = new WebManifest(manifestInfo).get();
    return res.status(200).json(manifest);
}

export default {
    manifest, robots, sitemap
} as const