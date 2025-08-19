'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Transfer {
  id: string;
  provider: 'WU' | 'RIA' | 'MONEYGRAM';
  type: 'SEND' | 'PAYOUT';
  amount: number;
  fee: number;
  reference?: string | null;
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  transfer: Transfer | null;
}

export function DeleteDialog({ open, onOpenChange, onConfirm, transfer }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await onConfirm();
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || 'Fehler beim Löschen');
      }
    } catch (err) {
      setError('Unerwarteter Fehler aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onOpenChange(false);
    }
  };

  const providerNames = {
    WU: 'Western Union',
    RIA: 'Ria',
    MONEYGRAM: 'MoneyGram'
  };

  if (!transfer) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaktion löschen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-800 font-medium mb-2">
              ⚠️ Warnung: Diese Aktion kann nicht rückgängig gemacht werden!
            </p>
            <p className="text-red-700">
              Die Transaktion wird permanent als gelöscht markiert und aus den Summen entfernt.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Provider:</strong> {providerNames[transfer.provider]}</p>
            <p><strong>Betrag:</strong> {transfer.amount.toFixed(2)} €</p>
            <p><strong>Gebühr:</strong> {transfer.fee.toFixed(2)} €</p>
            {transfer.reference && <p><strong>Referenz:</strong> {transfer.reference}</p>}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Lösche...' : 'Endgültig löschen'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
