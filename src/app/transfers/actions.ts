'use server';

import { prisma } from '@/lib/db';
import { getSession, hasRole } from '@/lib/session';
import { transferSchema, cancelSchema, deleteSchema, filterSchema } from '@/lib/validations/transfers';
import { Decimal } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';

export async function createTransfer(formData: FormData) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['mitarbeiter','manager','admin','owner'])) {
      throw new Error('Forbidden');
    }

    const rawData = {
      provider: formData.get('provider'),
      type: formData.get('type'),
      amount: formData.get('amount'),
      fee: formData.get('fee'),
      reference: formData.get('reference')
    };

    const data = transferSchema.parse(rawData);
    
    const transfer = await prisma.moneyTransfer.create({
      data: {
        provider: data.provider,
        type: data.type,
        amount: new Decimal(data.amount.toFixed(2)),
        fee: new Decimal(data.fee.toFixed(2)),
        reference: data.reference || null,
        createdById: session.userId
      }
    });

    // Audit Log erstellen
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'transfer.create',
        details: `Transfer erstellt: ${transfer.id}, Betrag: ${data.amount}€, Gebühr: ${data.fee}€`
      }
    });

    revalidatePath('/transfers');
    
    // Decimal zu Number konvertieren für Client Components
    const transferData = {
      ...transfer,
      amount: Number(transfer.amount),
      fee: Number(transfer.fee)
    };
    
    return { success: true, data: transferData };
  } catch (error) {
    console.error('Fehler beim Erstellen des Transfers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function cancelTransfer(formData: FormData) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['mitarbeiter','manager','admin','owner'])) {
      throw new Error('Forbidden');
    }

    const rawData = {
      id: formData.get('id'),
      reason: formData.get('reason')
    };

    const { id, reason } = cancelSchema.parse(rawData);

    // Prüfen ob Transfer existiert und stornierbar ist
    const transfer = await prisma.moneyTransfer.findUnique({
      where: { id }
    });

    if (!transfer) {
      throw new Error('Transfer nicht gefunden');
    }

    if (transfer.status !== 'posted') {
      throw new Error('Transfer kann nicht storniert werden');
    }

    const updated = await prisma.moneyTransfer.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledById: session.userId
      }
    });

    // Audit Log erstellen
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'transfer.cancel',
        details: `Transfer storniert: ${id}, Grund: ${reason}`
      }
    });

    revalidatePath('/transfers');
    
    // Decimal zu Number konvertieren für Client Components
    const updatedData = {
      ...updated,
      amount: Number(updated.amount),
      fee: Number(updated.fee)
    };
    
    return { success: true, data: updatedData };
  } catch (error) {
    console.error('Fehler beim Stornieren des Transfers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function deleteTransfer(formData: FormData) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
    if (!hasRole(session, ['admin','owner'])) {
      throw new Error('Nur Owner/Admin können Transfers löschen');
    }

    const rawData = {
      id: formData.get('transferId')
    };

    const { id } = deleteSchema.parse(rawData);

    const deleted = await prisma.moneyTransfer.update({
      where: { id },
      data: { status: 'deleted' }
    });

    // Audit Log erstellen
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'transfer.delete',
        details: `Transfer gelöscht: ${id}`
      }
    });

    revalidatePath('/transfers');
    
    // Decimal zu Number konvertieren für Client Components
    const deletedData = {
      ...deleted,
      amount: Number(deleted.amount),
      fee: Number(deleted.fee)
    };
    
    return { success: true, data: deletedData };
  } catch (error) {
    console.error('Fehler beim Löschen des Transfers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function getTransfers(searchParams?: { [key: string]: string | string[] | undefined }) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const filters = filterSchema.parse({
      provider: searchParams?.provider || undefined,
      type: searchParams?.type || undefined,
      status: searchParams?.status || undefined,
      from: searchParams?.from || undefined,
      to: searchParams?.to || undefined,
      search: searchParams?.search || undefined
    });

    const where: any = {
      status: { not: 'deleted' } // Gelöschte Transfers ausblenden
    };

    if (filters.provider) where.provider = filters.provider;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.reference = { contains: filters.search };
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to + 'T23:59:59');
    }

    const transfers = await prisma.moneyTransfer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Decimal zu Number konvertieren für Client Components
    const transfersData = transfers.map(transfer => ({
      ...transfer,
      amount: Number(transfer.amount),
      fee: Number(transfer.fee)
    }));

    return { success: true, data: transfersData };
  } catch (error) {
    console.error('Fehler beim Laden der Transfers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

export async function getTotals(params?: { 
  from?: string; 
  to?: string; 
  provider?: 'WU' | 'RIA' | 'MONEYGRAM' 
}) {
  try {
    const session = await getSession();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const where: any = { 
      status: { in: ['posted', 'cancelled'] },
      // Gelöschte Transfers nicht in Summen einbeziehen
    };

    if (params?.provider) where.provider = params.provider;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to + 'T23:59:59');
    }

    const transfers = await prisma.moneyTransfer.findMany({
      where,
      select: {
        amount: true,
        fee: true,
        status: true,
        type: true,
        provider: true
      }
    });

    const totals = {
      amount: 0,
      fee: 0,
      count: transfers.length,
      countPosted: 0,
      countCancelled: 0
    };

    for (const transfer of transfers) {
      // Berechne Vorzeichen basierend auf Status und Type
      let sign = 1;
      
      if (transfer.status === 'cancelled') {
        sign = -1; // Stornierte Transfers werden abgezogen
      } else if (transfer.type === 'PAYOUT') {
        sign = -1; // Auszahlungen werden vom Gesamtumsatz abgezogen
      } else if (transfer.type === 'DEDUCTION') {
        sign = -1; // Abzüge werden vom Gesamtumsatz abgezogen
      }
      // SEND bleibt positiv (sign = 1)
      
      totals.amount += Number(transfer.amount) * sign;
      totals.fee += Number(transfer.fee) * sign;
      
      if (transfer.status === 'posted') totals.countPosted++;
      if (transfer.status === 'cancelled') totals.countCancelled++;
    }

    // Auf 2 Dezimalstellen runden
    totals.amount = Number(totals.amount.toFixed(2));
    totals.fee = Number(totals.fee.toFixed(2));

    return { success: true, data: totals };
  } catch (error) {
    console.error('Fehler beim Berechnen der Summen:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}
