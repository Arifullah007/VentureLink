
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Make sure to set these in your .env or .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be defined in your .env or .env.local file.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define demo users
const demoUsers = [
  // Entrepreneurs
  { email: 'shaikarifullah06@gmail.com', password: 'Arif_007', metadata: { role: 'entrepreneur', full_name: 'Shaik Arifullah' } },
  
  // Investors
  { email: 'injarapusharad2017@gmail.com', password: 'Sharad_007', metadata: { role: 'investor', full_name: 'Injarapu Sharad', preferred_sector: 'Tech', investment_range: '5L-25L', expected_returns: 'Medium', bio: 'Seasoned investor in emerging technologies.' } },
];

const ideas = [
    {
        idea_title: 'Eco-Friendly Packaging Solution',
        anonymized_summary: 'A biodegradable and compostable packaging alternative to plastics, made from agricultural waste. Aims to reduce plastic pollution and provide a sustainable solution for businesses.',
        full_text: 'Full details of the eco-friendly packaging solution, including materials, manufacturing process, and go-to-market strategy. This part is hidden until an investor signs an NDA.',
        sector: 'Sustainability',
        investment_required: '5L-25L',
        estimated_returns: 'Medium',
        prototype_url: 'placeholder_url_1',
    },
    {
        idea_title: 'AI-Powered Health Monitoring App',
        anonymized_summary: 'A mobile application that uses AI to monitor vital signs through the phone\'s camera, providing real-time health insights and alerts. Connects users with doctors for virtual consultations.',
        full_text: 'Complete breakdown of the AI health app, including the technology stack, data privacy measures, and monetization plan. This part is hidden until an investor signs an NDA.',
        sector: 'Healthcare',
        investment_required: '26L-1CR',
        estimated_returns: 'High',
        prototype_url: 'placeholder_url_2',
    },
];

async function createOrUpdateUser(user: typeof demoUsers[0], allAuthUsers: any[]) {
    const existingUser = allAuthUsers.find(u => u.email === user.email);

    if (existingUser) {
        console.log(`User ${user.email} already exists. Updating metadata...`);
        const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
                user_metadata: user.metadata,
                email_confirm: true,
            }
        );
        if (updateUserError) {
            console.error(`Error updating user ${user.email}:`, updateUserError.message);
            throw updateUserError;
        }
        console.log(`Successfully updated user ${updatedUser.user.email}`);
        return updatedUser.user;
    } else {
        console.log(`User ${user.email} not found. Creating...`);
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            user_metadata: user.metadata,
            email_confirm: true,
        });

        if (createUserError) {
            console.error(`Error creating user ${user.email}:`, createUserError.message);
            throw createUserError;
        }
        console.log(`Successfully created user ${newUser.user.email}`);
        return newUser.user;
    }
}

async function seedDatabase() {
  try {
    console.log('--- Step 1: Fetching all users from Supabase Auth ---');
    const { data: { users: allAuthUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      console.error('Error fetching users:', listUsersError.message);
      throw listUsersError;
    }
    console.log(`--- Found ${allAuthUsers.length} total users. Proceeding to create or update demo users. ---`);

    const createdUsers: { [email: string]: any } = {};
    for (const user of demoUsers) {
      const createdUser = await createOrUpdateUser(user, allAuthUsers);
      createdUsers[user.email] = createdUser;
    }
    console.log('--- Finished creating/updating users. ---');
    
    const entrepreneur = createdUsers['shaikarifullah06@gmail.com'];
    const investor = createdUsers['injarapusharad2017@gmail.com'];

    if (!entrepreneur || !investor) {
        throw new Error('Failed to create or find one of the demo users.');
    }

    console.log('\n--- Step 2: Clearing old profiles for demo users ---');
    const userIds = Object.values(createdUsers).map(u => u.id);
    const { error: deleteProfilesError } = await supabaseAdmin.from('profiles').delete().in('id', userIds);
    if (deleteProfilesError) {
        console.warn('Warning deleting old profiles (this is safe if it\'s the first run):', deleteProfilesError.message);
    } else {
        console.log('--- Old profiles cleared successfully. ---');
    }

    console.log('\n--- Step 3: Seeding new profiles ---');
    const profilesToInsert = demoUsers.map(u => ({
        id: createdUsers[u.email].id,
        full_name: u.metadata.full_name,
        role: u.metadata.role,
        bio: (u.metadata as any).bio,
        preferred_sector: (u.metadata as any).preferred_sector,
        investment_range: (u.metadata as any).investment_range,
        expected_returns: (u.metadata as any).expected_returns,
    }));

    const { error: profilesError } = await supabaseAdmin.from('profiles').insert(profilesToInsert);
    if (profilesError) throw profilesError;
    console.log('--- Profiles seeded successfully. ---');


    console.log('\n--- Step 4: Seeding ideas for entrepreneur ---');
    // Clear old ideas from this entrepreneur to avoid duplicates
    const { error: deleteIdeasError } = await supabaseAdmin.from('ideas').delete().eq('entrepreneur_id', entrepreneur.id);
    if (deleteIdeasError) throw deleteIdeasError;

    const ideasToInsert = ideas.map(idea => ({
        ...idea,
        entrepreneur_id: entrepreneur.id,
    }));

    const { error: ideasError } = await supabaseAdmin.from('ideas').insert(ideasToInsert);
    if (ideasError) throw ideasError;
    console.log('--- Ideas seeded successfully. ---');


    console.log('\n--- Step 5: Clearing old notifications ---');
    const recipientIds = Object.values(createdUsers).map(u => u.id);
    const { error: deleteNotificationsError } = await supabaseAdmin.from('notifications').delete().in('recipient_id', recipientIds);
    if (deleteNotificationsError) {
      console.warn('Warning clearing old notifications:', deleteNotificationsError.message);
    } else {
      console.log('--- Old notifications cleared. ---');
    }

    console.log('\n--- Database seeding successful! ---');
    console.log('\n✅ Demo mode setup is complete. You can now start the application.');
    console.log('\nSample Login Credentials:');
    console.log(`Investor: ${investor.email} (Password: ${demoUsers.find(u => u.email === investor.email)?.password})`);
    console.log(`Entrepreneur: ${entrepreneur.email} (Password: ${demoUsers.find(u => u.email === entrepreneur.email)?.password})`);

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
