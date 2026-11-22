# Smart Kamera / Render deployment
This branch contains a replacement deployable storefront. The original main branch is unchanged.
Requires DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD.
Build: npm install && npx prisma db push && npm run build
Start: npm run start
Products must be added via /admin. Payments, photo uploads, rate limits, and Telegram are not implemented in this deploy branch.
