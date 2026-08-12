import prisma from '../config/db.js';
import { createAuditLog } from '../middlewares/auditMiddleware.js';

/**
 * POST /api/assignments
 * Assign equipment to personnel
 */
export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || !assignedTo) {
      return res.status(400).json({
        message: 'baseId, equipmentTypeId, quantity, and assignedTo are required.',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    // Verify entities exist
    const [base, equipmentType] = await Promise.all([
      prisma.base.findUnique({ where: { id: baseId } }),
      prisma.equipmentType.findUnique({ where: { id: equipmentTypeId } }),
    ]);

    if (!base) return res.status(404).json({ message: 'Base not found.' });
    if (!equipmentType) return res.status(404).json({ message: 'Equipment type not found.' });

    const assignment = await prisma.assignment.create({
      data: {
        baseId,
        equipmentTypeId,
        quantity,
        assignedTo,
        date: date ? new Date(date) : new Date(),
        createdBy: userId,
      },
      include: {
        base: true,
        equipmentType: true,
        user: { select: { id: true, username: true } },
      },
    });

    await createAuditLog({
      userId,
      action: 'ASSIGNMENT',
      entity: 'Assignment',
      entityId: assignment.id,
      details: `Assigned ${quantity}x ${equipmentType.name} to ${assignedTo} at ${base.name}`,
    });

    res.status(201).json({ message: 'Assignment recorded successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create assignment.', error: error.message });
  }
};

/**
 * GET /api/assignments
 * List assignments with optional filters
 */
export const getAssignments = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {};
    if (baseId) where.baseId = parseInt(baseId);
    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          base: true,
          equipmentType: true,
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.assignment.count({ where }),
    ]);

    res.status(200).json({
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assignments.', error: error.message });
  }
};
