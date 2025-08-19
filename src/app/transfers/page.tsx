'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentArrowDownIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { TransferForm } from '@/components/transfers/transfer-form';
import { TransferTable } from '@/components/transfers/transfer-table';
import { getTransfers, getTotals } from './actions';

type Provider = 'WU' | 'RIA' | 'MONEYGRAM';

interface Transfer {
  id: string;
  provider: Provider;
  type: 'SEND' | 'PAYOUT' | 'DEDUCTION';
  amount: number;
  fee: number;
  reference?: string | null;
  status: 'posted' | 'cancelled' | 'deleted';
  cancelReason?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
}

interface TotalsData {
  amount: number;
  fee: number;
  count: number;
  countPosted: number;
  countCancelled: number;
}

const providerInfo = {
  WU: { name: 'Western Union', icon: '🏦' },
  RIA: { name: 'Ria Money Transfer', icon: '🌐' },
  MONEYGRAM: { name: 'MoneyGram', icon: '💸' }
};

export default function TransfersPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('mitarbeiter');
  const [activeTab, setActiveTab] = useState<Provider>('WU');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [allTotals, setAllTotals] = useState<TotalsData>({ amount: 0, fee: 0, count: 0, countPosted: 0, countCancelled: 0 });
  const [providerTotals, setProviderTotals] = useState<{ [key in Provider]: TotalsData }>({
    WU: { amount: 0, fee: 0, count: 0, countPosted: 0, countCancelled: 0 },
    RIA: { amount: 0, fee: 0, count: 0, countPosted: 0, countCancelled: 0 },
    MONEYGRAM: { amount: 0, fee: 0, count: 0, countPosted: 0, countCancelled: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    provider: '',
    reference: '',
    dateFrom: '',
    dateTo: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersRes, allTotalsRes, wuTotalsRes, riaTotalsRes, mgTotalsRes] = await Promise.all([
        getTransfers(filters),
        getTotals({}),
        getTotals({ provider: 'WU' }),
        getTotals({ provider: 'RIA' }),
        getTotals({ provider: 'MONEYGRAM' })
      ]);

      if (transfersRes.success && transfersRes.data) {
        // Convert dates to strings for consistency
        const convertedTransfers = transfersRes.data.map(t => ({
          ...t,
          createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
          cancelledAt: t.cancelledAt instanceof Date ? t.cancelledAt.toISOString() : t.cancelledAt
        }));
        setTransfers(convertedTransfers);
      }

      if (allTotalsRes.success && allTotalsRes.data) {
        setAllTotals(allTotalsRes.data);
      }

      const defaultTotals = { amount: 0, fee: 0, count: 0, countPosted: 0, countCancelled: 0 };
      setProviderTotals({
        WU: (wuTotalsRes.success && wuTotalsRes.data) ? wuTotalsRes.data : defaultTotals,
        RIA: (riaTotalsRes.success && riaTotalsRes.data) ? riaTotalsRes.data : defaultTotals,
        MONEYGRAM: (mgTotalsRes.success && mgTotalsRes.data) ? mgTotalsRes.data : defaultTotals
      });
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/whoami');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        const data = await response.json();
        setUserRole(data.role || 'mitarbeiter');
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
    loadData();
  }, [router]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const exportToCSV = () => {
    const headers = ['Datum', 'Provider', 'Art', 'Betrag (€)', 'Gebühr (€)', 'Status', 'Referenz'];
    const csvData = transfers.map(t => [
      new Date(t.createdAt).toLocaleDateString('de-DE'),
      t.provider,
      t.type === 'SEND' ? 'Versendung' : t.type === 'PAYOUT' ? 'Auszahlung' : 'Drop',
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.status === 'posted' ? 'Gebucht' : t.status === 'cancelled' ? 'Storniert' : 'Gelöscht',
      t.reference || ''
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transfers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransfers = activeTab === 'WU' ? transfers.filter(t => t.provider === 'WU') :
                           activeTab === 'RIA' ? transfers.filter(t => t.provider === 'RIA') :
                           transfers.filter(t => t.provider === 'MONEYGRAM');

  const currentTotals = providerTotals[activeTab];
  const totalRevenue = allTotals.amount + allTotals.fee;

  if (loading) {
    return (
      <div className="container-modern min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-modern min-h-screen">
      {/* Elegant Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">
              Geldtransfers
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Verwalten Sie alle Transaktionen effizient und übersichtlich
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={exportToCSV}
            className="btn-secondary"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            CSV Export
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4" />
            Neue Transaktion
          </button>
        </div>
      </div>

      {/* KPI Cards - Provider-spezifisch */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{activeTab} Betrag</h3>
            <span className="text-xs text-gray-400">€</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{currentTotals.amount.toFixed(2)} €</div>
          <p className="text-xs text-gray-500 mt-1">Netto {activeTab} Transaktionen</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{activeTab} Gebühren</h3>
            <span className="text-xs text-gray-400">€</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{currentTotals.fee.toFixed(2)} €</div>
          <p className="text-xs text-gray-500 mt-1">{activeTab} Einnahmen</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{activeTab} Umsatz</h3>
            <span className="text-xs text-gray-400">€</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{(currentTotals.amount + currentTotals.fee).toFixed(2)} €</div>
          <p className="text-xs text-gray-500 mt-1">{activeTab} Betrag + Gebühren</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{activeTab} Transaktionen</h3>
            <span className="text-xs text-gray-400">#</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{currentTotals.count}</div>
          <p className="text-xs text-gray-500 mt-1">{currentTotals.countPosted} gebucht, {currentTotals.countCancelled} storniert</p>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="modern-card p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Von Datum</label>
              <input
                type="date"
                className="input-modern"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bis Datum</label>
              <input
                type="date"
                className="input-modern"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
              <select
                className="input-modern"
                value={filters.provider}
                onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              >
                <option value="">Alle Provider</option>
                <option value="WU">Western Union</option>
                <option value="RIA">Ria</option>
                <option value="MONEYGRAM">MoneyGram</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Referenz</label>
              <input
                type="text"
                className="input-modern"
                placeholder="Referenz suchen..."
                value={filters.reference}
                onChange={(e) => setFilters(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Provider Tabs */}
      <div className="modern-card p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(providerInfo) as Provider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => setActiveTab(provider)}
              className={`provider-tab ${activeTab === provider ? 'active' : ''}`}
            >
              <span className="text-sm">{providerInfo[provider].icon}</span>
              <span>{providerInfo[provider].name}</span>
            </button>
          ))}
        </div>

        {/* Provider Stats - kompakter */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">
              {currentTotals.amount.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">Betrag</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">
              {currentTotals.fee.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">Gebühren</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">
              {currentTotals.count}
            </div>
            <div className="text-xs text-gray-500">Transaktionen</div>
          </div>
        </div>
      </div>

      {/* New Transaction Form */}
      {showForm && (
        <div className="modern-card p-6 mb-6">
          <TransferForm 
            provider={activeTab} 
            onSuccess={() => {
              loadData();
              setShowForm(false);
            }} 
          />
        </div>
      )}

      {/* Transactions Table */}
      <div className="modern-table mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              {providerInfo[activeTab].name} Transaktionen
            </h2>
            <span className="text-xs text-gray-500">
              {filteredTransfers.length} Einträge
            </span>
          </div>
        </div>
        <TransferTable 
          transfers={filteredTransfers} 
          onUpdate={loadData}
          userRole={userRole}
        />
      </div>
    </div>
  );
}