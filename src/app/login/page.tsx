'use client';

import { useState } from 'react';
import { loginAdmin } from '../actions'; // Debes crear esta función en actions.js

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // Si es exitoso, la Server Action redirige automáticamente a /admin
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800">Panel de Control</h1>
          <p className="text-slate-400 mt-2 font-medium">Ingrese sus credenciales de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block uppercase tracking-widest">Usuario</label>
            <input 
              name="usuario" type="text" required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-800 outline-none focus:border-blue-500 transition-all"
              placeholder="Nombre de usuario"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block uppercase tracking-widest">Contraseña</label>
            <input 
              name="password" type="password" required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-800 outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:bg-slate-300"
          >
            {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          Acceso restringido para personal autorizado
        </p>
      </div>
    </div>
  );
}