import prisma from '../config/db.js';

/**
 * GET /api/assets/dashboard
 * Dynamic inventory calculation:
 * Closing = Opening + Purchases + TransfersIn - TransfersOut - Assigned - Expended
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;

    const baseFilter = baseId ? parseInt(baseId) : undefined;
    const equipFilter = equipmentTypeId ? parseInt(equipmentTypeId) : undefined;

    // Date filters
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Opening balance: everything BEFORE the startDate
    let openingBalance = 0;
    if (startDate) {
      const openingDate = new Date(startDate);

      const [openPurchases, openTransfersIn, openTransfersOut, openAssigned, openExpended] = await Promise.all([
        prisma.purchase.aggregate({
          where: {
            ...(baseFilter && { baseId: baseFilter }),
            ...(equipFilter && { equipmentTypeId: equipFilter }),
            date: { lt: openingDate },
          },
          _sum: { quantity: true },
        }),
        prisma.transfer.aggregate({
          where: {
            ...(baseFilter && { destBaseId: baseFilter }),
            ...(equipFilter && { equipmentTypeId: equipFilter }),
            status: 'COMPLETED',
            createdAt: { lt: openingDate },
          },
          _sum: { quantity: true },
        }),
        prisma.transfer.aggregate({
          where: {
            ...(baseFilter && { sourceBaseId: baseFilter }),
            ...(equipFilter && { equipmentTypeId: equipFilter }),
            status: 'COMPLETED',
            createdAt: { lt: openingDate },
          },
          _sum: { quantity: true },
        }),
        prisma.assignment.aggregate({
          where: {
            ...(baseFilter && { baseId: baseFilter }),
            ...(equipFilter && { equipmentTypeId: equipFilter }),
            date: { lt: openingDate },
          },
          _sum: { quantity: true },
        }),
        prisma.expenditure.aggregate({
          where: {
            ...(baseFilter && { baseId: baseFilter }),
            ...(equipFilter && { equipmentTypeId: equipFilter }),
            date: { lt: openingDate },
          },
          _sum: { quantity: true },
        }),
      ]);

      openingBalance =
        (openPurchases._sum.quantity || 0) +
        (openTransfersIn._sum.quantity || 0) -
        (openTransfersOut._sum.quantity || 0) -
        (openAssigned._sum.quantity || 0) -
        (openExpended._sum.quantity || 0);
    }

    // Current period aggregations
    const purchaseWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipFilter && { equipmentTypeId: equipFilter }),
      ...(hasDateFilter && { date: dateFilter }),
    };

    const transferInWhere = {
      ...(baseFilter && { destBaseId: baseFilter }),
      ...(equipFilter && { equipmentTypeId: equipFilter }),
      status: 'COMPLETED',
      ...(hasDateFilter && { createdAt: dateFilter }),
    };

    const transferOutWhere = {
      ...(baseFilter && { sourceBaseId: baseFilter }),
      ...(equipFilter && { equipmentTypeId: equipFilter }),
      status: 'COMPLETED',
      ...(hasDateFilter && { createdAt: dateFilter }),
    };

    const assignmentWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipFilter && { equipmentTypeId: equipFilter }),
      ...(hasDateFilter && { date: dateFilter }),
    };

    const expenditureWhere = {
      ...(baseFilter && { baseId: baseFilter }),
      ...(equipFilter && { equipmentTypeId: equipFilter }),
      ...(hasDateFilter && { date: dateFilter }),
    };

    const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
      prisma.purchase.aggregate({ where: purchaseWhere, _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferInWhere, _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferOutWhere, _sum: { quantity: true } }),
      prisma.assignment.aggregate({ where: assignmentWhere, _sum: { quantity: true } }),
      prisma.expenditure.aggregate({ where: expenditureWhere, _sum: { quantity: true } }),
    ]);

    const totalPurchases = purchases._sum.quantity || 0;
    const totalTransfersIn = transfersIn._sum.quantity || 0;
    const totalTransfersOut = transfersOut._sum.quantity || 0;
    const totalAssigned = assigned._sum.quantity || 0;
    const totalExpended = expended._sum.quantity || 0;

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
    const closingBalance = openingBalance + netMovement - totalAssigned - totalExpended;

    res.status(200).json({
      openingBalance,
      purchases: totalPurchases,
      transfersIn: totalTransfersIn,
      transfersOut: totalTransfersOut,
      netMovement,
      assigned: totalAssigned,
      expended: totalExpended,
      closingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate metrics.', error: error.message });
  }
};

/**
 * GET /api/assets/chart-data
 * Monthly time-series data for dashboard charts
 */
