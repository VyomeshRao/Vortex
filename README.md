# Merchant Mesh

Merchant Mesh is a responsive demo dashboard that helps independent shops turn missed customer requests into local demand intelligence. The project direction is based on the HackSprint concept for team VORTEX: capture unmet demand, aggregate it among nearby merchants, and surface stocking and group buying opportunities.

## Demo

Open `index.html` in a browser. No build step, account, database, or API key is required.

## What works

- Responsive merchant overview with sample neighbourhood demand and network insights.
- Log a customer request and adjust the month-to-date request count.
- Explore demand rows, change the pulse period, and try the group buying action.
- Data is illustrative and lives in the page; entries are not saved to a server.

## Stack

Vanilla HTML, CSS, and JavaScript. Fonts load from Google Fonts when online and fall back to system sans-serif fonts otherwise.

## Run locally

Open `index.html` directly, or serve this directory with any static file server.

## Deployment

The repository includes a GitHub Pages workflow in `.github/workflows/pages.yml`. Once Pages is enabled for this repository with GitHub Actions as the build source, pushes to `main` deploy the site.

## Next steps for a production MVP

Add merchant authentication, persistent request storage, consent-based neighbourhood aggregation, and real inventory/supplier connections. AI categorization and demand forecasts should be grounded in validated request data before being used for purchasing decisions.
