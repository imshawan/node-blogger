import { IGoogleProviderConfig, MutableObject } from '@src/types';
import { OAuth as OAuthConst } from '@src/constants';
import nconf from 'nconf';
import locales from '@src/locales';

type Providers = keyof typeof authUrlResolvers;

export interface IOAuth {
    Providers: Providers
}

const authUrlResolvers = {
    async google(): Promise<string | undefined> {
        let {clientId, authUrl, redirectUrl} = providerConfigResolvers.google();
        let queryParams = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUrl,
			response_type: OAuthConst.Google.ResponseType,
			scope: OAuthConst.Google.Scopes,
		}).toString();

        return authUrl + '?' + queryParams;
    }
}

const providerConfigResolvers = {
    google() {
        const host = nconf.get('host') as string;
        const isDev = (nconf.get('env') as string) === 'development';
        const port = nconf.get('port') as number;
        const oAuthConfigs = (nconf.get('oauth2') || {}) as MutableObject;

        let callbackURL = (isDev ? `${host}:${port}` : host) + OAuthConst.Google.RedirectUrl;

        if (!oAuthConfigs['google']) {
            return {clientId: '', clientSecret: '', authUrl: '', redirectUrl: callbackURL};
        }

        return {...oAuthConfigs['google'], redirectUrl: callbackURL} as IGoogleProviderConfig;
    }
}

export const OAuth = {
    getProviderNames() {
        return Object.keys(providersMap);
    },
    getProviders() {
        return Object.values(providersMap).map(provider => ({...provider, label: locales.translate(provider.label)}));
    },
    getProviderConfig(provider: Providers) {
        return providerConfigResolvers[provider]();
    },
    async getAuthUrl(provider: Providers) {
        return await authUrlResolvers[provider]();
    },
};

const providersMap = {
    google: {
        label: 'common:signin_with_google',
        icon: '/images/google.svg',
        url: '/signin/google'
    }
}