#!/usr/bin/env node

require('dotenv').config();
const database = require('../database/connection');
const { seedData } = require('../seeds/seedData');

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing Mastersolis Infotech Database...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    await database.createIndexes();
    console.log('✅ Database indexes created');
    
    // Seed initial data
    await seedData();
    console.log('✅ Initial data seeded');
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@fwcit.com / admin123');
    console.log('HR: hr@fwchrms.com / HR@2024!');
    console.log('Manager: manager@fwcit.com / manager123');
    console.log('Employee: employee@fwcit.com / employee123');
    console.log('Candidate: candidate@fwcit.com / candidate123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
