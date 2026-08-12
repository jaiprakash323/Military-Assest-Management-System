import prisma from '../config/db.js';
import { createAuditLog } from '../middlewares/auditMiddleware.js';

/**
 * POST /api/expenditures
 * Record consumed assets (e.g., spent ammunition)
 */
export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, description, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || !description) {
      return res.status(400).json({
        message: 'baseId, equipmentTypeId, quantity, and description are required.',
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

    const expenditure = await prisma.expenditure.create({
      data: {
        baseId,
        equipmentTypeId,
        quantity,
        description,
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
      action: 'EXPENDITURE',
      entity: 'Expenditure',
      entityId: expenditure.id,
      details: `Expended ${quantity}x ${equipmentType.name} at ${base.name} - ${description}`,
    });

    res.status(201).json({ message: 'Expenditure recorded successfully', expenditure });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expenditure.', error: error.message });
  }
};

/**
 * GET /api/expenditures
 * List expenditures with optional filters
 */
export const getExpenditures = async (req, res) => {
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

    const [expenditures, total] = await Promise.all([
      prisma.expenditure.findMany({
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
      prisma.expenditure.count({ where }),
    ]);

    res.status(200).json({
      expenditures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenditures.', error: error.message });
  }
};
