# Advanced configuration

### CLI Host & Port

By default, the CLI uses the host/port `http://localhost:3003` to call the Nango server. You can customize this by setting the environment variable named `NANGO_HOSTPORT` in your CLI environment, using a `.bashrc` or `.zshrc` file.

Learn more about the [Nango CLI](cli).

### Connection Configuration & Template String Interpolation {#connection-config}

Certain APIs have dynamic OAuth URLs. For example, Zendesk has the following authorization URL `https://[SUBDOMAIN].zendesk.com/oauth/authorizations/new` where the subdomain is specific to a Nango Connection.

To address this, an optional `connectionConfig` parameter, itself having a freeform `params` field, can be passed to the `nango.auth(...)` method in the frontend Javascript SDK. 

Taking the example of Zendesk again, the authorization URL is `https://${connectionConfig.params.subdomain}.zendesk.com/oauth/authorizations/new` in the [Provider Templates](https://nango.dev/oauth-providers). 

You would have to call the frontend Javascript SDK with the following parameters:
```javascript
nango.auth(<provider-config-key>, <connection-id>, { params: { subdomain: <zendesk-subdomain>}})

```