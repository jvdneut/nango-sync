export interface Sync {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
    url: string;
    method: string;
    headers?: Record<string, string | number | boolean>;
    body?: object;
    query_params?: Record<string, string>;
    unique_key: string;
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
    auto_mapping: boolean;
    mapped_table?: string;
    frequency?: number;
    cron?: number;
    nango_connection_id?: string;
    nango_provider_config_key?: string;
    max_total?: number;
    metadata?: Record<string, string | number | boolean>;
    friendly_name?: string;
    status: SyncStatus;
    soft_delete: boolean;
}

// Unfortunately, the following enum is duplicated with workflows.ts.
// But Temporal discourages importing modules in workflows (in this case 'core') to ensure determinism.
export enum SyncStatus {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    STOPPED = 'STOPPED'
}
