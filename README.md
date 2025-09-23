# VentureLink

This is a Next.js application that connects entrepreneurs with investors, built with Supabase for the backend and Next.js for the frontend.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following tools installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Set up Supabase Project

1.  **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Get Project URL and Anon Key**:
    *   Navigate to **Project Settings > API**.
    *   Find your **Project URL** and **Project API Keys** (`anon` key).

### 2. Set Environment Variables

1.  Create a new file named `.env` in the root of your project.
2.  Copy the contents of `.env.example` into your new `.env` file (if it exists) or create it from scratch.
3.  Fill in the required values:
    *   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase API settings.
    *   Generate a long, random, secret string for `JWT_SECRET`.
    *   The other variables (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`) are not required for the initial setup to run, but will be needed to test backend functions.

### 3. Set up the Database Schema

The database schema, security policies, and functions must be manually set up using the Supabase SQL Editor. This is the most critical step.

1.  Navigate to the **SQL Editor** in your Supabase project dashboard.
2.  Click **"New query"**.
3.  Open the `infra/schema.sql` file in your local code editor.
4.  Copy its **entire content**.
5.  Paste the content into the Supabase SQL Editor and click **"Run"**.
    *   This script creates all tables, functions, triggers, and security policies. It is safe to run multiple times.

### 4. Run the Next.js App Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The first time you run this, it will also seed the database with demo users and ideas. Your application should now be running at `http://localhost:3000`.

### Demo Login Credentials
*   **Investor:** `priya.sharma@demo.com`
*   **Entrepreneur:** `rohan.kumar@demo.com`
*   **Password (for all demo accounts):** `password123`

---
That's it! The Supabase CLI-related issues are bypassed with this method.
