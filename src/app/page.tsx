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
    const hoyDate = new Date();

    let edadAlExpedir = fe.getFullYear() - fn.getFullYear();
    const mes = fe.getMonth() - fn.getMonth();
    if (mes < 0 || (mes === 0 && fe.getDate() < fn.getDate())) {
      edadAlExpedir--;
    }

    // Validación estricta de 18 años
    if (edadAlExpedir !== 18) {
      setError("La fecha de expedición debe ser en el año que cumplió sus 18 años.");
      return;
    }

    if (fe > hoyDate) {
      setError("La fecha de expedición no puede ser futura.");
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
    // Nueva validación de teléfonos duplicados
    if (formData.telefono === formData.contactotelefono) {
      setError("El teléfono de emergencia no puede ser el mismo que su teléfono personal.");
      return;
    }

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
            src="/Universidad_Colegio_Mayor_de_Cundinamarca.png" 
            alt="Logo Unicolmayor"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="h-6 w-1px bg-blue-400/50 mx-2 hidden sm:block"></div>
        <span className="font-black text-white text-lg tracking-tighter uppercase hidden sm:block">
          ARL Registro
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
                <input 
                    name="correo" 
                    type="email" 
                    placeholder="correo@universidadmayor.edu.co" 
                    required 
                    pattern=".+@universidadmayor\.edu\.co"
                    value={formData.correo || ""} 
                    onChange={handleChange} 
                    className="p-3 border rounded-xl text-black bg-slate-50" 
                    title="Debe usar el correo institucional (@universidadmayor.edu.co)"
                  />
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

                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center group hover:border-blue-500 transition-colors">
                  <div className="mb-3 p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <p className="text-[12px] font-black text-blue-800 mb-1 uppercase tracking-tight">
                    Carga tus documentos aquí
                  </p>
                  <p className="text-[10px] text-blue-600 mb-4 font-medium">
                    (Cédula, Carnet estudiantil y Certificado EPS en PDF)
                  </p>
                  
                  {fileUrls.length < 3 ? (
                    <UploadButton
                      endpoint="pdfUploader"
                      appearance={{
                        button: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm w-full",
                        allowedContent: "hidden"
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) return "Seleccionar Archivos";
                          return "Cargando...";
                        },
                      }}
                      // CORRECCIÓN AQUÍ: Verificamos la estructura de la respuesta
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          console.log("Archivos subidos:", res);
                          const nuevosArchivos = res.map(f => ({ 
                            name: f.name, 
                            url: f.url 
                          }));
                          
                          // Actualizamos el estado acumulando los archivos
                          setFileUrls((prev) => {
                            const total = [...prev, ...nuevosArchivos];
                            return total.slice(0, 3); // Mantenemos el límite de 3
                          });
                          setError(""); // Limpiamos errores previos al subir con éxito
                        }
                      }}
                      onUploadError={(err) => {
                        console.error(err);
                        setError(`Error al subir: ${err.message}`);
                      }}
                    />
                  ) : (
                    <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold py-2 px-4 rounded-lg border border-emerald-200">
                      ✓ Límite de archivos alcanzado
                    </div>
                  )}

                  {/* LISTA DE ARCHIVOS MEJORADA */}
                  {fileUrls.length > 0 && (
                    <div className="mt-6 w-full space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase ml-1">Archivos listos ({fileUrls.length}/3):</p>
                      {fileUrls.map((f, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="min-w-24px h-6 bg-red-50 text-red-500 rounded flex items-center justify-center text-[10px] font-bold">PDF</div>
                            <span className="truncate text-[11px] text-slate-700 font-bold">{f.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setFileUrls(fileUrls.filter((_, index) => index !== i))}
                            className="ml-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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