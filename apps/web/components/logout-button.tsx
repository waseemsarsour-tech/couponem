'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await api.auth.logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-700">
      <LogOut className="w-4 h-4 mr-1.5" />
      Logout
    </Button>
  );
}
