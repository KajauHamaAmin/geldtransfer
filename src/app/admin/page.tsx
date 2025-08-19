'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createEmployee, getEmployees, toggleEmployeeStatus } from './actions';

interface Employee {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
  active: boolean;
  createdAt: string;
  currentShift?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    role: 'mitarbeiter'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const response = await fetch('/api/whoami');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        const data = await response.json();
        if (!data.authenticated) {
          router.push('/auth/signin');
          return;
        }
        
        setUserRole(data.role);
        
        if (data.role !== 'admin' && data.role !== 'owner') {
          router.push('/transfers');
          return;
        }

        loadEmployees();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      }
    };
    
    checkAuthAndLoad();
  }, [router]);

  const loadEmployees = async () => {
    try {
      const result = await getEmployees();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await createEmployee(formData);
      if (result.success) {
        setSuccess(`Mitarbeiter ${formData.name} erfolgreich erstellt!`);
        setFormData({ username: '', email: '', name: '', password: '', role: 'mitarbeiter' });
        loadEmployees();
      } else {
        setError(result.error || 'Fehler beim Erstellen des Mitarbeiters');
      }
    } catch (error) {
      setError('Unerwarteter Fehler aufgetreten');
    }
  };

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const result = await toggleEmployeeStatus(employeeId, !currentStatus);
      if (result.success) {
        loadEmployees();
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
          <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Lade Admin-Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            ⚙️ Admin-Dashboard
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Benutzerverwaltung und Systemkonfiguration
          </p>
        </div>
        <Button onClick={() => router.push('/transfers')} variant="outline" className="gap-2">
          💰 Zu Transfers
        </Button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Aktive Mitarbeiter",
            value: employees.filter(e => e.active).length,
            icon: "✅",
            gradient: "from-green-500 to-emerald-600",
            bgGradient: "from-green-50 to-emerald-50"
          },
          {
            title: "Inaktive Mitarbeiter",
            value: employees.filter(e => !e.active).length,
            icon: "❌",
            gradient: "from-red-500 to-pink-600",
            bgGradient: "from-red-50 to-pink-50"
          },
          {
            title: "Gesamt Mitarbeiter",
            value: employees.length,
            icon: "👥",
            gradient: "from-blue-500 to-cyan-600",
            bgGradient: "from-blue-50 to-cyan-50"
          },
          {
            title: "Im Dienst",
            value: employees.filter(e => e.currentShift).length,
            icon: "🟢",
            gradient: "from-purple-500 to-indigo-600",
            bgGradient: "from-purple-50 to-indigo-50"
          }
        ].map((stat, index) => (
          <Card key={index} className="group hover:scale-105 transition-all duration-300 animate-slide-up overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {stat.title}
                </CardTitle>
                <div className="text-2xl opacity-60 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Neuen Mitarbeiter erstellen */}
      <Card className="hover-lift animate-slide-up">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <div className="text-xl">Neuen Mitarbeiter erstellen</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Benutzer zum System hinzufügen
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEmployee} className="space-y-6">
            {error && (
              <div className="relative px-6 py-4 rounded-xl border-l-4 animate-bounce-subtle" style={{
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                borderLeftColor: 'var(--error)',
                color: 'var(--error)'
              }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="relative px-6 py-4 rounded-xl border-l-4 animate-bounce-subtle" style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderLeftColor: 'var(--success)',
                color: 'var(--success)'
              }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  👤 Benutzername <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="mitarbeiter1"
                    required
                    className="pl-12 transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    👤
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📧 E-Mail
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mitarbeiter@example.com"
                    className="pl-12 transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📧
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📝 Name <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Max Mustermann"
                    required
                    className="pl-12 transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📝
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  🔐 Passwort <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Sicheres Passwort"
                    required
                    className="pl-12 transition-all duration-200 focus:scale-105"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔐
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  🏅 Rolle
                </label>
                <div className="relative">
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="pl-12 transition-all duration-200 focus:scale-105"
                  >
                    <option value="mitarbeiter">👤 Mitarbeiter</option>
                    <option value="manager">💼 Manager</option>
                    <option value="admin">⚙️ Admin</option>
                  </Select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    🏅
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" variant="success" className="w-full h-14 text-base font-semibold gap-3">
                👥 Mitarbeiter erstellen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mitarbeiter-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter-Verwaltung ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    E-Mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rolle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Erstellt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={employee.role === 'admin' || employee.role === 'owner' ? 'default' : 'secondary'}>
                        {employee.role === 'owner' ? 'Owner' : employee.role === 'admin' ? 'Admin' : employee.role === 'manager' ? 'Manager' : 'Mitarbeiter'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={employee.active ? 'success' : 'destructive'}>
                        {employee.active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant={employee.active ? 'destructive' : 'default'}
                        onClick={() => handleToggleStatus(employee.id, employee.active)}
                      >
                        {employee.active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {employees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Mitarbeiter gefunden.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
