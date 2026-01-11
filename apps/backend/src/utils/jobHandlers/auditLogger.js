// Audit logging job handler
const { PrismaClient } = require('@prisma/client');

const logAudit = async (jobData) => {
  const { action, entity, entityId, userId, details, ipAddress, userAgent } = jobData;
  
  try {
    console.log(`Audit log: ${action} on ${entity} ${entityId}`);
    
    const prisma = new PrismaClient();
    
    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
        userAgent,
        timestamp: new Date()
      }
    });

    await prisma.$disconnect();

    // Log to console for debugging
    console.log(`Audit entry created: ${auditLog.id}`);
    
    return {
      success: true,
      auditLogId: auditLog.id,
      timestamp: auditLog.timestamp
    };

  } catch (error) {
    console.error('Audit logging failed:', error);
    throw error;
  }
};

module.exports = logAudit;
