import { Nango } from '@nangohq/node-client';
// import { syncGithubStargazers, syncGithubUserRepos } from '../examples-list/github.js';
import { syncGithubUserRepos } from '../examples-list/github.js';
import { syncHubspotContactsWithAuth } from '../examples-list/hubspot+oauth.js';
import { syncPokemonList } from '../examples-list/pokemon.js';
import { syncRedditSubredditPosts } from '../examples-list/reddit.js';
import { syncSlackMessages } from '../examples-list/slack.js';
import { syncTypeformResponses } from '../examples-list/typeform.js';
import { syncGmailEmails } from '../examples-list/gmail+oauth.js';
// import { syncGoogleCalendarEvents } from '../examples-list/gcal+oauth.js;
import * as dotenv from 'dotenv';
import { db, Sync } from '@nangohq/core';
import ms from 'ms';

dotenv.config({ path: './.env.dev' });

class Tests {
    nangoHost: string;

    constructor(docker = false) {
        this.nangoHost = docker ? 'http://nango-server:3003' : 'http://localhost:3003';
    }

    async testAll() {
        let startTs = new Date().getTime();

        await this.setupOAuthCreds();

        // await test(await syncGithubStargazers(process.env['NANGO_TEST_GH_OWNER']!, process.env['NANGO_TEST_GH_REPO']!));
        await this.test(await syncGithubUserRepos(process.env['NANGO_TEST_GH_USERNAME']!, process.env['NANGO_TEST_GH_API_TOKEN']!));
        await this.test(await syncHubspotContactsWithAuth(process.env['NANGO_TEST_HUBSPOT_PROVIDER']!, process.env['NANGO_TEST_HUBSPOT_CONNECTION']!));
        await this.test(await syncPokemonList(), 20000);
        await this.test(await syncRedditSubredditPosts(process.env['NANGO_TEST_REDDIT_SUBREDDIT']!));
        await this.test(await syncSlackMessages(process.env['NANGO_TEST_SLACK_TOKEN']!, process.env['NANGO_TEST_SLACK_CHANNEL']!));
        await this.test(await syncTypeformResponses(process.env['NANGO_TEST_TYPEFORM_ID']!, process.env['NANGO_TEST_TYPEFORM_APP_TOKEN']!));
        await this.test(
            await syncGmailEmails(
                process.env['NANGO_TEST_GMAIL_EMAIL']!,
                process.env['NANGO_TEST_GMAIL_PROVIDER']!,
                process.env['NANGO_TEST_GMAIL_CONNECTION']!
            )
        );
        // await cancel(await syncGoogleCalendarEvents(process.env['NANGO_TEST_GCAL_ID']!, process.env['NANGO_TEST_GCAL_PROVIDER']!, process.env['NANGO_TEST_GCAL_CONNECTION']!));
        await this.test(await this.upsertSoftDelete());
        await this.test(await this.upsertHardDelete());
        await this.test(await this.overwriteHardDelete());
        await this.test(await this.overwriteSoftDelete());

        console.log(`\n\n\n-------------✅ All tests passed (run time: ${ms(new Date().getTime() - startTs)})-------------\n\n\n`);
    }

    upsertHardDelete() {
        return new Nango().sync(this.nangoHost + '/test', {
            friendly_name: 'Upsert Hard Delete',
            response_path: 'results',
            unique_key: 'unique_key',
            frequency: '1 minute',
            mapped_table: 'test',
            metadata: { metafield: 'metavalue' }
        });
    }

    upsertSoftDelete() {
        return new Nango().sync(this.nangoHost + '/test', {
            friendly_name: 'Upsert Soft Delete',
            response_path: 'results',
            unique_key: 'unique_key',
            frequency: '1 minute',
            mapped_table: 'test',
            metadata: { metafield: 'metavalue' },
            soft_delete: true
        });
    }

    overwriteHardDelete() {
        return new Nango().sync(this.nangoHost + '/test', {
            friendly_name: 'Overwrite Hard Delete',
            response_path: 'results',
            frequency: '1 minute',
            mapped_table: 'test',
            metadata: { metafield: 'metavalue' }
        });
    }

    overwriteSoftDelete() {
        return new Nango().sync(this.nangoHost + '/test', {
            friendly_name: 'Overwrite Soft Delete',
            response_path: 'results',
            frequency: '1 minute',
            mapped_table: 'test',
            metadata: { metafield: 'metavalue' },
            soft_delete: true
        });
    }

