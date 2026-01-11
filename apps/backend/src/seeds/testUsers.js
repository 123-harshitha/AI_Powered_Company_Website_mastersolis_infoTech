const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const employeePassword = await bcrypt.hash('employee123', 12);

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    // Create employee user
    const employeeUser = await prisma.user.upsert({
      where: { email: 'employee@example.com' },
      update: {},
      create: {
        email: 'employee@example.com',
        username: 'employee',
        password: employeePassword,
        role: 'EMPLOYEE',
        isActive: true
      }
    });

    // Create employee records
    await prisma.employee.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        firstName: 'Admin',
        lastName: 'User',
        position: 'System Administrator',
        hireDate: new Date(),
        isActive: true,
        isOnProbation: false
      }
    });

    await prisma.employee.upsert({
      where: { userId: employeeUser.id },
      update: {},
      create: {
        userId: employeeUser.id,
        firstName: 'John',
        lastName: 'Doe',
        position: 'Software Developer',
        hireDate: new Date(),
        isActive: true,
        isOnProbation: false
      }
    });

    console.log('Test users created successfully!');
    console.log('Admin: admin@example.com / admin123');
    console.log('Employee: employee@example.com / employee123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers();
}

module.exports = createTestUsers;
