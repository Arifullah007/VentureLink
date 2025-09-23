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

1.  Create a new file named `.env.local` in the root of your project. This file is for your local secrets and will not be tracked by git.
2.  Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables with the values you just copied.
    ```env
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
    ```

### 3. Set up the Database Schema

This is the most critical step. The database schema, security policies, and functions must be manually set up using the Supabase SQL Editor.

1.  Navigate to the **SQL Editor** in your Supabase project dashboard.
2.  Click **"New query"**.
3.  Open the `infra/schema.sql` file in your local code editor.
4.  Copy its **entire content**.
5.  Paste the content into the Supabase SQL Editor and click **"RUN"**.
    *   This script creates all tables, functions, triggers, and security policies. It is idempotent, meaning it is safe to run multiple times.

### 4. Run the Next.js App Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Your application should now be running at `http://localhost:3000`.

### 5. (Optional) Seed with Demo Data

The database is now empty. To add the sample users, ideas, and investors, you need to run the seed script.

1.  **Get Service Role Key**: In your Supabase Project's API Settings, find the `service_role` key (it will be hidden by default). Copy this key.
2.  **Add to `.env.local` file**: Add the key to your `.env.local` file:
    ```
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"
    ```
3.  **Run the seed script**: In your terminal, run the following command:
    ```bash
    npm run seed-demo
    ```

### Demo Login Credentials
*   **Investor:** `injarapusharad2017@gmail.com`
*   **Entrepreneur:** `shaikarifullah06@gmail.com`
*   **Password (for all demo accounts):** `password123`

---
That's it! The VentureLink application is fully set up and ready to use.