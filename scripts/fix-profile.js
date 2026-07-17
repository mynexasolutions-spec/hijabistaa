const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminProfile() {
  const email = 'hijabsitaa01@gmail.com';
  
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const existingUser = usersData?.users.find(u => u.email === email);
  
  if (existingUser) {
    console.log("Found user:", existingUser.id);
    const { error: insertError } = await supabase.from('profiles').upsert({
      id: existingUser.id,
      email: email,
      full_name: 'Admin',
      role: 'admin'
    });
    
    if (insertError) {
      console.error("Error upserting profile:", insertError);
    } else {
      console.log("Profile fixed successfully!");
    }
  } else {
    console.error("User not found.");
  }
}

fixAdminProfile();
