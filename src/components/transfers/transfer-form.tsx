'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransfer } from '@/app/transfers/actions';
import { formatNumberInput, parseEuroInput } from '@/lib/fmt';

interface TransferFormProps {
  provider: 'WU' | 'RIA' | 'MONEYGRAM';
  onSuccess?: () => void;
}

export function TransferForm({ provider, onSuccess }: TransferFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    amount: '',
    fee: '',
    type: 'SEND' as 'SEND' | 'PAYOUT' | 'DEDUCTION',
    reference: ''
  });

  const providerNames = {
    WU: 'Western Union',
    RIA: 'Ria',
    MONEYGRAM: 'MoneyGram'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataObj = new FormData();
      formDataObj.append('provider', provider);
      formDataObj.append('type', formData.type);
      formDataObj.append('amount', parseEuroInput(formData.amount).toString());
      formDataObj.append('fee', parseEuroInput(formData.fee).toString());
      formDataObj.append('reference', formData.reference);

      const result = await createTransfer(formDataObj);

      if (result.success) {
        setFormData({
          amount: '',
          fee: '',
          type: 'SEND',
          reference: ''
        });
        onSuccess?.();
      } else {
        setErrors({ general: result.error || 'Ein unbekannter Fehler ist aufgetreten.' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Fehler beim Speichern der Transaktion.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lasse Benutzer beliebig tippen, formatiere nicht bei jedem Keystroke
    setFormData({ ...formData, amount: e.target.value });
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lasse Benutzer beliebig tippen, formatiere nicht bei jedem Keystroke
    setFormData({ ...formData, fee: e.target.value });
  };

  const handleAmountBlur = () => {
    const parsed = parseEuroInput(formData.amount);
    if (parsed > 0) {
      setFormData({ ...formData, amount: parsed.toFixed(2).replace('.', ',') });
    }
  };

  const handleFeeBlur = () => {
    const parsed = parseEuroInput(formData.fee);
    if (parsed > 0) {
      setFormData({ ...formData, fee: parsed.toFixed(2).replace('.', ',') });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Erlaube Zahlen, Komma, Punkt und Steuerzeichen
    if (e.key === ',' && e.currentTarget.value.includes(',')) {
      e.preventDefault();
    }
    if (e.key === '.' && e.currentTarget.value.includes('.')) {
      e.preventDefault();
    }
    if (!/^[0-9,.\b\t\r\n]$/.test(e.key) && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Neue Transaktion - {providerNames[provider]}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Betrag (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-modern"
              value={formData.amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              onKeyPress={handleKeyPress}
              placeholder="0,00"
              required
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gebühr (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-modern"
              value={formData.fee}
              onChange={handleFeeChange}
              onBlur={handleFeeBlur}
              onKeyPress={handleKeyPress}
              placeholder="0,00"
              required
            />
            {errors.fee && <p className="mt-1 text-xs text-red-600">{errors.fee}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Transaktionstyp <span className="text-red-500">*</span>
          </label>
          <select
            className="input-modern"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SEND' | 'PAYOUT' | 'DEDUCTION' })}
            required
          >
            <option value="SEND">Versendung</option>
            <option value="PAYOUT">Auszahlung</option>
            <option value="DEDUCTION">Drop</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Referenz (optional)
          </label>
          <input
            type="text"
            className="input-modern"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Optional: Referenznummer oder Notiz"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Speichern...' : 'Transaktion speichern'}
        </button>
      </form>
    </div>
  );
}