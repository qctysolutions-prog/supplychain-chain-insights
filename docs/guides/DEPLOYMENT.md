# Deployment Guide for oskinsights.manus.space

## Current Status

✅ **Database Updated**: 61 articles total (24 new articles added)
✅ **Code Committed**: Latest changes pushed to GitHub
✅ **Build Successful**: Production build completed
✅ **Server Running**: Application tested and verified

## Deployment URL

**Target:** https://oskinsights.manus.space

## What Was Updated

### Database Changes
- **Articles Added:** 24 new articles
- **Articles Removed:** All articles older than 14 days (cutoff: 2026-01-07)
- **Total Articles:** 61
- **Date Range:** January 8-21, 2026

### Category Distribution
- Tariff Regulations & Trade Policies: 10 articles
- Logistics and Transportation: 10 articles  
- Materials Pricing: 9 articles
- Supply Chain Risk Management: 9 articles
- Supplier Relationship Management: 10 articles
- Sustainability & Green Supply Chain: 13 articles

## Permanent Deployment Options

### Option 1: Keep Server Running (Current)
The server is currently running on port 3000 and accessible via:
https://3000-i2886nu7orbc034cqf4g2-1aab57b9.us1.manus.computer

To keep it running permanently:
```bash
cd /home/ubuntu/mobility-supply-chain-brief
nohup pnpm start > server.log 2>&1 &
```

### Option 2: Deploy to Manus Platform
If oskinsights.manus.space is a Manus-hosted subdomain:
1. Access Manus deployment dashboard
2. Create new deployment from GitHub repo
3. Configure subdomain as "oskinsights"
4. Set environment variables (DATABASE_URL)
5. Deploy

### Option 3: Custom Server Deployment
For permanent hosting on a custom server:
1. Set up a VPS or cloud instance
2. Clone the repository
3. Install dependencies: `pnpm install`
4. Build: `pnpm run build`
5. Configure environment variables
6. Run with PM2 or systemd for process management
7. Set up nginx reverse proxy
8. Configure SSL certificate
9. Point oskinsights.manus.space DNS to server

## Environment Variables Required

```env
DATABASE_URL=mysql://36ExQAj7aBpiWrH.root:2nU36nZpDSxh7RNZ4V0w@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/33ZKwMqRLwJj32NQ7UM9ou?ssl={"rejectUnauthorized":true}
NODE_ENV=production
PORT=3000
```

## Verification

The website is live and displaying:
- ✅ Week of January 21, 2026
- ✅ Fresh articles from last 14 days
- ✅ All 6 categories populated
- ✅ Working "Read more" links
- ✅ Feedback forms functional
- ✅ Responsive design

## Next Update

To update with fresh articles in the future:
1. Run news search for past 14 days
2. Verify URLs are accessible
3. Update `new_articles.json`
4. Run `pnpm exec tsx update_database.ts`
5. Commit and push changes
6. Restart server or redeploy

## Support

For deployment issues or questions:
- Check server logs: `tail -f /home/ubuntu/mobility-supply-chain-brief/server.log`
- Verify database connection
- Ensure port 3000 is accessible
- Check DNS configuration for oskinsights.manus.space
