'use server';

import { prisma } from '@/lib/db';
import { getSession, hasRole } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse').optional(),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  password: z.string().min(4, 'Passwort muss mindestens 4 Zeichen haben'),
  role: z.enum(['mitarbeiter', 'manager', 'admin'])
});

export async function createEmployee(data: {
  username: string;
  email?: string;
  name: string;
  password: string;
  role: string;
}) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nur Admins/Owner können Mitarbeiter erstellen');
    }

    const validatedData = createEmployeeSchema.parse(data);

    // Prüfen ob Username bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username }
    });

    if (existingUser) {
      return { success: false, error: 'Benutzername bereits vergeben' };
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Mitarbeiter erstellen
    const employee = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        name: validatedData.name,
        passwordHash: hashedPassword,
        role: validatedData.role,
        active: true
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'employee.create',
        details: `Mitarbeiter erstellt: ${employee.username} (${employee.role})`
      }
    });

    return { 
      success: true, 
      data: {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        active: employee.active
      }
    };
  } catch (error) {
    console.error('Fehler beim Erstellen des Mitarbeiters:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function updateEmployee(data: {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nur Admins/Owner können Mitarbeiter bearbeiten');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.active !== undefined) updateData.active = data.active;

    const employee = await prisma.user.update({
      where: { id: data.id },
      data: updateData
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'employee.update',
        details: `Mitarbeiter aktualisiert: ${employee.username}`
      }
    });

    return { 
      success: true, 
      data: {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        active: employee.active
      }
    };
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Mitarbeiters:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function deleteEmployee(employeeId: string) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nur Admins/Owner können Mitarbeiter löschen');
    }

    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return { success: false, error: 'Mitarbeiter nicht gefunden' };
    }

    await prisma.user.delete({
      where: { id: employeeId }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'employee.delete',
        details: `Mitarbeiter gelöscht: ${employee.username}`
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen des Mitarbeiters:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function getEmployees() {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nicht autorisiert');
    }

    const employees = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    return { success: true, data: employees };
  } catch (error) {
    console.error('Fehler beim Laden der Mitarbeiter:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function toggleEmployeeStatus(employeeId: string, newStatus: boolean) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nur Admins/Owner können Mitarbeiter-Status ändern');
    }

    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return { success: false, error: 'Mitarbeiter nicht gefunden' };
    }

    await prisma.user.update({
      where: { id: employeeId },
      data: { active: newStatus }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'employee.status_change',
        details: `Status geändert für: ${employee.username} -> ${newStatus ? 'Aktiv' : 'Inaktiv'}`
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Ändern des Status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function resetEmployeePassword(data: {
  employeeId: string;
  newPassword: string;
}) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin', 'owner'])) {
      throw new Error('Nur Admins/Owner können Passwörter zurücksetzen');
    }

    if (data.newPassword.length < 4) {
      return { success: false, error: 'Passwort muss mindestens 4 Zeichen haben' };
    }

    const employee = await prisma.user.findUnique({
      where: { id: data.employeeId }
    });

    if (!employee) {
      return { success: false, error: 'Mitarbeiter nicht gefunden' };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: data.employeeId },
      data: { passwordHash: hashedPassword }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'employee.password_reset',
        details: `Passwort zurückgesetzt für: ${employee.username}`
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Passworts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}