require('dotenv').config();
const bcrypt = require('bcrypt');
const database = require('../database/connection');

const createMissingUsers = async () => {
  try {
    console.log('🌱 Creating missing test users...');
    
    // Connect to database first
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected successfully');

    // Create missing users
    console.log('👥 Creating missing users...');
    
    const users = [
      {
        email: 'manager@fwcit.com',
        username: 'manager',
        password: await bcrypt.hash('manager123', 12),
        role: 'MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'employee@fwcit.com',
        username: 'employee',
        password: await bcrypt.hash('employee123', 12),
        role: 'EMPLOYEE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'vishnu.h.s007@gmail.com',
        username: 'vishnu_candidate',
        password: await bcrypt.hash('Alchem@1996', 12),
        role: 'CANDIDATE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check if users already exist
    for (const user of users) {
      const existingUser = await database.findOne('users', { email: user.email });
      if (existingUser) {
        console.log(`⏭️ User ${user.email} already exists, skipping...`);
        continue;
      }

      // Insert user
      const userResult = await database.insertOne('users', user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);

      // Create employee records for MANAGER and EMPLOYEE roles
      if (user.role === 'MANAGER' || user.role === 'EMPLOYEE') {
        const employeeData = {
          userId: userResult.insertedId,
          firstName: user.role === 'MANAGER' ? 'Manager' : 'Employee',
          lastName: 'User',
          position: user.role === 'MANAGER' ? 'Team Manager' : 'Software Developer',
          department: 'Information Technology',
          hireDate: new Date(),
          isActive: true,
          isOnProbation: user.role === 'EMPLOYEE',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await database.insertOne('employees', employeeData);
        console.log(`✅ Created employee record for: ${user.email}`);
      }

      // Create candidate record for CANDIDATE role
      if (user.role === 'CANDIDATE') {
        const candidateData = {
          userId: userResult.insertedId,
          firstName: 'Vishnu',
          lastName: 'H S',
          email: user.email,
          phone: '+1234567890',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await database.insertOne('candidates', candidateData);
        console.log(`✅ Created candidate record for: ${user.email}`);
      }
    }

    console.log('\n🎉 Missing users creation completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Manager: manager@fwcit.com / manager123');
    console.log('Employee: employee@fwcit.com / employee123');
    console.log('Candidate: vishnu.h.s007@gmail.com / Alchem@1996');

    // Disconnect from database
    await database.disconnect();
    console.log('🔌 Database disconnected');

  } catch (error) {
    console.error('❌ Error creating missing users:', error);
    // Try to disconnect even if there was an error
    try {
      await database.disconnect();
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from database:', disconnectError);
    }
    throw error;
  }
};

module.exports = { createMissingUsers };

// Run if called directly
if (require.main === module) {
  createMissingUsers();
}
