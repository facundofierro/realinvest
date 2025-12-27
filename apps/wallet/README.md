# Real Invest Wallet

The **Wallet** application is the core investment and portfolio management interface for the Real Invest platform. It allows users to track their holdings, invest in real estate projects, and manage their transactions.

## 🚀 Getting Started

This project is part of a monorepo managed by **pnpm** and **Turborepo**.

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 18)
- [pnpm](https://pnpm.io/) (>= 9.0.0)

### Installation

To install dependencies for the entire monorepo, run from the root:

```bash
pnpm install
```

### Development

To start the development server for the wallet app:

```bash
# From the root of the monorepo
pnpm dev --filter wallet

# Or from this directory
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

The source code is located in the `src` directory and follows the Next.js App Router convention:

```text
src/
├── app/                  # Next.js App Router (Routes, Layouts, APIs)
│   ├── (auth)/           # Authentication-related routes (e.g., login)
│   ├── (dashboard)/      # Core application features (protected routes)
│   │   ├── assets/       # Portfolio assets view
│   │   ├── chat/         # Support or communication channel
│   │   ├── deposit/      # Wallet funding flow
│   │   ├── exchange/     # Token exchange and trading
│   │   ├── invest/       # Project discovery and investment
│   │   ├── project/      # Detailed project views
│   │   └── withdraw/     # Fund withdrawal flow
│   └── api/              # Internal API endpoints and route handlers
├── components/           # Shared React components
│   └── project/          # Components specific to project displays
├── lib/                  # Utilities, constants, and helper functions
├── sample-data/          # Mock data for development and testing
└── types/                # TypeScript type definitions
```

## 🛠 Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs ESLint for code quality.

## 🧰 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: Shared library from `@repo/ui`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
