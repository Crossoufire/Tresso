# Tresso

Tresso is a simple Kanban board application inspired by Trello made to be self-hosted.
It provides the core functionality needed to organize projects with boards, columns, cards and labels in a clean, modern interface.

## Features

- **Board Management:** Create multiple boards to separate your projects.
- **Draggable Interface:** Organize your workflow by dragging and dropping columns and cards.
- **Card Details:** Add titles and detailed descriptions to your cards.
- **Labeling System:** Create, edit, and assign color-coded labels to cards for easy categorization.
- **Authentication:** Secure user authentication via Google OAuth.
- **Clean UI:** A responsive and minimal user interface built with shadcn/ui + Tailwind CSS.

## Tech Stack

- **ORM:** Drizzle ORM
- **Language:** TypeScript
- **Routing:** TanStack Router
- **Authentication:** better-auth
- **Data Fetching & State:** TanStack Query
- **Framework:** TanStack Start (Full-stack React)
- **Database:** SQLite (libSQL client, but can be replaced by any other SQL database)
- **UI:**
    - React
    - shadcn/ui
    - Tailwind CSS

## Getting Started

Follow these instructions to get a local instance of Tresso up and running.

### Prerequisites

- Node.js (v20+)
- A package manager (npm, yarn, or pnpm)
- Google OAuth credentials from Google Cloud Console.

#### 1. Clone the Repository

```bash
git clone https://github.com/Crossoufire/tresso.git
cd tresso
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up The Env Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, fill in the `.env` file with your credentials:

```env
# Base URL of the app
VITE_BASE_URL="http://localhost:3000"

# SQLite Database URL
DATABASE_URL="/location/of/your/db"

# Better-Auth Secret
BETTER_AUTH_SECRET="your_strong_secret_here"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

For Google OAuth, ensure the "Authorized redirect URIs" in the Google Cloud Console is set to `${VITE_BASE_URL}/api/auth/callback/google`.

#### 4. Set Up the Database

This project uses Drizzle ORM to manage the database schema.
Run the following command to push the schema from `src/server/database/schemas` to your SQLite DB.

```bash
npm run dk push
```

#### 5. Run the App

You can now start the dev server with:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
