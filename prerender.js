name: Prerender e Deploy ogni 10'

on:
  schedule:
    - cron:  '*/10 * * * *'    # ogni 10 minuti
  workflow_dispatch:          # eseguibile anche manualmente

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install --omit=dev

      - name: Prerender pagina
        run: npm run prerender

      - name: Deploy su gh-pages
        run: npm run deploy:gh-pages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
