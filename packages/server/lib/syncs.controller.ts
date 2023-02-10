import type express from 'express';
import { Sync, SyncStatus } from '@nangohq/core';
import { syncsService } from '@nangohq/core';
import syncClient from './syncs.client.js';

class SyncsController {
    async createSync(req: express.Request, res: express.Response) {
        let syncParams: Sync = {
            url: req.body['url'],
            method: req.body['method']?.toLowerCase() || 'get',
            headers: req.body['headers'],
            body: req.body['body'],
            query_params: req.body['query_params'],
            unique_key: req.body['unique_key'],
            response_path: req.body['response_path'],
            paging_cursor_request_path: req.body['paging_cursor_request_path'],
            paging_cursor_metadata_response_path: req.body['paging_cursor_metadata_response_path'],
            paging_cursor_object_response_path: req.body['paging_cursor_object_response_path'],
            paging_url_path: req.body['paging_url_path'],
            paging_header_link_rel: req.body['paging_header_link_rel'],
            paging_offset_request_path: req.body['paging_offset_request_path'],
            paging_limit_request_path: req.body['paging_limit_request_path'],
            paging_limit: req.body['paging_limit'],
            paging_number_request_path: req.body['paging_number_request_path'],
            auto_mapping: req.body['auto_mapping'] || true, // Default to auto mapping enabled.
            mapped_table: req.body['mapped_table'],
            frequency: req.body['frequency'],
            cron: req.body['cron'],
            nango_connection_id: req.body['nango_connection_id'],
            nango_provider_config_key: req.body['nango_provider_config_key'],
            max_total: req.body['max_total'],
            friendly_name: req.body['friendly_name'],
            metadata: req.body['metadata'],
            status: SyncStatus.RUNNING,
            soft_delete: req.body['soft_delete'] || false // Default to hard delete.
        };

        let result = await syncsService.createSync(syncParams);

        if (Array.isArray(result) && result.length === 1 && result[0] != null && 'id' in result[0]) {
            let syncId = result[0]['id'];
            syncParams.id = syncId;
            syncClient.run(syncParams);

            let message = `\n\n✅ Sync ${syncId} created!\n\nSync jobs will execute at the frequency you specified (default: hourly).\n\nVerify that your Sync works (or debug it) by:\n    1. going to your DB (default GUI: http://localhost:8080/?pgsql=nango-db&username=nango&db=nango&ns=nango with password 'nango')\n        - the synced data should be in the destination table you specified in the Sync config (default: '_nango_sync_[SYNC_ID]')\n        - the latest Sync job should have status=succeeeded in the table '_nango_jobs'\n    2. checking the logs with command 'docker-compose logs --follow'\n\n`;

            res.status(200).send({ sync_id: syncId, message: message });
        } else {
            res.status(500).send({
                error: `There was an unknown error creating your sync.`
            });
        }
    }

    async editSync(req: express.Request, res: express.Response) {
        let syncId = req.body['sync_id'];

        if (syncId == null) {
            res.status(404).send({ error: `Missing 'sync_id' parameter.` });
            return;
        }

        let sync = await syncsService.readById(syncId);

        if (sync == null) {
            res.status(404).send({ error: `Unknown Sync with ID ${syncId}.` });
            return;
        }

        let action = req.body['action'];

        try {
            switch (action) {
                case 'pause':
                    await syncClient.pause(sync);
                    break;
                case 'cancel':
                    await syncClient.cancel(sync);
                    break;
                case 'resume':
                    await syncClient.resume(sync);
                    break;
                case 'trigger':
                    await syncClient.trigger(sync);
                    break;
                default:
                    res.status(404).send({ error: `Unknown action param: ${action} (shoud be 'pause', 'cancel', 'resume' or 'trigger').` });
                    return;
            }

            res.status(200).send({ message: `Successfully performed action '${action}' on Sync ${syncId}` });
        } catch (error: any) {
            res.status(404).send({ error: `Sync ${action} error: ${error.message}` });
        }
    }
}

export default new SyncsController();
