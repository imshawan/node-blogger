/*
 * Copyright (C) 2023 Shawan Mandal <hello@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { IManifestData, Icon, IRelatedApplication, Display, Orientation, MutableObject } from '@src/types';
import { paths } from '@src/constants';
import { IconDensity, IconDensityWithSizes } from '@src/constants';
import _ from 'lodash';

type IManifestDataKeys = keyof IManifestData;
type ValueOf<T> = T[keyof T];
type IconInfo = {
    density: number;
    size: number;
}

export class WebManifest {
    private name?: string;
    private short_name?: string;
    private start_url?: string;
    private display: Display;
    private orientation?: Orientation;
    private theme_color?: string;
    private background_color?: string;
    private icons?: Array<Icon>;
    private related_applications?: Array<IRelatedApplication>;
    protected outputFileDir: string;
    protected assetsFolder: string;
    protected base: string;

    constructor(data: IManifestData = {}) {
        this.name = data.name || 'NodeBlogger';
        this.short_name = data.short_name || this.name;
        this.start_url = data.start_url || '';
        this.display = data.display || 'standalone';
        this.orientation = data.orientation || 'portrait';
        this.theme_color = data.theme_color || '#8e32e9';
        this.background_color = data.background_color || '#ffffff';
        this.icons = [];
        this.related_applications = data.related_applications || [];
        this.assetsFolder = 'touch'
        this.outputFileDir = path.join(paths.uploadsDir, this.assetsFolder);
        this.base = '/uploads/images/' + this.assetsFolder;
    }

    public get(): IManifestData | {} {
        const data: IManifestData | MutableObject = {};
        const keys: Array<IManifestDataKeys> = [
            "name",
            "short_name",
            "start_url",
            "display",
            "orientation",
            "theme_color",
            "background_color",
            "icons",
            "related_applications",
        ];

        keys.forEach(key => data[key] = this[key]);
        data.icons = this.getIcons();
        return data;
    }

    private getIconName(density: string, size: string): string {
        return `ic_launcher_${density}_${size}.png`
    }

    private getDensityWithSizes () {
        const iconsSizes: { [key: string]: IconInfo } = {};
        for (const density in IconDensity) {
            if (isNaN(Number(density))) {
                const densityValue = IconDensity[density];
                const sizeValue = IconDensityWithSizes[density];
                iconsSizes[density] = { density: Number(densityValue), size: Number(sizeValue) };
            }
        }
        return iconsSizes;
    }

    private getIcons() {
        const icons: Array<Icon> = [];
        const iconSizesWithDensityObj = this.getDensityWithSizes();
        const iconSizesWithDensity = Object.keys(iconSizesWithDensityObj);

        iconSizesWithDensity.forEach(density => {
            const iconInfo: IconInfo = iconSizesWithDensityObj[density]; 
            const size = [iconInfo.size, iconInfo.size].join('x');
            const outputFilePath = path.join(this.outputFileDir, this.getIconName(density, size));

            if (fs.existsSync(outputFilePath)) {
                let icon: Icon = {
                    density: iconInfo.density,
                    sizes: size,
                    src: `${this.base}/${path.basename(outputFilePath)}`,
                    type: 'image/png'
                }
                icons.push(icon);
            }
        });

        return icons;
    }

    private async generateIcons(iconPath: string): Promise<Icon[]> {
        // const iconSizes: ValueOf<typeof IconDensityWithSizes>[] = Object.values(IconDensityWithSizes).map(Number);
        const iconSizesWithDensityObj = this.getDensityWithSizes();
        const iconSizesWithDensity = Object.keys(iconSizesWithDensityObj);

        if (!fs.existsSync(this.outputFileDir)) {
            fs.mkdirSync(this.outputFileDir, {recursive: true})
        }

        const icons: Array<Icon> = await Promise.all(iconSizesWithDensity.map(async density => {
            const iconInfo: IconInfo = iconSizesWithDensityObj[density];
            const [width, height] = [iconInfo.size, iconInfo.size].map(Number);
            const sizes = [width, height].join('x');

            const outputFilePath = path.join(this.outputFileDir, this.getIconName(density, sizes));
            await sharp(iconPath).resize(width, height).toFile(outputFilePath);

            return {
                src: `${this.base}/${path.basename(outputFilePath)}`,
                sizes,
                type: 'image/png',
                density: iconInfo.density
            };
        }));

        return icons;
    }

    public async generate(iconPath: string): Promise<any> {
        if (!fs.existsSync(iconPath)) {
            console.error('Icon file not found.');
            return;
        }

        this.icons = await this.generateIcons(iconPath);

        return this.get();
    }
}