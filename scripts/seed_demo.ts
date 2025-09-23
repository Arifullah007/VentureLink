import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Make sure to set these in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be defined in your .env file.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define demo users
const demoUsers = [
  // Entrepreneurs
  { email: 'rohan.kumar@demo.com', password: 'password123', id: '5a99a46a-31b3-4798-8224-74ce3585d41c', metadata: { role: 'entrepreneur', full_name: 'Rohan Kumar' } },
  { email: 'isha.reddy@demo.com', password: 'password123', id: '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', metadata: { role: 'entrepreneur', full_name: 'Isha Reddy' } },
  { email: 'arjun.singh@demo.com', password: 'password123', id: 'a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', metadata: { role: 'entrepreneur', full_name: 'Arjun Singh' } },
  { email: 'meera.patel@demo.com', password: 'password123', id: 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', metadata: { role: 'entrepreneur', full_name: 'Meera Patel' } },
  { email: 'karan.chopra@demo.com', password: 'password123', id: 'c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b', metadata: { role: 'entrepreneur', full_name: 'Karan Chopra' } },

  // Investors
  { email: 'priya.sharma@demo.com', password: 'password123', id: 'b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', metadata: { role: 'investor', full_name: 'Priya Sharma' } },
  { email: 'vikram.mehta@demo.com', password: 'password123', id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', metadata: { role: 'investor', full_name: 'Vikram Mehta' } },
  { email: 'anjali.gupta@demo.com', password: 'password123', id: 'f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', metadata: { role: 'investor', full_name: 'Anjali Gupta' } },
  { email: 'ravi.kapoor@demo.com', password: 'password123', id: 'd4c3b2a1-e0f9-a8b7-c6d5-e4f3a2b1c0d9', metadata: { role: 'investor', full_name: 'Ravi Kapoor' } },
];

async function createOrUpdateUser(user: typeof demoUsers[0]) {
  // Check if user exists
  const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);
  
  if (getUserError && getUserError.message !== 'User not found') {
    console.error(`Error checking user ${user.email}:`, getUserError.message);
    return;
  }

  if (existingUser.user) {
    // User exists, update them
    console.log(`User ${user.email} already exists. Updating...`);
    const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email: user.email,
        password: user.password,
        user_metadata: user.metadata,
        email_confirm: true, // Auto-confirm email for demo users
      }
    );
    if (updateUserError) {
      console.error(`Error updating user ${user.email}:`, updateUserError.message);
    } else {
      console.log(`Successfully updated user ${updatedUser.user.email}`);
    }
  } else {
    // User does not exist, create them
    console.log(`User ${user.email} not found. Creating...`);
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      user_metadata: user.metadata,
      email_confirm: true,
    });

    if (createUserError) {
      console.error(`Error creating user ${user.email}:`, createUserError.message);
    } else if (newUser.user) {
      console.log(`Successfully created user ${newUser.user.email}`);
    }
  }
}

async function seedDatabase() {
  try {
    console.log('--- Step 1: Creating or updating demo users in Supabase Auth ---');
    for (const user of demoUsers) {
      await createOrUpdateUser(user);
    }
    console.log('--- Finished creating/updating users. ---');

    console.log('\n--- Step 2: Running SQL seed script to populate database tables ---');
    const seedSql = fs.readFileSync(path.join(__dirname, '../infra/seed.sql'), 'utf-8');
    
    const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', { sql: seedSql });

    if (sqlError) {
        // Fallback for local development if the RPC function doesn't exist
        if (sqlError.message.includes('function execute_sql(sql => text) does not exist')) {
            console.warn('`execute_sql` RPC not found. Executing SQL query directly. This is common in local dev.');
            const { error: directSqlError } = await supabaseAdmin.from('profiles').select('*'); // This is just to test connection, the real seeding is below.
            if(directSqlError && directSqlError.message.includes("permission denied")){
               console.error("Direct SQL execution failed. Please ensure you have an `execute_sql` RPC function in your database for seeding, or that the service role has direct access.")
               throw directSqlError
            }
            // A bit of a hack: Supabase JS SDK doesn't support arbitrary multi-statement SQL execution.
            // The proper way is using the `psql` command or an RPC as intended.
            // For the sake of this script, we'll log a message and assume the user can run the SQL manually if needed.
            console.log("Executing query with supabase.sql()...")
            const { error: queryError } = await (supabaseAdmin as any).sql(seedSql);
            if(queryError) throw queryError

        } else {
            throw sqlError;
        }
    }
    
    console.log('--- Database seeding successful! ---');
    console.log('\n✅ Demo mode setup is complete. You can now start the application.');
    console.log('\nSample Login Credentials:');
    console.log('Investor: priya.sharma@demo.com');
    console.log('Entrepreneur: rohan.kumar@demo.com');
    console.log("Password (for all demo accounts): password123");

  } catch (error) {
    if (error instanceof Error){
      console.error('🔴 An error occurred during seeding:', error.message);
    } else {
      console.error('🔴 An unexpected error occurred:', error);
    }
    process.exit(1);
  }
}

seedDatabase();
