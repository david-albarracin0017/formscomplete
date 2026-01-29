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

    if (fileUrls.length < 4) {
      setError("Debes subir los 4 documentos requeridos para continuar.");
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
        {/* Aumentamos h-12 -> h-16 y w-48 -> w-60. Eliminamos bg-white */}
        <div className="relative h-16 w-60 transition-all duration-300">
          <NextImage 
            src="/Universidad_Colegio_Mayor_de_Cundinamarca.png" 
            alt="Logo Unicolmayor"
            fill
            className="object-contain" // Quitamos el padding para que use todo el espacio
            priority
            quality={100} // Forzamos la máxima calidad de compresión de Next.js
            sizes="(max-width: 768px) 100vw, 240px" // Ayuda a mejorar la nitidez en diferentes pantallas
          />
        </div>
        
        <div className="h-8 w-1px bg-blue-400/50 mx-2 hidden sm:block"></div>
        <span className="font-black text-white text-xl tracking-tighter uppercase hidden sm:block">
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

            {/* PASO 4: EMERGENCIA Y ARCHIVOS PERSONALIZADOS */}
            {step === 4 && (
              <div id="step-4" className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Emergencia y Documentos</h2>
                
                <div className="grid grid-cols-1 gap-3">
                  <input name="contactoemergencia" placeholder="Nombre Contacto Emergencia" required pattern={soloLetras} value={formData.contactoemergencia || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Solo letras permitidas" />
                  <input name="contactotelefono" placeholder="Teléfono Emergencia (Mín. 10)" required pattern={telefonoRegEx} value={formData.contactotelefono || ""} onChange={handleChange} className="p-3 border rounded-xl text-black bg-slate-50" title="Debe tener al menos 10 números" />
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Documentación Requerida (PDF)</p>
                  
                  {/* GRILLA DE RECUADROS PERSONALIZADOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Cédula de Ciudadanía",
                      "Carnet Estudiantil",
                      "Hoja de Matrícula",
                      "Certificado EPS"
                    ].map((docNombre, index) => {
                      const archivoSubido = fileUrls[index];
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            archivoSubido 
                              ? 'border-emerald-200 bg-emerald-50' 
                              : 'border-dashed border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <span className={`text-[10px] font-black uppercase ${archivoSubido ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {index + 1}. {docNombre}
                            </span>
                            
                            {archivoSubido ? (
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-emerald-700 font-medium truncate max-w-120px">
                                  {archivoSubido.name}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setFileUrls(fileUrls.filter((_, i) => i !== index))}
                                  className="text-emerald-600 hover:text-red-500 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Pendiente de subir</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTÓN DE SUBIDA (Solo visible si faltan archivos) */}
                  {fileUrls.length < 4 && (
                    <div className="mt-4">
                      <UploadButton
                        endpoint="pdfUploader"
                        appearance={{
                          button: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all w-full text-sm",
                          allowedContent: "hidden"
                        }}
                        content={{
                          button({ ready }) { return ready ? `Subir archivo restante (${4 - fileUrls.length})` : "Cargando..."; }
                        }}
                        onClientUploadComplete={(res) => {
                          if (res) {
                            const nuevos = res.map(f => ({ name: f.name, url: f.url }));
                            setFileUrls((prev) => [...prev, ...nuevos].slice(0, 4));
                          }
                        }}
                        onUploadError={(err) => setError(`Error: ${err.message}`)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 bg-slate-100 text-slate-500 p-4 rounded-xl font-bold">Atrás</button>
                  <button 
                    type="submit" 
                    disabled={loading || fileUrls.length < 4} 
                    className="flex-1 bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-emerald-700"
                  >
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