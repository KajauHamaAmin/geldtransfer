import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // Prüfen ob bereits ein Owner existiert
  const existingOwner = await prisma.user.findFirst({ 
    where: { role: 'owner' }
  });
  
  if (existingOwner) {
    console.log('✅ Owner bereits vorhanden, überspringe Seeding');
    return;
  }

  // Owner erstellen
  const ownerPassword = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.create({
    data: {
      username: 'owner',
      name: 'Inhaber',
      role: 'owner',
      passwordHash: ownerPassword,
      active: true,
    },
  });
  console.log('✅ Owner erstellt: username=owner, password=Admin@1234');

  // Manager erstellen
  const managerPassword = await bcrypt.hash('Manager@1234', 10);
  await prisma.user.create({
    data: {
      username: 'manager',
      name: 'Manager',
      role: 'manager',
      passwordHash: managerPassword,
      active: true,
    },
  });
  console.log('✅ Manager erstellt: username=manager, password=Manager@1234');

  // Mitarbeiter erstellen
  const mitarbeiterPassword = await bcrypt.hash('Mitarbeiter@1234', 10);
  await prisma.user.create({
    data: {
      username: 'mitarbeiter',
      name: 'Mitarbeiter',
      role: 'mitarbeiter',
      passwordHash: mitarbeiterPassword,
      active: true,
    },
  });
  console.log('✅ Mitarbeiter erstellt: username=mitarbeiter, password=Mitarbeiter@1234');

  console.log('🎉 Seeding abgeschlossen!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Fehler beim Seeding:', e);
    process.exit(1);
  });
