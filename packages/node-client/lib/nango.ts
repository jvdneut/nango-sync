import axios from 'axios';

export enum NangoHttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export interface NangoSyncConfig {
    method?: NangoHttpMethod;
    headers?: Record<string, string | number | boolean>;
    body?: object;
    query_params?: Record<string, string | number | boolean>;
    unique_key?: string;
    response_path?: string;
    paging_cursor_request_path?: string;
    paging_cursor_metadata_response_path?: string;
    paging_cursor_object_response_path?: string;
    paging_url_path?: string;
    paging_header_link_rel?: string;
    paging_offset_request_path?: string;
    paging_limit_request_path?: string;
    paging_limit?: number;
    paging_number_request_path?: string;
    auto_mapping?: boolean;
    mapped_table?: string;
    frequency?: string;
    cron?: string;
    nango_connection_id?: string;
    nango_provider_config_key?: string;
    max_total?: number;
    friendly_name?: string;
    metadata?: Record<string, string | number | boolean>;
    soft_delete?: boolean;
}

export class Nango {
    serverUrl: string;

    constructor(serverUrl?: string) {
        this.serverUrl = serverUrl || 'http://localhost:3003';
    }

    async sync(url: string, config?: NangoSyncConfig) {
        config = config || {};

        let body = {
            url: url,
            method: config.method || NangoHttpMethod.GET,
            headers: config.headers,
            body: config.body,
            query_params: config.query_params,
            unique_key: config.unique_key,
            response_path: config.response_path,
            paging_cursor_request_path: config.paging_cursor_request_path,
            paging_cursor_metadata_response_path: config.paging_cursor_metadata_response_path,
            paging_cursor_object_response_path: config.paging_cursor_object_response_path,
            paging_url_path: config.paging_url_path,
            paging_header_link_rel: config.paging_header_link_rel,
            paging_offset_request_path: config.paging_offset_request_path,
            paging_limit_request_path: config.paging_limit_request_path,
            paging_number_request_path: config.paging_number_request_path,
            paging_limit: config.paging_limit,
            auto_mapping: config.auto_mapping,
            mapped_table: config.mapped_table,
            frequency: config.frequency,
            cron: config.cron,
            nango_connection_id: config.nango_connection_id,
            nango_provider_config_key: config.nango_provider_config_key,
            max_total: config.max_total,
            friendly_name: config.friendly_name,
            metadata: config.metadata,
            soft_delete: config.soft_delete
        };

        return await axios.post(`${this.serverUrl}/v1/syncs`, body, { headers: this.headers() }).catch((error: any) => {
            throw Error(error?.response?.data?.error || error.message);
        });
    }

    async pause(syncId: number) {
        return await axios.put(`${this.serverUrl}/v1/syncs`, { action: 'pause', sync_id: syncId }, { headers: this.headers() }).catch((error: any) => {
            throw Error(error?.response?.data?.error || error.message);
        });
    }

    async cancel(syncId: number) {
        return await axios.put(`${this.serverUrl}/v1/syncs`, { action: 'cancel', sync_id: syncId }, { headers: this.headers() }).catch((error: any) => {
            throw Error(error?.response?.data?.error || error.message);
        });
    }

    async resume(syncId: number) {
        return await axios.put(`${this.serverUrl}/v1/syncs`, { action: 'resume', sync_id: syncId }, { headers: this.headers() }).catch((error: any) => {
            throw Error(error?.response?.data?.error || error.message);
        });
    }

    async trigger(syncId: number) {
        return await axios.put(`${this.serverUrl}/v1/syncs`, { action: 'trigger', sync_id: syncId }, { headers: this.headers() }).catch((error: any) => {
            throw Error(error?.response?.data?.error || error.message);
        });
    }

    headers() {
        return { 'Content-Type': 'application/json' };
    }
}
