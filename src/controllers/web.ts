import { Request, Response } from 'express';
import { WebManifest } from '@src/helpers';
import { meta } from '@src/meta';
import { IManifestData } from '@src/types';
import nconf from 'nconf';

const manifest = async function manifest(req: Request, res: Response) {
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
    manifest
} as const