/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
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

/**
 * @date 07-10-2023
 * @author imshawan <github@imshawan.dev>
 * @description Web app manifests
 * 
 * Interfaces for various elements of a manifest file that provides information about a web application.
 */

/**
 * @interface Icon
 * @description Object representing image files that can serve as application icons for different contexts.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/icons}
 */
export interface Icon {
    /**
     * The path to the image file. If src is a relative URL, the base URL will be the URL of the manifest.
     */
    src: string;

    /**
     * A string containing space-separated image dimensions using the same syntax as the sizes attribute.
     */
    sizes: string;

    /**
     * A hint as to the media type of the image.
     */
    type: string;

    density: number;
    /**
     * Defines the purpose of the image
     */
    purpose?: Purpose
}

export interface IManifestData {
    /**
     * Represents the name of the web application as it is usually displayed to the user.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/name}
     */
    name?: string;

    /**
     * Represents the name of the web application displayed to the user if there is not enough space to display
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name}
     */
    short_name?: string;

    /**
     * Represents the start URL of the web application
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url}
     */
    start_url?: string;

    /**
     * Determines the developers' preferred display mode for the website.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/display}
     */
    display?: Display;

    /**
     * Defines the default orientation for all the website's top-level browsing contexts.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation}
     */
    orientation?: Orientation;

    /**
     * Defines the default theme color for the application. 
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color}
     */
    theme_color?: string;

    /**
     * Placeholder background color for the application page to display before its stylesheet is loaded.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color}
     */
    background_color?: string;

    /**
     * Array of objects representing image files that can serve as application icons for different contexts.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/icons}
     */
    icons?: Array<Icon>

    /**
     * Objects specifying native applications that are installable by, or accessible to, the underlying platform
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/related_applications}
     */
    related_applications?: Array<IRelatedApplication>
}

/**
 * @interface IRelatedApplication
 * @description An object specifying native application(s) that are installable by, or accessible to, the underlying platform — 
 * for example, a native Android application obtainable through the Google Play Store. 
 */
export interface IRelatedApplication {
    /**
     * The platform on which the application can be found.
     * @see {@link https://github.com/w3c/manifest/wiki/Platforms}
     */
    platform: Platform

    /**
     * The URL at which the application can be found.
     */
    url: string

    /**
     * The ID used to represent the application on the specified platform.
     */
    id: string
}

/**
 * @type Orientation
 * Defines the default orientation for all the website's top-level browsing contexts.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/name}
 */
export type Orientation = "any" | "natural" | "landscape" | "landscape-primary" | "landscape-secondary" | "portrait" | "portrait-primary" | "portrait-secondary";

/**
 * @type Purpose
 * Defines the purpose of the image, for example if the image is intended to serve some special purpose in the context of the host OS (i.e., for better integration).
 * @see {@link https://w3c.github.io/manifest/#purpose-member}
 * 
 * @monochrome: A user agent can present this icon where a monochrome icon with a solid fill is needed. The color information in the icon is discarded and only the alpha data is used. The icon can then be used by the user agent like a mask over any solid fill.
 * 
 * @maskable: The image is designed with icon masks and safe zone in mind, such that any part of the image outside the safe zone can safely be ignored and masked away by the user agent.
 * 
 * @any: The user agent is free to display the icon in any context (this is the default value).
 */
export type Purpose = "any" | "monochrome" | "maskable";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Manifest/display}
 */
export type Display = "fullscreen" | "standalone" | "minimal-ui" | "browser";

/**
 * @see {@link https://github.com/w3c/manifest/wiki/Platforms}
 */
export type Platform = "chrome_web_store" | "play" | "chromeos_play" | "webapp" | "windows" | "f-droid" | "amazon";