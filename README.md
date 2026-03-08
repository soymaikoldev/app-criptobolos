# Crypto Life Tracker

App web personal para registrar flujo entre wallets, Binance y bolívares con cálculo real de USD.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Deploy en Vercel
- Framework preset: **Next.js**.
- Root Directory: repositorio raíz.
- Build command: `next build`.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Recharts
- Persistencia en localStorage (`accounts`, `transactions`, `rates`)
