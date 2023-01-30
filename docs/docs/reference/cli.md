# CLI

You can manage your Provider Configurations & Connections using the Nango CLI. 

Run `npx nango` to get a list of all CLI commands.

## Set up the Nango host

By default, The CLI uses the host/port `http://localhost:3003` to call the Nango server. You can customize this by setting the environment variable named `NANGO_HOSTPORT` in your CLI environment, using a `.bashrc` or `.zshrc` file.

## Manage Provider Configurations

### List

Run `npx nango config:list` to list all existing Provider Configurations.

### Get

Run `npx nango config:get <provider_config_key>` to get a specific Provider Configurations.

### Create

Run `npx nango config:create <provider_config_key> <provider> <oauth_client_id> <oauth_client_secret> <oauth_scopes>` to create a new Provider Configuration. If specifying multiple OAuth scopes in `<oauth_scopes>`, they should be separated by commas (e.g. `oauth,read`).

### Edit

Run `npx nango config:edit <provider_config_key> <provider> <oauth_client_id> <oauth_client_secret> <oauth_scopes>` to edit an existing Provider Configuration. If specifying multiple OAuth scopes in `<oauth_scopes>`, they should be separated by commas (e.g. `oauth,read`).

### Delete

Run `npx nango config:delete <provider_config_key>` to delete an existing Provider Configuration.

## Manage Connections

### Get

Run `npx nango connection:get <connection_id>` to get a Connection with credentials. 