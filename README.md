# SecureCam - Smart Surveillance Camera E-commerce

Modern e-commerce platform for selling smart surveillance cameras (IP, WiFi, 4G, AHD cameras + NVR recorders + accessories) targeting Uzbekistan market with Uzbek language support.

## Features

- **No Shopping Cart**: Direct "Buy Now" modal order form
- **Cash on Delivery Only**: Free delivery, payment upon receipt
- **Telegram Bot Notifications**: New orders sent to Telegram with inline buttons to update status (Confirm, Ship, Deliver, Cancel)
- **Admin Panel**: Manage products, categories, brands, orders, admins, settings
- **Modern Animated Design**: Framer Motion animations, dark mode, responsive
- **SEO Optimized**: Server-side rendering for product pages and catalog
- **Multi-language**: Uzbek language support

## Tech Stack

- **Framework**: Next.js 15 App Router with Server Components
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Prisma ORM with PostgreSQL (SQLite for local dev)
- **Animations**: Framer Motion
- **Telegram Bot**: Telegraf.js with webhook
- **Forms**: React Hook Form + Zod validation
- **Auth**: Cookie-based authentication for admin panel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
cd smart-camera-shop

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
pnpm db:push

# Seed database with sample data
pnpm db:seed

# Start development server
pnpm dev
```

### Telegram Bot Setup

1. Create a new bot with [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token to `.env` as `TELEGRAM_BOT_TOKEN`
3. Get your chat ID (user ID or group ID):
   - For user ID: Message [@userinfobot](https://t.me/userinfobot)
   - For group ID: Add [@RawDataBot](https://t.me/RawDataBot) to group and send a message
4. Set `TELEGRAM_CHAT_ID` in `.env`
5. Set up webhook for production:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
   ```

### Admin Access

After seeding, login at `/admin/login` with:
- Email: `admin@securecam.uz`
- Password: `admin123`

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin panel pages
│   │   ├── products/          # Products management
│   │   ├── categories/        # Categories management
│   │   ├── brands/            # Brands management
│   │   ├── orders/            # Orders management
│   │   ├── admins/            # Admin users management
│   │   ├── settings/          # Site settings
│   │   └── login/             # Admin login
│   ├── api/
│   │   ├── admin/             # Admin API routes
│   │   ├── orders/            # Order creation API
│   │   └── telegram/webhook/  # Telegram webhook
│   ├── katalog/               # Catalog page
│   ├── mahsulot/[slug]/       # Product detail page
│   └── page.tsx               # Homepage
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── layout/                # Layout components (Header, Footer)
│   └── providers/             # Context providers
├── lib/
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Utility functions
└── bot/
    └── index.ts               # Telegram bot (Telegraf)
```

## Database Schema

- **Category**: Product categories with ordering
- **Brand**: Camera brands (Hikvision, Dahua, Ezviz, etc.)
- **Product**: Full product info with features/specifications as JSON
- **Order**: Orders with status tracking (PENDING → CONFIRMED → SHIPPING → DELIVERED/CANCELLED)
- **OrderItem**: Order line items with price at time of order
- **AdminUser**: Admin users with roles (SUPER_ADMIN, ADMIN, MANAGER)
- **SiteSettings**: Site configuration (name, contact, telegram, etc.)

## Key Features Implementation

### Order Flow (No Cart)
1. User clicks "Buy Now" on product card
2. Modal opens with order form (name, phone, email, address, comment)
3. Form validates with Zod schema
4. API creates order, decrements stock
5. Telegram notification sent with inline keyboard
6. Admin updates status via Telegram or admin panel

### Telegram Bot
- Webhook endpoint at `/api/telegram/webhook`
- Inline buttons: Confirm, Ship, Deliver, Cancel
- Message updates in real-time when status changes
- Commands: `/start`, `/orders`, `/stats`

### Admin Panel
- Cookie-based authentication
- Collapsible sidebar navigation
- Dark mode support
- Full CRUD for all entities
- Real-time order status updates

## Deployment

### Vercel (Frontend)
1. Connect repository to Vercel
2. Add environment variables
3. Deploy

### Database (PostgreSQL)
- Use Neon, Supabase, or Railway for PostgreSQL
- Update `DATABASE_URL` in production

### Telegram Bot
- Deploy bot separately (Railway, Render, VPS)
- Or use webhook mode with Vercel (already implemented)

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database
pnpm bot          # Run Telegram bot locally
```

## License

MIT