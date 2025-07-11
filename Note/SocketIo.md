 "scripts": {
    // "dev": "next dev --turbopack",

+   "dev": "node server.js",
    "build": "next build",
    // "start": "next start",

+   "start": "NODE_ENV=production node server.js",
    "lint": "next lint",
    "seed": "ts-node prisma/seed.ts"
  },