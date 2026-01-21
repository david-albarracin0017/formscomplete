'use client';

import { useState } from 'react';
import { loginAdmin, reiniciarSistemaAdmin } from '../actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm("¿Estás seguro? Esto borrará el admin actual y lo reseteará a 'admin123'.")) {
      const res = await reiniciarSistemaAdmin();
      alert(res.message || res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* BOTÓN DE EMERGENCIA */}
      <button 
        onClick={handleReset}
        className="mb-8 text-[10px] text-slate-500 border border-slate-800 px-4 py-2 rounded-full hover:bg-slate-900 transition-all uppercase tracking-tighter"
      >
        Mantenimiento: Reiniciar Base de Datos
      </button>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/20">
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-600 p-4 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800">Admin Panel</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block uppercase">Usuario</label>
            <input 
              name="usuario" type="text" required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-800 outline-none focus:border-blue-500 transition-all"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block uppercase">Contraseña</label>
            <input 
              name="password" type="password" required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-800 outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:bg-slate-300"
          >
            {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
}