require('dotenv').config();
const bcrypt = require('bcrypt');
const database = require('../database/connection');

async function upsertUser(user) {
  const existing = await database.findOne('users', { email: user.email });
  const hashed = await bcrypt.hash(user.password, 12);
  const base = {
    email: user.email,
    username: user.username,
    password: hashed,
    role: user.role,
    isActive: true,
    updatedAt: new Date()
  };

  if (!existing) {
    const toInsert = { ...base, createdAt: new Date() };
    const result = await database.insertOne('users', toInsert);
    return { _id: result.insertedId, isNew: true };
  }

  await database.updateOne('users', { _id: existing._id }, { $set: base });
  return { _id: existing._id, isNew: false };
}

async function ensureEmployeeRecord(userId, data) {
  const existing = await database.findOne('employees', { userId });
  if (existing) return;
  await database.insertOne('employees', {
    userId,
    firstName: data.firstName,
    lastName: data.lastName,
    position: data.position,
    department: data.department || null,
    hireDate: new Date(),
    isActive: true,
    isOnProbation: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

async function ensureCandidateRecord(userId, data) {
  const existing = await database.findOne('candidates', { userId });
  if (existing) return;
  await database.insertOne('candidates', {
    userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '+10000000000',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

async function run() {
  try {
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Connected');

    const demoUsers = [
      { email: 'admin@fwcit.com', username: 'admin', password: 'admin123', role: 'ADMIN', firstName: 'Admin', lastName: 'User', position: 'System Administrator', department: 'Information Technology' },
      { email: 'hr@fwchrms.com', username: 'hr_manager', password: 'HR@2024!', role: 'HR', firstName: 'HR', lastName: 'Manager', position: 'HR Manager', department: 'Human Resources' },
      { email: 'manager@fwcit.com', username: 'manager', password: 'manager123', role: 'MANAGER', firstName: 'Manager', lastName: 'User', position: 'Team Manager', department: 'Information Technology' },
      { email: 'employee@fwcit.com', username: 'employee', password: 'employee123', role: 'EMPLOYEE', firstName: 'John', lastName: 'Doe', position: 'Software Developer', department: 'Information Technology' },
      { email: 'candidate.demo@fwc.com', username: 'candidate_demo', password: 'candidate123', role: 'CANDIDATE', firstName: 'Demo', lastName: 'Candidate' }
    ];

    for (const du of demoUsers) {
      const { _id, isNew } = await upsertUser(du);
      console.log(`${isNew ? '➕ Created' : '♻️ Updated'} ${du.role}: ${du.email}`);
      if (du.role === 'MANAGER' || du.role === 'EMPLOYEE' || du.role === 'HR' || du.role === 'ADMIN') {
        await ensureEmployeeRecord(_id, du);
      }
      if (du.role === 'CANDIDATE') {
        await ensureCandidateRecord(_id, du);
      }
    }

    console.log('\n📋 Updated Demo Credentials:');
    console.log('Admin:    admin@fwcit.com / admin123');
    console.log('HR:       hr@fwchrms.com / HR@2024!');
    console.log('Manager:  manager@fwcit.com / manager123');
    console.log('Employee: employee@fwcit.com / employee123');
    console.log('Candidate: candidate.demo@fwc.com / candidate123');

  } catch (err) {
    console.error('❌ Failed to update demo users:', err);
    process.exitCode = 1;
  } finally {
    await database.disconnect();
    console.log('🔌 Disconnected');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };


