'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Transfer {
  id: string;
  provider: 'WU' | 'RIA' | 'MONEYGRAM';
  type: 'SEND' | 'PAYOUT';
  amount: number;
  fee: number;
  reference?: string | null;
}

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<{ success: boolean; error?: string }>;
  transfer: Transfer | null;
}

export function CancelDialog({ open, onOpenChange, onConfirm, transfer }: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reason.trim().length < 5) {
      setError('Begründung muss mindestens 5 Zeichen haben');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onConfirm(reason.trim());
      if (result.success) {
        setReason('');
        onOpenChange(false);
      } else {
        setError(result.error || 'Fehler beim Stornieren');
      }
    } catch (err) {
      setError('Unerwarteter Fehler aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
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
          <DialogTitle>Transaktion stornieren</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Provider:</strong> {providerNames[transfer.provider]}</p>
            <p><strong>Betrag:</strong> {transfer.amount.toFixed(2)} €</p>
            <p><strong>Gebühr:</strong> {transfer.fee.toFixed(2)} €</p>
            {transfer.reference && <p><strong>Referenz:</strong> {transfer.reference}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Begründung für Stornierung *
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Bitte geben Sie den Grund für die Stornierung an (mindestens 5 Zeichen)..."
                rows={4}
                required
                disabled={loading}
                className={error && reason.length < 5 ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500 mt-1">
                {reason.length}/5 Zeichen (mindestens)
              </p>
            </div>

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
                type="submit"
                variant="secondary"
                disabled={loading || reason.trim().length < 5}
              >
                {loading ? 'Storniere...' : 'Stornieren'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
