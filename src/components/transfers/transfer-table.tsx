'use client';

import { useState } from 'react';
import { formatEuro, formatDate } from '@/lib/fmt';
import { cancelTransfer, deleteTransfer } from '@/app/transfers/actions';

interface Transfer {
  id: string;
  provider: 'WU' | 'RIA' | 'MONEYGRAM';
  type: 'SEND' | 'PAYOUT' | 'DEDUCTION';
  amount: number;
  fee: number;
  reference?: string | null;
  status: 'posted' | 'cancelled' | 'deleted';
  cancelReason?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
}

interface TransferTableProps {
  transfers: Transfer[];
  userRole: string;
  onUpdate?: () => void;
}

export function TransferTable({ transfers, userRole, onUpdate }: TransferTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const providerNames = {
    WU: 'Western Union',
    RIA: 'Ria',
    MONEYGRAM: 'MoneyGram'
  };

  const typeNames = {
    SEND: 'Versendung',
    PAYOUT: 'Auszahlung',
    DEDUCTION: 'Drop'
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'posted':
        return <span className="status-pill status-posted">Gebucht</span>;
      case 'cancelled':
        return <span className="status-pill status-cancelled">Storniert</span>;
      case 'deleted':
        return <span className="status-pill status-deleted">Gelöscht</span>;
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  const handleCancel = async (transfer: Transfer) => {
    const reason = prompt('Grund für die Stornierung:');
    if (!reason) return;

    setLoading(transfer.id);
    try {
      const formData = new FormData();
      formData.append('transferId', transfer.id);
      formData.append('reason', reason);

      const result = await cancelTransfer(formData);
      if (result.success) {
        onUpdate?.();
      } else {
        alert(result.error || 'Fehler beim Stornieren');
      }
    } catch (error) {
      alert('Fehler beim Stornieren');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (transfer: Transfer) => {
    if (!confirm('Transfer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setLoading(transfer.id);
    try {
      const formData = new FormData();
      formData.append('transferId', transfer.id);

      const result = await deleteTransfer(formData);
      if (result.success) {
        onUpdate?.();
      } else {
        alert(result.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    } finally {
      setLoading(null);
    }
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Keine Transaktionen gefunden</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="modern-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Provider</th>
            <th>Art</th>
            <th className="text-right">Betrag</th>
            <th className="text-right">Gebühr</th>
            <th>Status</th>
            <th>Referenz</th>
            {(userRole === 'admin' || userRole === 'owner' || userRole === 'manager') && (
              <th className="text-right">Aktionen</th>
            )}
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td className="text-sm">{formatDate(transfer.createdAt)}</td>
              <td className="text-sm">{providerNames[transfer.provider]}</td>
              <td className="text-sm">{typeNames[transfer.type]}</td>
              <td className="text-right font-mono text-sm">{formatEuro(transfer.amount)}</td>
              <td className="text-right font-mono text-sm">{formatEuro(transfer.fee)}</td>
              <td>{getStatusPill(transfer.status)}</td>
              <td className="text-sm text-gray-600">{transfer.reference || '-'}</td>
              {(userRole === 'admin' || userRole === 'owner' || userRole === 'manager') && (
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {transfer.status === 'posted' && (
                      <button
                        onClick={() => handleCancel(transfer)}
                        disabled={loading === transfer.id}
                        className="btn-secondary text-xs px-2 py-1"
                      >
                        {loading === transfer.id ? '...' : 'Stornieren'}
                      </button>
                    )}
                    {(userRole === 'admin' || userRole === 'owner') && transfer.status !== 'deleted' && (
                      <button
                        onClick={() => handleDelete(transfer)}
                        disabled={loading === transfer.id}
                        className="btn-secondary text-xs px-2 py-1 text-red-600 hover:bg-red-50 border-red-200"
                      >
                        {loading === transfer.id ? '...' : 'Löschen'}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}