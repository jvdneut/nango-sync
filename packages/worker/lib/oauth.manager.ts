import type { Sync } from '@nangohq/core';
import { logger } from '@nangohq/core';
import { Nango } from '@nangohq/node';
import { getServerBaseUrl } from '@nangohq/core';

class OAuthManager {
    nango: Nango | null;

    constructor() {
        this.nango = new Nango(getServerBaseUrl()); // The Nango server is embedded in the Nango server.
    }

    public async insertOAuthTokenIfNeeded(sync: Sync): Promise<Sync> {
        let syncCp = sync;

        if (syncCp.nango_connection_id == null || syncCp.nango_provider_config_key == null || this.nango == null) {
            return syncCp;
        }

        let accessToken = await this.nango.getToken(syncCp.nango_provider_config_key, syncCp.nango_connection_id).catch((err) => {
            // Invert params
            throw new Error(
                `Access token request to Nango failed: ${err?.response?.data?.error != null ? JSON.stringify(err.response.data.error) : JSON.stringify(err)}`
            );
        });

        logger.debug(`Authenticating request for Nango provider ${syncCp.nango_provider_config_key} and connection ${syncCp.nango_connection_id}.`);

        syncCp.url = this.interpolateString(syncCp.url, { nangoAccessToken: accessToken });

        if (syncCp.headers != null) {
            syncCp.headers = this.traverseAndInsertToken(syncCp.headers, accessToken) as Record<string, string | number | boolean>;
        }

        if (syncCp.body != null) {
            syncCp.body = this.traverseAndInsertToken(syncCp.body, accessToken);
        }

        if (syncCp.query_params != null) {
            syncCp.query_params = this.traverseAndInsertToken(syncCp.query_params, accessToken) as Record<string, string>;
        }

        return syncCp;
    }

    private traverseAndInsertToken(object: object, accessToken: string) {
        for (var key in object) {
            if (!object.hasOwnProperty(key)) continue;

            if (typeof object[key] === 'object' && object[key] !== null) {
                object[key] = this.traverseAndInsertToken(object[key], accessToken);
            } else if (object[key] != null && (typeof object[key] === 'string' || object[key] instanceof String)) {
                object[key] = this.interpolateString(object[key], { nangoAccessToken: accessToken });
            }
        }

        return object;
    }

    // A helper function to interpolate a string.
    // Example:
    // interpolateString('Hello ${name} of ${age} years", {name: 'Tester', age: 234})
    // Copied from https://stackoverflow.com/a/1408373/250880
    private interpolateString(str: string, replacers: Record<string, any>) {
        return str.replace(/\${([^{}]*)}/g, (a, b) => {
            var r = replacers[b];
            return typeof r === 'string' || typeof r === 'number' ? (r as string) : a; // Typecast needed to make TypeScript happy
        });
    }
}

export default new OAuthManager();
