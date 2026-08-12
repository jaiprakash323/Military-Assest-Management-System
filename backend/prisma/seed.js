import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Clean existing data ───────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  console.log('🗑️  Cleared existing data');

  // ─── Bases ─────────────────────────────────────────────────────
  const bases = await Promise.all([
    prisma.base.create({
      data: { name: 'Alpha Command', location: 'Fort Liberty, North Carolina' },
    }),
    prisma.base.create({
      data: { name: 'Bravo Outpost', location: 'Camp Pendleton, California' },
    }),
    prisma.base.create({
      data: { name: 'Charlie Forward Base', location: 'Joint Base Lewis-McChord, Washington' },
    }),
  ]);

  console.log(`✅ Created ${bases.length} bases`);

  // ─── Equipment Types ───────────────────────────────────────────
  const equipmentTypes = await Promise.all([
    // Weapons
    prisma.equipmentType.create({ data: { name: 'M4 Carbine', category: 'WEAPON' } }),
    prisma.equipmentType.create({ data: { name: 'M249 SAW', category: 'WEAPON' } }),
    prisma.equipmentType.create({ data: { name: 'M24 Sniper Rifle', category: 'WEAPON' } }),
    // Vehicles
    prisma.equipmentType.create({ data: { name: 'HMMWV (Humvee)', category: 'VEHICLE' } }),
    prisma.equipmentType.create({ data: { name: 'M1 Abrams Tank', category: 'VEHICLE' } }),
    prisma.equipmentType.create({ data: { name: 'MRAP', category: 'VEHICLE' } }),
    // Ammunition
    prisma.equipmentType.create({ data: { name: '5.56mm NATO Rounds', category: 'AMMUNITION' } }),
    prisma.equipmentType.create({ data: { name: '7.62mm NATO Rounds', category: 'AMMUNITION' } }),
  ]);

  console.log(`✅ Created ${equipmentTypes.length} equipment types`);

  // ─── Users ─────────────────────────────────────────────────────
  const hashedPasswords = {
    admin: await bcrypt.hash('admin123', 12),
    commander: await bcrypt.hash('cmd123', 12),
    logistics: await bcrypt.hash('log123', 12),
  };

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: hashedPasswords.admin,
        role: 'ADMIN',
        baseId: null,
      },
    }),
    prisma.user.create({
      data: {
        username: 'commander_alpha',
        passwordHash: hashedPasswords.commander,
        role: 'BASE_COMMANDER',
        baseId: bases[0].id,
      },
    }),
    prisma.user.create({
      data: {
        username: 'logistics_officer',
        passwordHash: hashedPasswords.logistics,
        role: 'LOGISTICS_OFFICER',
        baseId: bases[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ─── Sample Purchases ──────────────────────────────────────────
  const purchaseDates = [
    new Date('2024-12-01'),
    new Date('2025-01-15'),
    new Date('2025-02-10'),
    new Date('2025-03-05'),
    new Date('2025-04-20'),
    new Date('2025-05-12'),
  ];

  const purchases = await Promise.all([
    // Alpha Command purchases
    prisma.purchase.create({
      data: { baseId: bases[0].id, equipmentTypeId: equipmentTypes[0].id, quantity: 200, date: purchaseDates[0], createdBy: users[2].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[0].id, equipmentTypeId: equipmentTypes[6].id, quantity: 50000, date: purchaseDates[1], createdBy: users[2].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[0].id, equipmentTypeId: equipmentTypes[3].id, quantity: 15, date: purchaseDates[2], createdBy: users[2].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[0].id, equipmentTypeId: equipmentTypes[4].id, quantity: 5, date: purchaseDates[3], createdBy: users[2].id },
    }),
    // Bravo Outpost purchases
    prisma.purchase.create({
      data: { baseId: bases[1].id, equipmentTypeId: equipmentTypes[0].id, quantity: 150, date: purchaseDates[0], createdBy: users[0].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[1].id, equipmentTypeId: equipmentTypes[7].id, quantity: 30000, date: purchaseDates[1], createdBy: users[0].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[1].id, equipmentTypeId: equipmentTypes[5].id, quantity: 8, date: purchaseDates[4], createdBy: users[0].id },
    }),
    // Charlie Forward Base purchases
    prisma.purchase.create({
      data: { baseId: bases[2].id, equipmentTypeId: equipmentTypes[1].id, quantity: 50, date: purchaseDates[2], createdBy: users[0].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[2].id, equipmentTypeId: equipmentTypes[6].id, quantity: 25000, date: purchaseDates[3], createdBy: users[0].id },
    }),
    prisma.purchase.create({
      data: { baseId: bases[2].id, equipmentTypeId: equipmentTypes[3].id, quantity: 10, date: purchaseDates[5], createdBy: users[0].id },
    }),
  ]);

  console.log(`✅ Created ${purchases.length} purchases`);

  // ─── Sample Transfers ──────────────────────────────────────────
  const transfers = await Promise.all([
    prisma.transfer.create({
      data: {
        sourceBaseId: bases[0].id, destBaseId: bases[1].id,
        equipmentTypeId: equipmentTypes[0].id, quantity: 30,
        status: 'COMPLETED', initiatedBy: users[2].id,
      },
    }),
    prisma.transfer.create({
      data: {
        sourceBaseId: bases[1].id, destBaseId: bases[2].id,
        equipmentTypeId: equipmentTypes[7].id, quantity: 5000,
        status: 'COMPLETED', initiatedBy: users[0].id,
      },
    }),
    prisma.transfer.create({
      data: {
        sourceBaseId: bases[0].id, destBaseId: bases[2].id,
        equipmentTypeId: equipmentTypes[3].id, quantity: 3,
        status: 'IN_TRANSIT', initiatedBy: users[2].id,
      },
    }),
    prisma.transfer.create({
      data: {
        sourceBaseId: bases[2].id, destBaseId: bases[0].id,
        equipmentTypeId: equipmentTypes[1].id, quantity: 10,
        status: 'COMPLETED', initiatedBy: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${transfers.length} transfers`);

  // ─── Sample Assignments ────────────────────────────────────────
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        baseId: bases[0].id, equipmentTypeId: equipmentTypes[0].id,
        quantity: 25, assignedTo: 'Sgt. James Mitchell', createdBy: users[1].id,
      },
    }),
    prisma.assignment.create({
      data: {
        baseId: bases[0].id, equipmentTypeId: equipmentTypes[3].id,
        quantity: 2, assignedTo: '3rd Platoon', createdBy: users[1].id,
      },
    }),
    prisma.assignment.create({
      data: {
        baseId: bases[1].id, equipmentTypeId: equipmentTypes[0].id,
        quantity: 40, assignedTo: 'Alpha Company', createdBy: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${assignments.length} assignments`);

  // ─── Sample Expenditures ───────────────────────────────────────
  const expenditures = await Promise.all([
    prisma.expenditure.create({
      data: {
        baseId: bases[0].id, equipmentTypeId: equipmentTypes[6].id,
        quantity: 5000, description: 'Live-fire training exercise - Week 12',
        createdBy: users[1].id,
      },
    }),
    prisma.expenditure.create({
      data: {
        baseId: bases[1].id, equipmentTypeId: equipmentTypes[7].id,
        quantity: 2000, description: 'Qualification range training',
        createdBy: users[0].id,
      },
    }),
    prisma.expenditure.create({
      data: {
        baseId: bases[2].id, equipmentTypeId: equipmentTypes[6].id,
        quantity: 3000, description: 'Combat readiness drill',
        createdBy: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${expenditures.length} expenditures`);

  // ─── Sample Audit Logs ─────────────────────────────────────────
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: users[2].id, action: 'PURCHASE', entity: 'Purchase',
        entityId: purchases[0].id,
        details: 'Purchased 200x M4 Carbine for Alpha Command',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[2].id, action: 'TRANSFER', entity: 'Transfer',
        entityId: transfers[0].id,
        details: 'Transferred 30x M4 Carbine from Alpha Command to Bravo Outpost',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[1].id, action: 'ASSIGNMENT', entity: 'Assignment',
        entityId: assignments[0].id,
        details: 'Assigned 25x M4 Carbine to Sgt. James Mitchell at Alpha Command',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[1].id, action: 'EXPENDITURE', entity: 'Expenditure',
        entityId: expenditures[0].id,
        details: 'Expended 5000x 5.56mm NATO Rounds - Live-fire training at Alpha Command',
      },
    }),
  ]);

  console.log(`✅ Created ${auditLogs.length} audit log entries`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('─────────────────────────────────────────');
  console.log('Admin:              admin / admin123');
  console.log('Base Commander:     commander_alpha / cmd123');
  console.log('Logistics Officer:  logistics_officer / log123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
