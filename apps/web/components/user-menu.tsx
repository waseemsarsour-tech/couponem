'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';

export function UserMenu() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['auth', 'me'], queryFn: api.auth.me });

  async function handleLogout() {
    await api.auth.logout();
    qc.clear();
    router.push('/login');
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
          <span className="font-medium">{data?.username ?? '...'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <button
          disabled
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded text-muted-foreground cursor-not-allowed opacity-50"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </PopoverContent>
    </Popover>
  );
}
