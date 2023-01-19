<div align="center">
  
  ![Nango Logo](https://uploads-ssl.webflow.com/62a9f4a7a5a3d9ef1439982a/6311c3a48ebd85d6ed8f8f05_logo-background.png)

</div>

<h1 align="center">Integrate your app with 3rd-party APIs, fast</h1>

<div align="center">
The service that lets you easily synchronise data between your app and any 3rd-party API.
</div>

<p align="center">
    <br />
    <a href="https://docs.nango.dev" rel="dofollow"><strong>Explore the docs »</strong></a>
    <br />

  <br/>
    <a href="https://.nango.dev">Website</a>
    ·
    <a href="https://docs.nango.dev/real-world-examples">Examples</a>
    ·
    <a href="https://github.com/nangohq/nango/issues">Report Bug</a>
    ·
    <a href="https://nango.dev/slack">Slack</a>
    ·
    <a href="https://github.com/orgs/NangoHQ/projects/1/views/2">Roadmap</a>
    ·
    <a href="https://twitter.com/NangoHQ">Twitter</a>
    ·
</p>

<p align="center">
   <a href="https://www.ycombinator.com"><img src="https://img.shields.io/badge/Backed%20by-Y%20Combinator-%23f26625"></a>
</p>

# ⭐️ Why Nango?

Adding integrations to an app is complicated.

At first, it looks as simple as making requests to a 3rd-party API. But you quickly need to build OAuth, background synchronisation, retries, pagination, caching, webhooks, data transformation, monitoring, etc.

We pre-built these components so you don’t have to and can focus on shipping low maintenance integrations fast.

# ✨ How it works

With Nango, building integrations becomes as simple as: 

1. Authenticate users with OAuth in your frontend: 

```jsx
nango.auth('hubspot', '<user-id>'); // Starts OAuth flow
```

2. Easily sync data from any API endpoint to your DB in the backend:

```tsx
nango.sync('https://api.hubspot.com/crm/v3/contacts', config); // Syncs contacts forever!
```

3. Read the always-fresh data from the DB and use it in your app
```sql
SELECT * FROM hubspot_contacts WHERE ...
```

Additionally, Nango has out-of-the-box support for:

- 🔐 OAuth token retrieval & refresh
- 📶 Incremental syncs
- 🪝 Webhooks
- ⚡️ JSON-to-SQL schema mapping
- 🔄 Retries & rate-limit handling
- 🚀 Scalable & flexible open-source infrastructure
- ✅ Language-agnostic
- ☁️ Self-hosted and Cloud options

# 🧑‍💻 Example use cases

Nango is API agnostic: It works with any API endpoint that returns JSON (you just need to [give it a few details](https://docs.nango.dev/nango-sync/sync-all-options) about the endpoint).

While Nango supports millions of APIs, here are some of the most popular ones:

- **CRMs** such as [HubSpot](https://docs.nango.dev/real-world-examples#hubspot-sync-all-hubspot-crm-contacts), Salesforce, Pipedrive, Zoho CRM, Zendesk Sell etc.
- **Accounting systems** such as Quickbooks, Xero, Netsuite, Zoho Books, Freshbooks etc.
- **Cloud providers** such as AWS, GCP, Azure, DigitalOcean, Fly.io, Heroku etc.
- **Productivity tools** such as Gmail, Google Calendar, [Slack](https://docs.nango.dev/real-world-examples#slack-sync-all-posts-from-a-slack-channel), Outlook 365, Zoom, Google Drive etc.
- **Project Management tools** such as Airtable, Asana, Monday.com, ClickUp etc.
- **Dev tools** such as [Github](https://docs.nango.dev/real-world-examples#github-sync-all-stargazers-from-a-repo), Gitlab, JIRA, Trello, Figma etc.
-   ...any API endpoint that returns JSON

The docs have [more examples](https://docs.nango.dev/real-world-examples) of Nango configurations for different APIs and endpoints.

# 🚀 Quickstart

Let’s sync the Pokémon API to your DB in 3 minutes.

Clone the repo and start Nango locally…

```bash
git clone https://github.com/NangoHQ/nango.git 
cd nango && docker compose up
```

...and create a Sync with a simple CURL command:

```bash
curl --request POST \     
	--url http://localhost:3003/v1/syncs \     
	--header "Content-type: application/json" \     
	--data '{"url": "https://pokeapi.co/api/v2/pokemon", "response_path": "results", "paging_url_path":"next", "mapped_table":"pokemons", "frequency":"1 minute"}'
```

That's it! You can check out [the list of all Pokémons](http://localhost:8080/?pgsql=nango-db&username=nango&db=nango&ns=nango&select=pokemons) in your local db (password is `nango`). **They will stay in sync forever!**

# ☁️ Use the fully-hosted Nango Cloud

Request a Nango instance on the [Slack community](https://nango.dev/slack) (free-tier available).

# 🔗 Links

- See the [documentation](https://docs.nango.dev) to learn more about all the features
- Use our [examples](https://docs.nango.dev/real-world-examples) to get inspiration and learn how to sync data from various APIs
- Join our [Slack community](https://join.slack.com/t/lago-community/shared_invite/zt-1bw903041-PsxQmQios5utmETm1EZkvQ) if you need help, want to chat or follow releases
- Check our [blog on in-app integrations](https://www.nango.dev/blog)
- Follow us on [Twitter](https://twitter.com/GetLago) for the latest news
- You can email us as well: hello@nango.dev

# 💪 Contributors

<img src="https://contributors-img.web.app/image?repo=nangohq/nango" />
