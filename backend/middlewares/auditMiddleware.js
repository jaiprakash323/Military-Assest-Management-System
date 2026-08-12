import prisma from '../config/db.js';

/**
 * Creates an audit log entry for tracking mutations.
 * @param {object} params
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Action type (PURCHASE, TRANSFER, ASSIGNMENT, EXPENDITURE)
 * @param {string} params.entity - Entity name (Purchase, Transfer, etc.)
 * @param {number} params.entityId - ID of the affected entity
 * @param {string} params.details - Human-readable description
 * @param {object} [params.tx] - Optional Prisma transaction client
 */
export const createAuditLog = async ({ userId, action, entity, entityId, details, tx }) => {
  const client = tx || prisma;
  
  try {
    await client.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Audit logging failures should not break the main operation
    // unless within a transaction (which will naturally propagate)
    if (tx) throw error;
  }
};
