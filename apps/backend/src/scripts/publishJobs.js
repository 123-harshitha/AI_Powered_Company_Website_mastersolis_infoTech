require('dotenv').config();
const database = require('../database/connection');

const publishJobs = async () => {
  try {
    console.log('🚀 Publishing job postings...');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected successfully');

    // Get all job postings
    const jobPostings = await database.find('job_postings', {});
    console.log(`📋 Found ${jobPostings.length} job postings`);

    if (jobPostings.length === 0) {
      console.log('❌ No job postings found. Please run seed data first.');
      return;
    }

    // Update all job postings to PUBLISHED status
    const updateResult = await database.updateMany(
      'job_postings',
      {},
      {
        $set: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Published ${updateResult.modifiedCount} job postings`);

    // Verify the update
    const publishedJobs = await database.find('job_postings', { status: 'PUBLISHED' });
    console.log(`📊 Total published jobs: ${publishedJobs.length}`);

    // Show some examples
    console.log('\n📋 Published Job Postings:');
    publishedJobs.slice(0, 5).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.department} (${job.status})`);
    });

    console.log('\n🎉 Job publishing completed successfully!');
    console.log('Candidates should now be able to see and apply for jobs.');

  } catch (error) {
    console.error('❌ Error publishing jobs:', error);
  } finally {
    await database.close();
  }
};

// Run the script
publishJobs();
