'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await api.auth.login(username, password);
      } else {
        await api.auth.signup(username, password);
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md border border-border w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <span className="bg-primary rounded-md px-3 py-1 text-white text-lg font-bold">C</span>
          <h1 className="text-2xl font-bold mt-4">CouponEm</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? 'Sign in to manage your coupons' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={switchMode} className="text-primary font-medium hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