    async test(res: any, delay?: number) {
        delay = delay || 5000;
        let nango = new Nango();
        await new Promise((resolve) => setTimeout(resolve, delay));
        let syncId = res.data.sync_id;

        try {
            await this.checkResults(syncId, delay);
            await nango.cancel(syncId);
        } catch (err) {
            await nango.cancel(syncId);
            throw err;
        }
    }

    async checkResults(syncId: number, delay: number) {
        let sync: Sync = (await db.knex.withSchema('nango').select('*').from<Sync>(`_nango_syncs`).where({ id: syncId }))[0]!;
        let job = (await db.knex.withSchema('nango').select('*').from(`_nango_jobs`).where({ sync_id: syncId }).limit(1).orderBy('started_at', 'desc'))[0]!;

        if (job == null || new Date().getTime() - job.started_at > delay + 1000) {
            throw Error(`❌ Test failed: No recent job.`);
        }

        if (job.status !== 'succeeded') {
            throw Error(`❌ Test failed: Wrong job status: ${job.status}.`);
        }

        if (job.fetched_count === 0) {
            throw Error(`❌ Test failed: No fetched record.`);
        }

        if (job.added_count === 0) {
            throw Error(`❌ Test failed: No added record.`);
        }

        if (job.added_count !== job.fetched_count) {
            throw Error(`❌ Test failed: Different number of fetched and added records.`);
        }

        let mappedObjCount = (await db.knex(sync.mapped_table).select('_nango_id').where('_nango_sync_id', sync.id)).length;
        if (job.added_count !== mappedObjCount) {
            throw Error(`❌ Test failed: Number of mapped objects should equal added/fetched objects.`);
        }

        if (job.updated_count !== 0) {
            throw Error(`❌ Test failed: Records should not be updated.`);
        }

        if (job.deleted_count !== 0) {
            throw Error(`❌ Test failed: Records should not be deleted.`);
        }

        if (job.unchanged_count !== 0) {
            throw Error(`❌ Test failed: Records should not be unchanged.`);
        }

        console.log(`✅ Test passed: ${sync.friendly_name}`);
    }

    async setupOAuthCreds() {
        let allCredParams: { providerKey: string; refreshToken: string }[] = [
            { providerKey: process.env['NANGO_TEST_HUBSPOT_PROVIDER']!, refreshToken: process.env['NANGO_TEST_HUBSPOT_REFRESH_TOKEN']! },
            { providerKey: process.env['NANGO_TEST_GMAIL_PROVIDER']!, refreshToken: process.env['NANGO_TEST_GMAIL_REFRESH_TOKEN']! }
        ];

        let providerConfigs: { unique_key: string; provider: string; oauth_client_id: string; oauth_client_secret: string; oauth_scopes: string }[] = [
            {
                unique_key: process.env['NANGO_TEST_HUBSPOT_PROVIDER']!,
                provider: process.env['NANGO_TEST_HUBSPOT_PROVIDER']!,
                oauth_client_id: process.env['NANGO_TEST_HUBPOST_CLIENT']!,
                oauth_client_secret: process.env['NANGO_TEST_HUBPOST_SECRET']!,
                oauth_scopes: process.env['NANGO_TEST_HUBPOST_SCOPES']!
            },
            {
                unique_key: process.env['NANGO_TEST_GMAIL_PROVIDER']!,
                provider: process.env['NANGO_TEST_GMAIL_PROVIDER']!,
                oauth_client_id: process.env['NANGO_TEST_GMAIL_CLIENT']!,
                oauth_client_secret: process.env['NANGO_TEST_GMAIL_SECRET']!,
                oauth_scopes: process.env['NANGO_TEST_GMAIL_SCOPES']!
            }
        ];

        await db.knex(`nango._nango_connections`).del();
        await db.knex(`nango._nango_connections`).insert(allCredParams.map((o) => this.getOAuth2Creds(o)));

        await db.knex(`nango._nango_configs`).del();
        await db.knex(`nango._nango_configs`).insert(providerConfigs);
    }

    getOAuth2Creds(credParams: { providerKey: string; refreshToken: string }) {
        return {
            provider_config_key: credParams.providerKey,
            connection_id: '1',
            credentials: {
                type: 'OAUTH2',
                access_token: '',
                refresh_token: credParams.refreshToken,
                expires_at: '2020-12-22T10:00:22.884Z'
            }
        };
    }
}

let arg = process.argv.slice(2)[0];
new Tests(arg != null && arg === 'docker').testAll();
