import { Sync, isValidHttpUrl } from '@nangohq/core';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import _ from 'lodash';
import type { RawObject } from '../models/raw_object.model.js';
import { logger } from '@nangohq/core';
import parseLinksHeader from 'parse-link-header';
import oauthManager from '../oauth.manager.js';
import dataService from './data.service.js';
import md5 from 'md5';

class ExternalService {
    async getRawObjects(sync: Sync): Promise<any[]> {
        if (sync.id == null) {
            return [];
        }

        var results: any[] = [];
        let done = false;
        let pageCursor = null;
        let offset = 0;
        let maxNumberOfRecords = sync.max_total || 10000;
        sync.body = sync.body || {};

        var page = 0;
        while (!done) {
            page++; // Increment page count.

            // Check if Sync payload contains token variable, if so insert it.
            let syncWithAuth = await oauthManager.insertOAuthTokenIfNeeded(sync);

            let config: AxiosRequestConfig = { headers: syncWithAuth.headers || {}, params: syncWithAuth.query_params || {} };
            var res: AxiosResponse<any, any> | void;
            let errorBlock = (error: any) => {
                let errDesc = error?.response?.data != null ? JSON.stringify(error?.response?.data) : error.message;
                throw Error(`External API error (URL: ${sync.url} - Sync ID: ${sync.id}): ${errDesc}`);
            };

            //  Fetching subsequent page with cursor.
            if (pageCursor != null && sync.paging_cursor_request_path != null) {
                if (['get', 'delete'].includes(sync.method)) {
                    config.params[sync.paging_cursor_request_path] = pageCursor; // Cursor in query params.
                } else if (['post', 'put', 'patch'].includes(sync.method)) {
                    sync.body[sync.paging_cursor_request_path] = pageCursor; // Cursor in body params.
                }
            }

            //  Fetching subsequent page with offset + limit.
            if (sync.paging_offset_request_path != null && sync.paging_limit_request_path != null && sync.paging_limit != null) {
                if (['get', 'delete'].includes(sync.method)) {
                    config.params[sync.paging_offset_request_path] = offset;
                    config.params[sync.paging_limit_request_path] = sync.paging_limit;
                } else if (['post', 'put', 'patch'].includes(sync.method)) {
                    sync.body[sync.paging_offset_request_path] = offset;
                    sync.body[sync.paging_limit_request_path] = sync.paging_limit;
                }
            }

            //  Fetching subsequent page (param in URL)
            if (sync.paging_number_request_path != null) {
                if (['get', 'delete'].includes(sync.method)) {
                    // TODO add first page number? (0 or 1)
                    config.params[sync.paging_number_request_path] = page;
                } else if (['post', 'put', 'patch'].includes(sync.method)) {
                    sync.body[sync.paging_number_request_path] = page;
                }
            }

            logger.debug(
                `(Sync ID: ${sync.id}) Fetching page ${page} with url ${syncWithAuth.url} (method: ${JSON.stringify(sync.method)}). Header: ${JSON.stringify(
                    config.headers
                )} Body: ${JSON.stringify(syncWithAuth.body)} Query Params: ${JSON.stringify(config.params)}`
            );

            switch (sync.method) {
                case 'get': {
                    res = await axios.get(syncWithAuth.url, config).catch(errorBlock);
                    break;
                }
                case 'post': {
                    res = await axios.post(syncWithAuth.url, syncWithAuth.body, config).catch(errorBlock);
                    break;
                }
                case 'put': {
                    res = await axios.put(syncWithAuth.url, syncWithAuth.body, config).catch(errorBlock);
                    break;
                }
                case 'patch': {
                    res = await axios.patch(syncWithAuth.url, syncWithAuth.body, config).catch(errorBlock);
                    break;
                }
                case 'delete': {
                    res = await axios.delete(syncWithAuth.url, config).catch(errorBlock);
                    break;
                }
                default: {
                    throw new Error('Unknown HTTP method.');
                }
            }

            if (res == null) {
                throw new Error('Empty response from external API.');
            }

            logger.debug(`External API response (Sync ${sync.id}): ${JSON.stringify(res.data)}`);

            let newResults = sync.response_path != null ? _.get(res.data, sync.response_path) : res.data;
            results = results.concat(newResults);

            // Cursor-based pagination (with cursor field in the metadata of the response).
            if (
                sync.paging_cursor_metadata_response_path != null &&
                _.get(res.data, sync.paging_cursor_metadata_response_path) &&
                results.length < maxNumberOfRecords
            ) {
                pageCursor = _.get(res.data, sync.paging_cursor_metadata_response_path);
                continue;
            }

            // Cursor-based pagination (with cursor field in the last object of the response).
            if (
                sync.paging_cursor_object_response_path != null &&
                _.get(newResults[newResults.length - 1], sync.paging_cursor_object_response_path) &&
                results.length < maxNumberOfRecords
            ) {
                pageCursor = _.get(newResults[newResults.length - 1], sync.paging_cursor_object_response_path);
                continue;
            }

            // URL-based pagination (with URL field in the metadata of the response).
            if (sync.paging_url_path != null && isValidHttpUrl(_.get(res.data, sync.paging_url_path)) && results.length < maxNumberOfRecords) {
                sync.url = _.get(res.data, sync.paging_url_path);
                continue;
            }

            // URL-based pagination (with URL field in the Link header).
            if (sync.paging_header_link_rel != null && res.headers['link'] != null) {
                let linkHeader = parseLinksHeader(res.headers['link']);

                if (linkHeader != null && sync.paging_header_link_rel in linkHeader && isValidHttpUrl(linkHeader[sync.paging_header_link_rel]['url'])) {
                    let nextPageUrl = linkHeader[sync.paging_header_link_rel]['url'];
                    sync.url = nextPageUrl;
                    continue;
                }
            }

            // Offset + limit pagination
            if (sync.paging_offset_request_path != null && sync.paging_limit_request_path != null && sync.paging_limit != null) {
                if (newResults.length > 0) {
                    offset += newResults.length;
                    continue;
                } else {
                    // The last page was empty, so we should not count it.
                    page -= 1;
                }
            }

            if (sync.paging_number_request_path != null) {
                // TODO check for page_number_end?
                if (newResults.length > 0) {
                    continue;
                } else {
                    // The last page was empty, so we should not count it.
                    page -= 1;
                }
            }

            logger.debug(
                page == 1
                    ? `Single external API request performed (no or invalid pagination parameters provider) (Sync ID: ${sync.id}).`
                    : `Last page reached, no more external API requests (Sync ID: ${sync.id}).`
            );

            done = true;
        }

        if (results.length > maxNumberOfRecords) {
            results = results.slice(0, maxNumberOfRecords);
        }

        let rawObjs: RawObject[] = [];

        for (var rawObj of results) {
            if (rawObj == null) {
                continue;
            }

            rawObjs.push({
                sync_id: sync.id,
                data: rawObj,
                unique_key: sync.unique_key != null ? _.get(rawObj, sync.unique_key, dataService.defaultUniqueKey()) : dataService.defaultUniqueKey(),
                emitted_at: new Date(),
                metadata: sync.metadata || {},
                data_hash: md5(JSON.stringify(rawObj)),
                deleted_at: null
            });
        }

        return [rawObjs, page];
    }
}

export default new ExternalService();
