---
sidebar_label: Quickstart
---

# Getting started with Nango

Setting up Nango takes 3 steps:
1. Start the server & enable the providers/APIs you need
2. Add the frontend SDK to trigger new OAuth flows
3. Use the backend SDK or REST API to retrieve fresh access tokens to make API calls

This setup will take about **15-20 minutes**, afterwards you are ready to support OAuth for 50+ APIs!

## Step 1: Start server & enable OAuth providers/APIs
The first step is to start the Nango server locally or deploy to a cloud provider.

For this guide we will stick to a local deployment:
```bash
git clone https://github.com/NangoHQ/nango.git && cd nango 
# If using Nango with OAuth, replace previous command by 'git clone https://github.com/NangoHQ/nango.git && cd nango'.
docker compose up
```

You should now see a message that the Nango server is running.

With the server running you can now use the Nango CLI tool to query which OAuth providers are setup:
```bash
npx nango config:list
```
If you just installed Nango this will print an empty list.

To run OAuth flows from your application you need to setup each provider that you want to use. For this you will need a few things from the OAuth provider/API:
- **Client id** and **client secret**, these identify your application towards the API that offers the OAuth. You need to get these from the API/OAuth provider, usually you will find them in their developer portal.
- The **scopes** you want to request from the user: These will also depend on the API, you can usually find a list of all scopes an API offers in the API documentation.
    - For the CLI commend below your scopes must be comma separated, e.g. `read,write`
- Finally you need to decide on a **provider config key**. This key will uniquely identify your configuration within Nango. If you only have one configuration per API provider we recommend you use the API's name in all lowercase, e.g. `github` for GitHub, `salesforce` for Salesforce etc.

:::info Callback URL
When you setup your application with the OAuth provider they will ask you for a callback URL.

For Nango the callback URL is always `[NANGO_SERVER_URL]/oauth/callback`, so if Nango runs on your local machine the callback URL is `http://localhost:3003/oauth/callback`
:::

With this information you are now ready to configure & enable your first OAuth provider. Here we setup a GitHub config as an example:
```bash
npx nango config:create github github <client-id> <client-secret> "<scopes>"
```
If you want to see the help for this command (and all others) run `npx nango help` and it will print the help for you.

Now run `npx nango config:list` again and you should see your freshly added config 🎉 (and run `npx nango` to see the list of all available CLI commands).

## Step 2: Trigger the OAuth flow from your frontend

For quick testing you can use a script tag in your HTML file and load the frontend library directly from NPM: 
```html
<script type="module">
    import Nango from 'https://unpkg.com/@nangohq/frontend/dist/index.js';

    //....
</script>
```

For single page apps where you bundle your Javascript/Typescript files you can directly use the `@nangohq/frontend` package:
```ts
import Nango from '@nangohq/frontend';
```

Once you created an instance of Nango (which tells the frontend where to find your Nango server) triggering a new OAuth flow is easy:
```ts
// Replace 'http://localhost:3003' with the host (and port) where your Nango server can be accessed
var nango = new Nango('http://localhost:3003');

// Trigger an OAuth flow
// The first parameter is the config key you set up in step 1
// The second parameter is the connection id under which this authentication should be stored
nango.auth('github', '<connection-id>')
.then((result) => { 
    console.log(`OAuth flow succeeded for provider "${result.providerConfigKey}" and connection-id "${result.connectionId}"!`);
})
.catch((error) => {
    console.error(`There was an error in the OAuth flow for integration "${error.providerConfigKey}" and connection-id "${error.connectionId}": ${error.error.type} - ${error.error.message}`);
});
```

This introduces the **connection id**:  
The connection id is the unique identifier for this authentication. You can choose it freely, the only requirements is that the pair of provider config key + connection id must be unique.

Most of the time it makes sense to use a user id, account id or similar identifier for the connection id (so the authentication is tied to the user, account etc.). But you could choose something different if it is needed for your application.

With the frontend part setup you should now be able to run a full OAuth flow for your configuration and get an access token. Go ahead & try it! 🙌


## Step 3: Accessing fresh access tokens from your backend

The last step is to get a fresh access token in your backend whenever you need to make an authenticated API request for the user.

Why fresh?  
Increasingly OAuth providers are providing access tokens with a limited lifetime of e.g. 30-60 minutes. After this time the token expires and needs to be exchanged for a fresh token. Nango handles this exchange transparently for you, but it is important you always request the access token just prior to your API call. Otherwise you may work with a stale token that has been revoked and your API call will fail.

Nango offers two ways to get a fresh access token:
- With a **backend SDK**: This is the easiest and preferred way if an SDK is available for your language. You can find examples of all existing SDKs below.
- With a **REST API**: This is the fallback option if no SDK is available for your language.

In both cases you need to tell Nango two things to get the access token:
- The **provider config key**, which identifies the OAuth provider configuration
- The **connection id**, which identifies the specific authentication for which you need the access token

:::caution
It is important that you always get the latest access token from Nango just before every API call. Many access tokens expire within a few minutes. Nango will refresh them for you but it can only do so if you call it before every API call.

If you cache access tokens in your code you might have API calls fail because the access token has expired.
:::

### Getting an access token - Node SDK {#node-sdk}
If you are using Node you can use our node SDK which is available at `@nangohq/node`.

Install it with
```bash
npm i -S @nangohq/node
```

Then in your code, setup a Nango instance and get an access token whenever you need one:
```ts
import { Nango } from '@nangohq/node'

// Tell Nango where to find your Nango server
let nango = new Nango('http://localhost:3003');

let accessToken = await nango.getToken('<config-key>', '<connection-id>');

// Sometimes you need access to the raw response from the server that was sent along with the access token (because it contains additional metadata you need)
// You can access the latest response with this method
let rawTokenResponse = await nango.getRawTokenResponse('<config-key>', '<connection-id>');
```

### Getting an access token - REST API {#rest-api}
If you are using a language where Nango does not yet have backend SDK you can directly use it's REST API to get an access token.

The api endpoint is located at `[NANGO_SERVER_URL]/connection/<connection-id>?provider_config_key=<config-key>`.  
Note that you must pass in a `Content-Type: application/json` header along with your request.

Here is an example curl command for Nango running on your local machine:
```bash
curl -XGET -H "Content-type: application/json" \
'http://localhost:3003/connection/<connection-id>?provider_config_key=<config-key>'
```

This API call will return you a JSON object that contains the refreshed access token as well as additional material (example):
```json
{
  "id": "<internal-nango-id-to-ignore>",
  "created_at": "2022-11-25T15:55:07.215Z",
  "updated_at": "2022-11-25T15:55:07.215Z",
  "provider_config_key": "<config-key>",
  "connection_id": "<connection-id>",
  "credentials": {
    "type": "OAUTH2",
    "access_token": "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", // <--- Use this access token for API requests
    "refresh_token": "gho_aalskdjfnlaisdhfliuhlaienflinsaldir", 
    "expires_at":"2022-12-22T15:52:30.453Z",
    "raw": {...}                                                
  },
  "connection_config": {...}
}
```

## Need help?

If you run into any trouble whilst setting up Nango we are happy to help you.

Please join our [Slack community](https://nango.dev/slack), where we are very active, and we will do our best to help you.

