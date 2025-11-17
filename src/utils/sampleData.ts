
// This file is no longer needed as we're using the real Supabase database
// The sample data has been migrated to the database via SQL migrations

export const initializeSampleData = () => {
  // Check if data already exists
  if (localStorage.getItem('dataInitialized')) {
    return;
  }

  console.log('Sample data initialization skipped - using real database');
  localStorage.setItem('dataInitialized', 'true');
};
