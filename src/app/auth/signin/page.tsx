'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction } from './actions';

export default function SignInPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const result = await loginAction(formData);

      if (result.success) {
        router.push('/transfers');
      } else {
        setError(result.error || 'Fehler bei der Anmeldung');
      }
    } catch (error) {
      setError('Fehler bei der Anmeldung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      
      <Card className="w-full max-w-lg relative z-10 backdrop-blur-lg animate-slide-up shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl animate-bounce-subtle">
              <span className="text-3xl font-bold text-white">GT</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Geldtransfer
          </CardTitle>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Sicher anmelden und fortfahren
          </p>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="relative px-6 py-4 rounded-xl border-l-4 animate-bounce-subtle" style={{
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                borderLeftColor: 'var(--error)',
                color: 'var(--error)'
              }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚫</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  👤 Benutzername
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Benutzername eingeben"
                    required
                    disabled={loading}
                    className="pl-12 h-14 text-base transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    👤
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  🔐 Passwort
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Passwort eingeben"
                    required
                    disabled={loading}
                    className="pl-12 h-14 text-base transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔐
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="default"
                className="w-full h-14 text-base font-semibold gap-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Anmelden...
                  </>
                ) : (
                  <>
                    🚀 Anmelden
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 p-6 rounded-2xl" style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0e7ff)',
            border: '1px solid var(--border-color)'
          }}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              🎭 Demo-Zugänge
            </h3>
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <div>
                  <span className="font-semibold">Owner:</span> <code className="px-2 py-1 rounded bg-gray-100 mx-1">owner</code> / <code className="px-2 py-1 rounded bg-gray-100 mx-1">Admin@1234</code>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <div>
                  <span className="font-semibold">Manager:</span> <code className="px-2 py-1 rounded bg-gray-100 mx-1">manager</code> / <code className="px-2 py-1 rounded bg-gray-100 mx-1">Manager@1234</code>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <div>
                  <span className="font-semibold">Mitarbeiter:</span> <code className="px-2 py-1 rounded bg-gray-100 mx-1">mitarbeiter</code> / <code className="px-2 py-1 rounded bg-gray-100 mx-1">Mitarbeiter@1234</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
