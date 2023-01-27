# Limitations of Nango Open Source

Nango Open Source has some limitations compared to Nango Cloud. Please take them into consideration before using Nango Open Source in production: 
- Transient storage due to Docker (updating the Docker image causes configs/credentials loss). Connect Nango to a production DB to mitigate.
- No default encryption of the credentials
- No default authentication
- No default SSL access
- No auto-scaling and auto-updates

Please consider using [Nango Cloud](cloud.md) in production to mitigate these limitations and benefit from additional features.