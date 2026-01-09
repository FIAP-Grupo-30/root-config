#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const base = process.env.BYTEBANK_BASE_URL || '';
const financeiro = process.env.BYTEBANK_FINANCEIRO_URL || '';
const dashboard = process.env.BYTEBANK_DASHBOARD_URL || '';

const importmap = {
  imports: {
    "single-spa": "https://ga.jspm.io/npm:single-spa@5.9.5/lib/esm/single-spa.min.js",
    "single-spa-react": "https://ga.jspm.io/npm:single-spa-react@5.1.4/lib/esm/single-spa-react.js",
    "react": "https://ga.jspm.io/npm:react@18.2.0/index.js",
    "react-dom": "https://ga.jspm.io/npm:react-dom@18.2.0/index.js",
    "react-dom/client": "https://ga.jspm.io/npm:react-dom@18.2.0/client.js",
    "react/jsx-runtime": "https://ga.jspm.io/npm:react@18.2.0/jsx-runtime.js",
    "scheduler": "https://ga.jspm.io/npm:scheduler@0.23.0/index.js",
    "@bytebank/base": base ? `${base.replace(/\/$/, '')}/bytebank-base.js` : "http://localhost:9001/bytebank-base.js",
    "@bytebank/financeiro": financeiro ? `${financeiro.replace(/\/$/, '')}/bytebank-financeiro.js` : "http://localhost:9002/bytebank-financeiro.js",
    "@bytebank/dashboard": dashboard ? `${dashboard.replace(/\/$/, '')}/bytebank-dashboard.js` : "http://localhost:9003/bytebank-dashboard.js"
  }
};

const outDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'importmap.json'), JSON.stringify(importmap, null, 2));
console.log('importmap.json written to public/importmap.json');
