import { Nango } from '@nangohq/node-client';

// Test from the 'nango' folder root with command: npm run example syncGmailEmails [USER-EMAIL] [NANGO-PROVIDER-CONFIG-KEY] [NANGO-CONNECTION-ID]
// Endpoint docs: https://gmail.googleapis.com/gmail/v1/users/me@email.com/messages
export let syncGmailEmails = async (user: string, nangoProviderConfigKey: string, nangoConnectionId: string) => {
    let config = {
        friendly_name: 'Gmail Emails', // Give this Sync a name for prettier logs.
        mapped_table: 'gmail_emails', // Name of the destination SQL table
        headers: { authorization: 'Bearer ${nangoAccessToken}' }, // For auth, using Nango Oauth (cf. github.com/NangoHQ/nango).
        paging_cursor_request_path: 'pageToken', // For adding pagination data in requests.
        paging_cursor_metadata_response_path: 'nextPageToken', // For finding pagination data in responses.
        response_path: 'messages', // For finding records in the API response.
        max_total: 100, // For fetching limited records while testing.
        frequency: '1 minute', // How often sync jobs run in natural language.
        nango_connection_id: nangoConnectionId, // Pre-configured Nango connection ID (cf. github.com/NangoHQ/nango).
        nango_provider_config_key: nangoProviderConfigKey // Pre-configured Nango provider configuration (cf. github.com/NangoHQ/nango).
    };

    return new Nango().sync(`https://gmail.googleapis.com/gmail/v1/users/${user}/messages`, config);
};
