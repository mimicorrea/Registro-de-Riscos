'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Timeout de segurança: se a rede/banco estiver muito lento (ex.: banco
      // "hibernado", ver keep-warm.yml) e o login nunca responder, evita
      // deixar o botão presa em "Entrando..." pra sempre — melhor mostrar um
      // erro e deixar tentar de novo.
      const result = await withTimeout(
        signIn('credentials', { email, password, redirect: false }),
        20000
      );

      if (result?.error) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
      } else if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
        setLoading(false);
      }
    } catch {
      setError('A conexão demorou demais. Verifique sua internet e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/80">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-600">Acesso</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Faça login para iniciar</h1>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-sm text-slate-600">E-mail</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail className="h-5 w-5 text-brand-300" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="seu@empresa.com"
                className="w-full border-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Senha</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Lock className="h-5 w-5 text-brand-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-2xl inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
