import { readdirSync, lstatSync } from 'fs';
import path from 'path';
import i18next, { TOptions } from 'i18next';
import Backend from 'i18next-node-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { paths } from '@src/constants';
import NS from './namespaces';

i18next
	.use(i18nextMiddleware.LanguageDetector)
	.use(Backend)
	.init({
		initImmediate: false,
		fallbackLng: 'en',
		preload: readdirSync(paths.locales).filter((dirName) => {
			const langPath = path.join(paths.locales, dirName)
			return lstatSync(langPath).isDirectory()
		}),
		backend: {
			loadPath: (language: string, namespace: string) => {
				if (String(namespace).toLowerCase().startsWith('admin')) {
					// If the namespace starts with 'admin/', load from the admin folder
					return path.join(
						paths.locales,
						`${language}/admin/${namespace.replace('admin.', '')}.json`
					);
				} else {
					// Otherwise, load from the root folder
					return path.join(
						paths.locales,
						`${language}/${namespace}.json`
					);
				}
			},
		},
		nsSeparator: ':',
		ns: NS.namespaces,
		defaultNS: NS.defaultNS,
		// debug: true
	});

/**
 * @description Translates a given key.
 * @param {string} key - The translation key.
 * @returns {string} - The translated string.
 */
function translate(key: string, options: TOptions = {}): string {
	try {
		if (Object.keys(options).length) {
			return i18next.t(key, options);
		}
		return i18next.t(key);
	} catch (error) {
		return key; // Return the key itself in case of an error
	}
}

export default {
	i18nextInstance: i18next,
	translate
} as const
