import { Nango } from '@nangohq/node-client';

// CLI command: npm start syncSlackMessages [app-token] [channel-id]
// Endpoint docs: https://api.slack.com/methods/conversations.history
export let syncSlackMessages = async (app_token: string, channel_id: string) => {
    let config = {
        response_path: 'messages',
        paging_response_path: 'response_metadata.next_cursor',
        paging_request_path: 'cursor',
        headers: {
            authorization: `Bearer ${app_token}`
        },
        query_params: {
            channel: channel_id,
            limit: 10
        }
    };

    return Nango.sync('https://slack.com/api/conversations.history', config);
};
