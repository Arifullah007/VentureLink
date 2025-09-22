# VentureLink

This is a Next.js application that connects entrepreneurs with investors, built with Supabase for the backend and Next.js for the frontend.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following tools installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Firebase CLI](https://firebase.google.com/docs/cli) (for frontend deployment if needed)

### 1. Set up Supabase Project

1.  **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Get Project Details**:
    *   Navigate to **Project Settings > API**.
    *   Find your **Project URL** and **Project API Keys** (`anon` and `service_role`).
    *   Find your **Connection string** under the **Database** settings. You'll need this for `psql`.
3.  **Link Your Local Project**: In your terminal, run `supabase login` and then `supabase link --project-ref YOUR_PROJECT_REF`, replacing `YOUR_PROJECT_REF` with the ID from your project's URL (`https://<YOUR_PROJECT_REF>.supabase.co`).

### 2. Set Environment Variables

1.  Create a new file named `.env` in the root of your project.
2.  Copy the contents of `.env.example` into your new `.env` file.
3.  Fill in the required values:
    *   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase API settings.
    *   `SUPABASE_SERVICE_ROLE_KEY` from your Supabase API settings.
    *   For `STRIPE_*` variables, create a [Stripe](https://stripe.com/) account and find your test keys. The webhook secret can be configured later.
    *   `JWT_SECRET` should be a long, random, and secret string that you generate yourself.

### 3. Deploy Backend Infrastructure

The backend consists of a database schema, security policies, and serverless Edge Functions. A helper script is provided to deploy everything.

1.  **Make the script executable**:
    ```bash
    chmod +x infra/deploy.sh
    ```
2.  **Run the deployment script**:
    ```bash
    ./infra/deploy.sh
    ```
    This script will push your database schema and deploy the Edge Functions.

3.  **CRITICAL: Manually Apply Triggers and Security Policies**
    The Supabase CLI does not currently support applying triggers and RLS policies from files. You **must** do this manually for the app to function correctly.
    *   Navigate to the **SQL Editor** in your Supabase project dashboard.
    *   Open the `infra/triggers.sql` file in your local code editor, copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
    *   Do the same for `infra/rls_policies.sql`: open the file, copy its content, paste it into the editor, and click **Run**.

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

### 5. How to Test New Features

#### Test A: Content Moderation Trigger
1.  Sign up as an entrepreneur and create a new pitch.
2.  In the "Pitch Summary" field, type "You can reach me at **test@mail.com**".
3.  Submit the form. The submission should fail, and if you check your `reports` table in the Supabase dashboard, you will see a new row documenting the violation.

#### Test B: File Processing & Quarantine
1.  Create a simple PDF file that contains an email address (e.g., "contact: help@example.com").
2.  Sign up as an entrepreneur and create a new pitch.
3.  For the "Pitch Document/Prototype", upload the PDF you just created.
4.  After submission, navigate to your Supabase Storage browser. You will find the file has been moved to a `quarantined` folder instead of the public `pitch-files` folder.
5.  Check the `pitch_files` table; the `quarantined` column for that file will be `true`.

#### Test C: Simulate Stripe Webhook
1.  Use the [Stripe CLI](httpss://stripe.com/docs/stripe-cli) to simulate a webhook event.
2.  Run the command:
    ```bash
    stripe trigger checkout.session.completed --add "checkout_session:metadata[user_id]=YOUR_SUPABASE_USER_ID"
    ```
    Replace `YOUR_SUPABASE_USER_ID` with the ID of an investor user from your `auth.users` table.
3.  This will send an event to your deployed `stripe-webhook` function.
4.  Check the `investor_subscriptions` table. A new active subscription should be created for that user. Check the `transactions` table for a record of the payment.

---

## 6-Command Deployment Checklist

Run these commands in your terminal to get everything deployed.

```bash
# 1. Link your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Push the database schema
supabase db push

# 3. Deploy the Edge Functions
supabase functions deploy

# 4. Install project dependencies
npm install

# 5. Start the local development server
npm run dev

# 6. Manually apply RLS policies and Triggers by pasting the contents of
#    infra/rls_policies.sql and infra/triggers.sql into the Supabase SQL Editor.
echo "Now, go to the Supabase SQL Editor and run the SQL from infra/triggers.sql and infra/rls_policies.sql"
```
