'use client';

import Link from 'next/link';
import { 
  CreditCardIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="container-modern min-h-screen">
      {/* Hero Header */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl relative overflow-hidden">
            <CreditCardIcon className="w-10 h-10 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-60 animate-pulse"></div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Geldtransfer</span>
          <br />
          <span className="text-gray-800">Verwaltung</span>
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
          Modernes Verwaltungssystem für Geldtransfer-Transaktionen mit 
          <span className="font-semibold text-blue-600"> Western Union</span>, 
          <span className="font-semibold text-cyan-600"> Ria</span> und 
          <span className="font-semibold text-purple-600"> MoneyGram</span>
        </p>

        <Link href="/transfers">
          <button className="btn-primary text-base px-8 py-3 text-base">
            <span>Zur Verwaltung</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Provider Cards - eleganter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="modern-card p-6 text-center group animate-fadeInUp stagger-1">
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 animate-float">
              🏦
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Western Union</h3>
          <p className="text-gray-600">Globaler Marktführer für Geldtransfers</p>
          <div className="mt-3 inline-flex items-center text-sm text-green-600 font-medium">
            ✓ Vollständig integriert
          </div>
        </div>

        <div className="modern-card p-6 text-center group animate-fadeInUp stagger-2">
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>
              🌐
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ria Money Transfer</h3>
          <p className="text-gray-600">Schnelle Transfers zu günstigen Preisen</p>
          <div className="mt-3 inline-flex items-center text-sm text-green-600 font-medium">
            ✓ Vollständig integriert
          </div>
        </div>

        <div className="modern-card p-6 text-center group animate-fadeInUp stagger-3">
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '2s'}}>
              💸
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">MoneyGram</h3>
          <p className="text-gray-600">Zuverlässige internationale Zahlungen</p>
          <div className="mt-3 inline-flex items-center text-sm text-green-600 font-medium">
            ✓ Vollständig integriert
          </div>
        </div>
      </div>

      {/* Features Grid - kompakter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funktionen */}
        <div className="modern-card p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Funktionen</h2>
          </div>
          <div className="space-y-2">
            {[
              'Live-Summen Berechnung',
              'Storno mit Begründung',
              'Audit-Trail',
              'CSV-Export',
              'Rolle-basierte Berechtigungen'
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sicherheit */}
        <div className="modern-card p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Sicherheit & Audit</h2>
          </div>
          <div className="space-y-2">
            {[
              'Alle Aktionen werden geloggt',
              'Soft-Delete (status=deleted)',
              'Storno nur mit Pflicht-Begründung',
              'Owner vs. Mitarbeiter Rechte',
              'Session-basierte Authentifizierung'
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Detail - kompakter */}
      <div className="modern-card p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Technische Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CurrencyEuroIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Berechnungen</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Summe = Σ Betrag (posted) − Σ Betrag (cancelled)</p>
              <p>Gesamtumsatz = Betrag + Gebühr</p>
              <p>Euro-Rundung auf 2 Dezimalstellen</p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Benutzerfreundlich</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Tabs pro Provider</p>
              <p>Filter & Suche</p>
              <p>Keyboard-Shortcuts</p>
              <p>Inline Validierung</p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <DocumentChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics & Export</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Echtzeit-Dashboard</p>
              <p>CSV-Export mit Filtern</p>
              <p>Provider-spezifische Auswertungen</p>
              <p>Transaktions-Historie</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA - kompakter */}
      <div className="text-center mt-8 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bereit loszulegen?</h2>
        <Link href="/transfers">
          <button className="btn-primary text-base px-6 py-2">
            <span>Jetzt starten</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}