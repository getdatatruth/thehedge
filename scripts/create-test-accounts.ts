// Run with: ./apps/web/node_modules/.bin/tsx scripts/create-test-accounts.ts
// Or:       npx tsx scripts/create-test-accounts.ts  (if tsx is installed globally)

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Test Account Definitions ───────────────────────────

const TEST_ACCOUNTS = [
  {
    email: 'test-free@thehedge.ie',
    password: 'TestHedge2026!',
    tier: 'free' as const,
    familyName: 'Free Family',
    familyStyle: 'balanced' as const,
    county: 'Dublin',
    userName: 'Test Free',
    children: [
      { name: 'Aoife', dateOfBirth: '2019-06-15', interests: ['nature', 'art'], schoolStatus: 'mainstream' as const },
      { name: 'Cian', dateOfBirth: '2021-03-22', interests: ['science', 'movement'], schoolStatus: 'mainstream' as const },
    ],
  },
  {
    email: 'test-family@thehedge.ie',
    password: 'TestHedge2026!',
    tier: 'family' as const,
    familyName: 'Family Plan Family',
    familyStyle: 'active' as const,
    county: 'Cork',
    userName: 'Test Family',
    children: [
      { name: 'Saoirse', dateOfBirth: '2018-09-10', interests: ['literacy', 'calm'], schoolStatus: 'mainstream' as const },
      { name: 'Oisin', dateOfBirth: '2020-01-05', interests: ['maths', 'kitchen'], schoolStatus: 'mainstream' as const },
    ],
  },
  {
    email: 'test-educator@thehedge.ie',
    password: 'TestHedge2026!',
    tier: 'educator' as const,
    familyName: 'Educator Family',
    familyStyle: 'curious' as const,
    county: 'Galway',
    userName: 'Test Educator',
    children: [
      { name: 'Niamh', dateOfBirth: '2017-04-18', interests: ['science', 'nature', 'literacy'], schoolStatus: 'homeschool' as const },
      { name: 'Fionn', dateOfBirth: '2020-11-30', interests: ['art', 'movement', 'social'], schoolStatus: 'homeschool' as const },
    ],
  },
];

// ─── Cleanup ────────────────────────────────────────────

async function deleteExistingTestUser(email: string) {
  // Find the auth user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(`  Error listing users: ${listError.message}`);
    return;
  }

  const existingUser = users.find((u) => u.email === email);
  if (!existingUser) {
    console.log(`  No existing auth user for ${email}`);
    return;
  }

  // Find their user profile to get family_id
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', existingUser.id)
    .single();

  if (profile?.family_id) {
    // Delete children, user profile, and family (cascade should handle children)
    await supabase.from('children').delete().eq('family_id', profile.family_id);
    await supabase.from('users').delete().eq('id', existingUser.id);
    await supabase.from('families').delete().eq('id', profile.family_id);
    console.log(`  Deleted family ${profile.family_id} and profile for ${email}`);
  } else {
    // Just delete orphan user profile if it exists
    await supabase.from('users').delete().eq('id', existingUser.id);
    console.log(`  Deleted orphan profile for ${email}`);
  }

  // Delete the auth user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
  if (deleteError) {
    console.error(`  Error deleting auth user ${email}: ${deleteError.message}`);
  } else {
    console.log(`  Deleted auth user ${email}`);
  }
}

// ─── Create Account ─────────────────────────────────────

async function createTestAccount(account: typeof TEST_ACCOUNTS[number]) {
  console.log(`\nCreating ${account.tier} account: ${account.email}`);

  // 1. Create auth user (email confirmed)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { name: account.userName },
  });

  if (authError) {
    console.error(`  Auth error: ${authError.message}`);
    return;
  }

  const userId = authData.user.id;
  console.log(`  Auth user created: ${userId}`);

  // 2. Create family record
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name: account.familyName,
      country: 'IE',
      county: account.county,
      family_style: account.familyStyle,
      subscription_tier: account.tier,
      subscription_status: 'active',
      onboarding_completed: true,
    })
    .select('id')
    .single();

  if (familyError) {
    console.error(`  Family error: ${familyError.message}`);
    return;
  }

  const familyId = family.id;
  console.log(`  Family created: ${familyId} (${account.familyName})`);

  // 3. Create user profile
  const { error: userError } = await supabase.from('users').insert({
    id: userId,
    family_id: familyId,
    name: account.userName,
    email: account.email,
    role: 'owner',
    notification_prefs: {
      morning_idea: true,
      weekend_plan: true,
      weekly_summary: true,
      community: true,
    },
  });

  if (userError) {
    console.error(`  User profile error: ${userError.message}`);
    return;
  }

  console.log(`  User profile created`);

  // 4. Create children
  const childInserts = account.children.map((child) => ({
    family_id: familyId,
    name: child.name,
    date_of_birth: child.dateOfBirth,
    interests: child.interests,
    school_status: child.schoolStatus,
    sen_flags: [],
    learning_style: null,
  }));

  const { error: childError } = await supabase.from('children').insert(childInserts);

  if (childError) {
    console.error(`  Children error: ${childError.message}`);
    return;
  }

  console.log(`  Children created: ${account.children.map((c) => c.name).join(', ')}`);
}

// ─── Main ───────────────────────────────────────────────

async function main() {
  console.log('=== The Hedge - Test Account Setup ===\n');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Step 1: Clean up existing test accounts
  console.log('\n--- Cleaning up existing test accounts ---');
  for (const account of TEST_ACCOUNTS) {
    await deleteExistingTestUser(account.email);
  }

  // Step 2: Create fresh test accounts
  console.log('\n--- Creating test accounts ---');
  for (const account of TEST_ACCOUNTS) {
    await createTestAccount(account);
  }

  // Step 3: Print credentials
  console.log('\n\n=== Test Account Credentials ===\n');
  console.log('All accounts use password: TestHedge2026!\n');
  console.log('+--------------------------+----------+----------+------------------+');
  console.log('| Email                    | Tier     | County   | Children         |');
  console.log('+--------------------------+----------+----------+------------------+');
  for (const account of TEST_ACCOUNTS) {
    const kids = account.children.map((c) => c.name).join(', ');
    console.log(
      `| ${account.email.padEnd(24)} | ${account.tier.padEnd(8)} | ${account.county.padEnd(8)} | ${kids.padEnd(16)} |`
    );
  }
  console.log('+--------------------------+----------+----------+------------------+');
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
