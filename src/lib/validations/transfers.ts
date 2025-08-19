import { z } from 'zod';

// Euro-Validierung mit korrekter Formatierung
const euro = z.preprocess(v => {
  if (typeof v === 'string') {
    // Entfernt Tausendertrennzeichen und ersetzt Komma durch Punkt
    return v.replace(/\./g,'').replace(',', '.');
  }
  return v;
}, z.coerce.number().min(0).max(9999.99).multipleOf(0.01));

export const transferSchema = z.object({
  provider: z.enum(['WU','RIA','MONEYGRAM']),
  type: z.enum(['SEND','PAYOUT','DEDUCTION']),
  amount: euro,
  fee: euro,
  reference: z.string().trim().optional()
});

export const cancelSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(5, 'Begründung muss mindestens 5 Zeichen haben')
});

export const deleteSchema = z.object({
  id: z.string().uuid()
});

export const filterSchema = z.object({
  provider: z.enum(['WU','RIA','MONEYGRAM']).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  type: z.enum(['SEND','PAYOUT']).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  status: z.enum(['posted','cancelled','deleted']).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  from: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  to: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  search: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val)
});

export type TransferFormData = z.infer<typeof transferSchema>;
export type CancelFormData = z.infer<typeof cancelSchema>;
export type FilterData = z.infer<typeof filterSchema>;