export const getChartData = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const baseFilter = baseId ? parseInt(baseId) : undefined;
    const equipFilter = equipmentTypeId ? parseInt(equipmentTypeId) : undefined;

    // Get last 6 months of data
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        start: date,
        end: endDate,
      });
    }

    const chartData = await Promise.all(
      months.map(async (month) => {
        const dateRange = { gte: month.start, lte: month.end };

        const [purchases, transfersIn, transfersOut, expended] = await Promise.all([
          prisma.purchase.aggregate({
            where: {
              ...(baseFilter && { baseId: baseFilter }),
              ...(equipFilter && { equipmentTypeId: equipFilter }),
              date: dateRange,
            },
            _sum: { quantity: true },
          }),
          prisma.transfer.aggregate({
            where: {
              ...(baseFilter && { destBaseId: baseFilter }),
              ...(equipFilter && { equipmentTypeId: equipFilter }),
              status: 'COMPLETED',
              createdAt: dateRange,
            },
            _sum: { quantity: true },
          }),
          prisma.transfer.aggregate({
            where: {
              ...(baseFilter && { sourceBaseId: baseFilter }),
              ...(equipFilter && { equipmentTypeId: equipFilter }),
              status: 'COMPLETED',
              createdAt: dateRange,
            },
            _sum: { quantity: true },
          }),
          prisma.expenditure.aggregate({
            where: {
              ...(baseFilter && { baseId: baseFilter }),
              ...(equipFilter && { equipmentTypeId: equipFilter }),
              date: dateRange,
            },
            _sum: { quantity: true },
          }),
        ]);

        return {
          month: month.label,
          purchases: purchases._sum.quantity || 0,
          transfersIn: transfersIn._sum.quantity || 0,
          transfersOut: transfersOut._sum.quantity || 0,
          expended: expended._sum.quantity || 0,
        };
      })
    );

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chart data.', error: error.message });
  }
};

/**
 * GET /api/assets/bases
 * List all bases
 */
export const getBases = async (req, res) => {
  try {
    const bases = await prisma.base.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(bases);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bases.', error: error.message });
  }
};

/**
 * GET /api/assets/equipment-types
 * List all equipment types
 */
export const getEquipmentTypes = async (req, res) => {
  try {
    const equipmentTypes = await prisma.equipmentType.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.status(200).json(equipmentTypes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch equipment types.', error: error.message });
  }
};

/**
 * GET /api/assets/audit-logs
 * List audit trail entries (Admin only)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { action, userId, startDate, endDate, page = 1, limit = 30 } = req.query;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs.', error: error.message });
  }
};

/**
 * GET /api/assets/inventory-by-base
 * Get inventory summary grouped by base and equipment type
 */
export const getInventoryByBase = async (req, res) => {
  try {
    const { baseId } = req.query;

    const bases = baseId
      ? await prisma.base.findMany({ where: { id: parseInt(baseId) } })
      : await prisma.base.findMany();

    const equipmentTypes = await prisma.equipmentType.findMany();

    const inventory = await Promise.all(
      bases.map(async (base) => {
        const items = await Promise.all(
          equipmentTypes.map(async (equip) => {
            const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
              prisma.purchase.aggregate({
                where: { baseId: base.id, equipmentTypeId: equip.id },
                _sum: { quantity: true },
              }),
              prisma.transfer.aggregate({
                where: { destBaseId: base.id, equipmentTypeId: equip.id, status: 'COMPLETED' },
                _sum: { quantity: true },
              }),
              prisma.transfer.aggregate({
                where: { sourceBaseId: base.id, equipmentTypeId: equip.id, status: 'COMPLETED' },
                _sum: { quantity: true },
              }),
              prisma.assignment.aggregate({
                where: { baseId: base.id, equipmentTypeId: equip.id },
                _sum: { quantity: true },
              }),
              prisma.expenditure.aggregate({
                where: { baseId: base.id, equipmentTypeId: equip.id },
                _sum: { quantity: true },
              }),
            ]);

            const stock =
              (purchases._sum.quantity || 0) +
              (transfersIn._sum.quantity || 0) -
              (transfersOut._sum.quantity || 0) -
              (assigned._sum.quantity || 0) -
              (expended._sum.quantity || 0);

            return {
              equipmentTypeId: equip.id,
              equipmentName: equip.name,
              category: equip.category,
              currentStock: stock,
            };
          })
        );

        return {
          baseId: base.id,
          baseName: base.name,
          location: base.location,
          items: items.filter((item) => item.currentStock !== 0),
        };
      })
    );

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory.', error: error.message });
  }
};
