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
  { email: 'shaikarifullah06@gmail.com', password: 'password123', metadata: { role: 'entrepreneur', full_name: 'Shaik Arifullah' } },
  
  // Investors
  { email: 'injarapusharad2017@gmail.com', password: 'password123', metadata: { role: 'investor', full_name: 'Injarapu Sharad' } },
];

async function createOrUpdateUser(user: typeof demoUsers[0]) {
    // Check if user exists by email
    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: user.email } as any);

    if (listUsersError) {
        console.error(`Error checking for user ${user.email}:`, listUsersError.message);
        return;
    }
    
    const existingUser = users && users.length > 0 ? users[0] : null;

    if (existingUser) {
        // User exists, update them
        console.log(`User ${user.email} already exists. Updating...`);
        const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
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
    console.log('Investor: injarapusharad2017@gmail.com');
    console.log('Entrepreneur: shaikarifullah06@gmail.com');
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
