'use client';
import { useState, ChangeEvent } from 'react';
import { registrarUsuario } from './actions';
import { UploadButton } from "./utils/uploadthing";
import NextImage from 'next/image';

export default function MultiStepPage() {
  const [step, setStep] = useState(1);
  const [fileUrls, setFileUrls] = useState<{ name: string; url: string }[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  // --- REGLAS DE VALIDACIÓN ---
  const soloLetras = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$";
  const soloNumeros = "^[0-9]+$";
  const telefonoRegEx = "^[0-9]{10,15}$"; // Mínimo 10, máximo 15 dígitos
  const documentoRegEx = "^[0-9]{8,10}$"; // Mínimo 8, máximo 10 dígitos

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarYAvanzar = () => {
    const selector = `#step-${step}`;
    const inputs = document.querySelectorAll(`${selector} input, ${selector} select`) as NodeListOf<HTMLInputElement | HTMLSelectElement>;
    
    let formularioValido = true;
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        formularioValido = false;
      }
    });

    if (!formularioValido) return;

    if (step === 2) {
      const fn = new Date(formData.fechanacimiento);
      const fe = new Date(formData.fechaexpedicion);
      if (formData.fechanacimiento >= hoy) {
        setError("La fecha de nacimiento debe ser anterior a hoy.");
        return;
      }
      let edad = fe.getFullYear() - fn.getFullYear();
      if (fe.getMonth() < fn.getMonth() || (fe.getMonth() === fn.getMonth() && fe.getDate() < fn.getDate())) {
        edad--;
      }
      if (edad < 18) {
        setError("El usuario debe ser mayor de 18 años según su fecha de expedición.");
        return;
      }
    }

    setError("");
    setStep(step + 1);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileUrls.length === 0) {
      setError("Debes subir los documentos requeridos.");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v as string));

    const res = await registrarUsuario(data, fileUrls);
    if (res.success) {
      alert("¡Registro guardado con éxito!");
      window.location.reload();
    } else {
      setError(res.error || "Error al registrar");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <nav className="bg-[#003399] border-b-4 border-[#EAB308] px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
      {/* SECCIÓN DEL LOGO */}
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-48 bg-white p-1 rounded-lg">
          <NextImage 
            src="/logo.png" 
            alt="Logo Unicolmayor"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="h-6 w-1px bg-blue-400/50 mx-2 hidden sm:block"></div>
        <span className="font-black text-white text-lg tracking-tighter uppercase hidden sm:block">
          Inscripciones
        </span>
      </div>

      {/* BOTÓN MÓVIL */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)} 
        className="md:hidden p-2 text-[#EAB308] hover:bg-blue-900 rounded-xl transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
        </svg>
      </button>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex items-center gap-6`}>
        <a 
          href="#" 
          className="text-xs font-black text-white hover:text-[#EAB308] uppercase tracking-widest transition-colors"
        >
          Inicio
        </a>
        <a 
          href="/login" 
          className="text-xs font-black bg-[#EAB308] text-[#003399] px-4 py-2 rounded-full uppercase tracking-widest hover:bg-white transition-all shadow-md"
        >
          Admin
        </a>
      </div>
    </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl max-w-xl w-full border border-slate-100">
          
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100">{error}</div>}

          <form onSubmit={manejarEnvio}>
            {/* PASO 1: NOMBRES Y GÉNERO */}
            {step === 1 && (
              <div id="step-1" className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                <h2 className="col-span-2 text-xl font-bold text-slate-800 mb-2">Datos Personales</h2>
                <input name="nombre" placeholder="Primer Nombre" required pattern={soloLetras} value={formData.nombre || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50 outline-none" title="Solo se permiten letras" />
                <input name="segundonombre" placeholder="Segundo Nombre" pattern={soloLetras} value={formData.segundonombre || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50 outline-none" title="Solo se permiten letras" />
                <input name="apellido" placeholder="Primer Apellido" required pattern={soloLetras} value={formData.apellido || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Solo se permiten letras" />
                <input name="segundoapellido" placeholder="Segundo Apellido" pattern={soloLetras} value={formData.segundoapellido || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Solo se permiten letras" />
                <select name="genero" required value={formData.genero || ""} onChange={handleChange} className="col-span-2 p-3 border rounded-xl text-black bg-slate-50">
                  <option value="">Seleccione Género</option>
                  <option>Masculino</option><option>Femenino</option><option>Otro</option>
                </select>
                <input name="telefono" placeholder="Teléfono (Mín. 10 dígitos)" required pattern={telefonoRegEx} value={formData.telefono || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Debe tener al menos 10 números" />
                <input name="correo" type="email" placeholder="Correo institucional" required value={formData.correo || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" />
                <button type="button" onClick={validarYAvanzar} className="col-span-2 bg-blue-600 text-white p-4 rounded-xl font-bold mt-2 hover:bg-blue-700 transition-colors">Siguiente</button>
              </div>
            )}

            {/* PASO 2: DOCUMENTO Y FECHAS */}
            {step === 2 && (
              <div id="step-2" className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Identificación</h2>
                
                <select 
                  name="tipoidentificacion" 
                  required 
                  value={formData.tipoidentificacion || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border rounded-xl text-black bg-slate-50 outline-none"
                >
                  <option value="">Tipo Documento</option>
                  <option>Cédula de Ciudadanía</option>
                  <option>Tarjeta de Identidad</option>
                  <option>Cédula de Extranjería</option>
                  <option>Pasaporte</option>
                </select>

                <input 
                  name="numeroidentificacion" 
                  placeholder="Número de Documento (8 a 10 dígitos)" 
                  required 
                  pattern="^[0-9]{8,10}$" 
                  value={formData.numeroidentificacion || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border rounded-xl text-black bg-slate-50 outline-none" 
                  title="El documento debe tener entre 8 y 10 números" 
                />

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha de Nacimiento</label>
                  <input 
                    name="fechanacimiento" 
                    type="date" 
                    max={hoy} 
                    required 
                    value={formData.fechanacimiento || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border rounded-xl text-black bg-slate-50 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha Expedición Documento</label>
                  <input 
                    name="fechaexpedicion" 
                    type="date" 
                    required 
                    value={formData.fechaexpedicion || ""} 
                    onChange={handleChange} 
                    className="w-full p-3 border rounded-xl text-black bg-slate-50 outline-none" 
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="flex-1 bg-slate-100 text-slate-500 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Atrás
                  </button>
                  <button 
                    type="button" 
                    onClick={validarYAvanzar} 
                    className="flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
            {/* PASO 3: RESIDENCIA Y SALUD */}
            {step === 3 && (
              <div id="step-3" className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Residencia y Salud</h2>
                <input name="direccion" placeholder="Dirección de Residencia" required value={formData.direccion || ""} onChange={handleChange} className="w-full p-3 border rounded-xl text-black bg-slate-50 outline-none" />
                <input name="municipio" placeholder="Municipio" required pattern={soloLetras} value={formData.municipio || ""} onChange={handleChange} className="w-full p-3 border rounded-xl text-black bg-slate-50" title="Solo letras permitidas" />
                <input name="eps" placeholder="Nombre de EPS" required pattern={soloLetras} value={formData.eps || ""} onChange={handleChange} className="w-full p-3 border rounded-xl text-black bg-slate-50" title="Solo letras permitidas" />
                <div className="grid grid-cols-2 gap-2">
                  <select name="tiposangre" required value={formData.tiposangre || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50">
                    <option value="">Tipo Sangre</option>
                    <option>O</option><option>A</option><option>B</option><option>AB</option>
                  </select>
                  <select name="factorrh" required value={formData.factorrh || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50">
                    <option value="">Factor RH</option>
                    <option>+</option><option>-</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-500 p-4 rounded-xl font-bold">Atrás</button>
                  <button type="button" onClick={validarYAvanzar} className="flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold">Siguiente</button>
                </div>
              </div>
            )}

            {/* PASO 4: EMERGENCIA Y ARCHIVOS ACUMULABLES */}
            {step === 4 && (
              <div id="step-4" className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Emergencia y Archivos</h2>
                <div className="grid grid-cols-1 gap-3">
                  <input name="contactoemergencia" placeholder="Nombre Contacto Emergencia" required pattern={soloLetras} value={formData.contactoemergencia || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Solo letras permitidas" />
                  <input name="contactotelefono" placeholder="Teléfono Emergencia (Mín. 10)" required pattern={telefonoRegEx} value={formData.contactotelefono || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Debe tener al menos 10 números" />
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-dashed border-blue-200 text-center">
                  <p className="text-[11px] font-bold text-blue-700 mb-4 uppercase">Subir Documentos (Máx 3 archivos PDF)</p>
                  <p className="text-[11px] font-bold text-blue-700 mb-4 uppercase">Subir Documentos (Cedula,Carnet y Certificado eps)</p>
                  
                  {fileUrls.length < 3 && (
                    <UploadButton
                      endpoint="pdfUploader"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          const nuevosArchivos = res.map(f => ({ name: f.name, url: f.url }));
                          // Agregamos los nuevos archivos a los que ya teníamos (acumulativo)
                          setFileUrls(prev => [...prev, ...nuevosArchivos].slice(0, 3));
                        }
                      }}
                      onUploadError={(err) => setError(`Error al subir: ${err.message}`)}
                    />
                  )}

                  {fileUrls.length > 0 && (
                    <div className="mt-4 text-left space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Lista de archivos ({fileUrls.length}/3):</p>
                      {fileUrls.map((f, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100 text-[10px] text-slate-700 font-bold shadow-sm">
                          <span className="truncate w-40">{f.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setFileUrls(fileUrls.filter((_, index) => index !== i))}
                            className="text-red-500 hover:text-red-700 font-black px-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 bg-slate-100 text-slate-500 p-4 rounded-xl font-bold">Atrás</button>
                  <button type="submit" disabled={loading || fileUrls.length === 0} className="flex-1 bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg disabled:bg-slate-300 transition-all hover:bg-emerald-700">
                    {loading ? "Registrando..." : "Finalizar Registro"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}