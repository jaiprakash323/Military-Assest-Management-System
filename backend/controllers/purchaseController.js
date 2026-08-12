import prisma from '../config/db.js';
import { createAuditLog } from '../middlewares/auditMiddleware.js';

/**
 * POST /api/purchases
 * Create a new purchase (add stock to a base)
 */
export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, and quantity are required.' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    // Verify base and equipment type exist
    const [base, equipmentType] = await Promise.all([
      prisma.base.findUnique({ where: { id: baseId } }),
      prisma.equipmentType.findUnique({ where: { id: equipmentTypeId } }),
    ]);

    if (!base) return res.status(404).json({ message: 'Base not found.' });
    if (!equipmentType) return res.status(404).json({ message: 'Equipment type not found.' });

    const purchase = await prisma.purchase.create({
      data: {
        baseId,
        equipmentTypeId,
        quantity,
        date: date ? new Date(date) : new Date(),
        createdBy: userId,
      },
      include: {
        base: true,
        equipmentType: true,
        user: { select: { id: true, username: true } },
      },
    });

    // Audit log
    await createAuditLog({
      userId,
      action: 'PURCHASE',
      entity: 'Purchase',
      entityId: purchase.id,
      details: `Purchased ${quantity}x ${equipmentType.name} for ${base.name}`,
    });

    res.status(201).json({ message: 'Purchase recorded successfully', purchase });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create purchase.', error: error.message });
  }
};

/**
 * GET /api/purchases
 * List purchases with optional filters
 */
export const getPurchases = async (req, res) => {
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

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
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
      prisma.purchase.count({ where }),
    ]);

    res.status(200).json({
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch purchases.', error: error.message });
  }
};
