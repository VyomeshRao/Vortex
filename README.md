# Merchant Mesh

Merchant Mesh is a responsive demo dashboard that helps independent shops turn missed customer requests into local demand intelligence. The project direction is based on the HackSprint concept for team VORTEX: capture unmet demand, aggregate it among nearby merchants, and surface stocking and group buying opportunities.

## Demo

Open `index.html` in a browser. No build step, database, or API key is required.

## What works

- Responsive merchant overview with sample neighbourhood demand and network insights.
- Create, switch between, and log out of demo profiles.
- Log a customer request and keep a separate month-to-date count for each profile.
- Explore demand rows, change the pulse period, and try the group buying action.
- Dashboard demand and recommendations are illustrative sample data, not live merchant data.
- Profiles and request counts are saved in this browser only. There is no password login, cloud sync, or server account.

## Stack

Vanilla HTML, CSS, and JavaScript. Fonts load from Google Fonts when online and fall back to system sans-serif fonts otherwise.

## Run locally

Open `index.html` directly, or serve this directory with any static file server.

## Next steps for a production MVP

Add merchant authentication, persistent request storage, consent-based neighbourhood aggregation, and real inventory/supplier connections. AI categorization and demand forecasts should be grounded in validated request data before being used for purchasing decisions.
