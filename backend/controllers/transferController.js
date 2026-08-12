import prisma from '../config/db.js';
import { createAuditLog } from '../middlewares/auditMiddleware.js';

/**
 * POST /api/transfers
 * Create an atomic transfer between two bases using Prisma transactions.
 * Validates sufficient stock at source base before proceeding.
 */
export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!sourceBaseId || !destBaseId || !equipmentTypeId || !quantity) {
      return res.status(400).json({
        message: 'sourceBaseId, destBaseId, equipmentTypeId, and quantity are required.',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    if (sourceBaseId === destBaseId) {
      return res.status(400).json({ message: 'Source and destination bases must be different.' });
    }

    // Verify all entities exist
    const [sourceBase, destBase, equipmentType] = await Promise.all([
      prisma.base.findUnique({ where: { id: sourceBaseId } }),
      prisma.base.findUnique({ where: { id: destBaseId } }),
      prisma.equipmentType.findUnique({ where: { id: equipmentTypeId } }),
    ]);

    if (!sourceBase) return res.status(404).json({ message: 'Source base not found.' });
    if (!destBase) return res.status(404).json({ message: 'Destination base not found.' });
    if (!equipmentType) return res.status(404).json({ message: 'Equipment type not found.' });

    // Calculate current stock at source base
    const [purchaseSum, transferInSum, transferOutSum, assignmentSum, expenditureSum] = await Promise.all([
      prisma.purchase.aggregate({
        where: { baseId: sourceBaseId, equipmentTypeId },
        _sum: { quantity: true },
      }),
      prisma.transfer.aggregate({
        where: { destBaseId: sourceBaseId, equipmentTypeId, status: 'COMPLETED' },
        _sum: { quantity: true },
      }),
      prisma.transfer.aggregate({
        where: { sourceBaseId, equipmentTypeId, status: 'COMPLETED' },
        _sum: { quantity: true },
      }),
      prisma.assignment.aggregate({
        where: { baseId: sourceBaseId, equipmentTypeId },
        _sum: { quantity: true },
      }),
      prisma.expenditure.aggregate({
        where: { baseId: sourceBaseId, equipmentTypeId },
        _sum: { quantity: true },
      }),
    ]);

    const currentStock =
      (purchaseSum._sum.quantity || 0) +
      (transferInSum._sum.quantity || 0) -
      (transferOutSum._sum.quantity || 0) -
      (assignmentSum._sum.quantity || 0) -
      (expenditureSum._sum.quantity || 0);

    if (currentStock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock at ${sourceBase.name}. Available: ${currentStock}, Requested: ${quantity}`,
      });
    }

    // Atomic transaction: create transfer + audit log
    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          sourceBaseId,
          destBaseId,
          equipmentTypeId,
          quantity,
          status: 'COMPLETED',
          initiatedBy: userId,
        },
        include: {
          sourceBase: true,
          destBase: true,
          equipmentType: true,
          user: { select: { id: true, username: true } },
        },
      });

      await createAuditLog({
        userId,
        action: 'TRANSFER',
        entity: 'Transfer',
        entityId: transfer.id,
        details: `Transferred ${quantity}x ${equipmentType.name} from ${sourceBase.name} to ${destBase.name}`,
        tx,
      });

      return transfer;
    });

    res.status(201).json({ message: 'Transfer completed successfully', transfer: result });
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed.', error: error.message });
  }
};

/**
 * GET /api/transfers
 * List transfers with optional filters
 */
export const getTransfers = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {};

    // For base scoping: show transfers where the base is either source or destination
    if (baseId) {
      where.OR = [
        { sourceBaseId: parseInt(baseId) },
        { destBaseId: parseInt(baseId) },
      ];
    }

    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId);
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          sourceBase: true,
          destBase: true,
          equipmentType: true,
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transfer.count({ where }),
    ]);

    res.status(200).json({
      transfers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transfers.', error: error.message });
  }
};

/**
 * PATCH /api/transfers/:id/status
 * Update transfer status
 */
export const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const transfer = await prisma.transfer.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        sourceBase: true,
        destBase: true,
        equipmentType: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'TRANSFER_STATUS_UPDATE',
      entity: 'Transfer',
      entityId: transfer.id,
      details: `Transfer #${transfer.id} status updated to ${status}`,
    });

    res.status(200).json({ message: 'Transfer status updated', transfer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transfer.', error: error.message });
  }
};
