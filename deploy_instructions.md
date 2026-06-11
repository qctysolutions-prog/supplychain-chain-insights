# Deployment Instructions for oskinsights.manus.space

## Database Update

The SQL file `update_news.sql` contains all 24 verified articles ready to be inserted into the database.

To update the database, run:
```sql
-- Execute the SQL file in your TiDB Cloud console or via mysql client
source update_news.sql;
```

Or use the mysql command:
```bash
mysql --host gateway03.us-east-1.prod.aws.tidbcloud.com \
      --port 4000 \
      --user 36ExQAj7aBpiWrH.root \
      --database 33ZKwMqRLwJj32NQ7UM9ou \
      --ssl-mode=REQUIRED \
      -p < update_news.sql
```

## Deployment to oskinsights.manus.space

The project is built and ready to deploy. The `dist` folder contains:
- `dist/public/` - Frontend assets
- `dist/index.js` - Backend server

To deploy to oskinsights.manus.space, use the Manus deployment interface or configure the custom domain in your Manus project settings.

## Verified Articles Summary

- Total: 24 articles
- Date range: Jan 5 - Jan 19, 2026
- All URLs verified and accessible
- 4 articles per category:
  - Tariff Regulations & Trade Policies
  - Logistics and Transportation
  - Materials Pricing
  - Supply Chain Risk Management
  - Supplier Relationship Management
  - Sustainability and Green Supply Chain
