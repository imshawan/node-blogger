import { Request, Response } from 'express';
import { WebManifest } from '@src/helpers';
import { application } from '@src/application';
import { IManifestData } from '@src/types';
import nconf from 'nconf';
import { createGzip } from 'zlib';
import { SitemapStream, streamToPromise } from 'sitemap';
import locale from '@src/locales';

var sitemapCache: Buffer;

const robots = async function (req: Request, res: Response) {
    const userAgents: Array<string> = application.configurationStore?.robots?.userAgents || ['*'];
    const disallowed: Array<string> = application.configurationStore?.robots?.disallowed || ['/admin/'];
    const allowed: Array<string> = application.configurationStore?.robots?.allowed || ['/'];
    let robotsTxt = '';
    
    robotsTxt += userAgents.map(el => `User-agent: ${el}\n`).join('');
    robotsTxt += allowed.map(el => `Allow: ${el}\n`).join('');
    robotsTxt += disallowed.map(el => `Disallow: ${el}\n`).join('');

    robotsTxt += `\nSitemap: ${nconf.get('host')}/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
}

const sitemap = async function (req: Request, res: Response) {
    const urls = ['/', '/users', '/categories/', '/posts', '/about', '/contact',];
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    if (sitemapCache) {
        return res.status(200).send(sitemapCache);
    }

    try {
        const smStream = new SitemapStream({ hostname: nconf.get('host') });
        const pipeline = smStream.pipe(createGzip());

        urls.forEach((url, i) => smStream.write({ url,  changefreq: 'monthly', priority: Number((i + 1)/10) }))
    
        // cache the response
        streamToPromise(pipeline).then(map => sitemapCache = map).catch(e => {});
        smStream.end()

        // stream write the response
        pipeline.pipe(res).on('error', (e) => {throw new Error(e.message)});
      } catch (e) {
        console.error(e)
        res.status(500).end()
      }
}

const manifest = async function (req: Request, res: Response) {
    const manifestInfo: IManifestData = {
        name: application.configurationStore?.siteName,
        short_name: application.configurationStore?.siteShortName,
        theme_color: application.configurationStore?.manifest?.themeColor,
        background_color: application.configurationStore?.manifest?.backgroundColor,
        start_url: nconf.get('host')
    };
    const manifest = new WebManifest(manifestInfo).get();
    return res.status(200).json(manifest);
}

const serveTranslationNamespace = async function (req: Request, res: Response) {
    const zones = ['admin'];
    let {lang, namespace, zone} = req.params;

    if (zone && !zones.includes(zone)) {
        return res.status(400).json({});
    }
    if (zone) {
        namespace = zone + '.' + namespace;
    }

    const translation = locale.i18nextInstance.getResourceBundle(lang, namespace);
    if (!translation) {
        return res.status(404).json({});
    }

    res.status(200).json(translation);
}

export default {
    manifest, robots, sitemap, serveTranslationNamespace
} as const