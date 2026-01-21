'use client';
import { useEffect, useState, ChangeEvent } from 'react';
import { registrarUsuario } from './actions';
import { UploadButton } from "./utils/uploadthing";

// Definimos la estructura de los datos para que TypeScript no marque error
interface FormDataState {
  Nombre?: string;
  Apellido?: string;
  Genero?: string;
  Telefono?: string;
  Correo?: string;
  TipoIdentificacion?: string;
  NumeroIdentificacion?: string;
  FechaNacimiento?: string;
  FechaExpedicion?: string;
  Direccion?: string;
  Municipio?: string;
  EPS?: string;
  AFP?: string;
  ARL?: string;
  ContactoEmergencia?: string;
  ContactoTelefono?: string;
}

export default function MultiStepPage() {
  const [step, setStep] = useState(1);
  const [fileUrls, setFileUrls] = useState<{ name: string; url: string }[]>([]);
  const [formData, setFormData] = useState<FormDataState>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Maneja los cambios de input con tipos de React
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarPaso = () => {
    const selector = `#step-${step}`;
    // Seleccionamos ambos tipos de elementos
    const inputs = document.querySelectorAll(`${selector} input, ${selector} select`) as NodeListOf<HTMLInputElement | HTMLSelectElement>;
    let valido = true;

    inputs.forEach(input => {
      // 1. Verificamos si es obligatorio
      if (input.required && !input.checkValidity()) {
        input.reportValidity();
        valido = false;
      }
      
      // 2. Verificamos el pattern solo si el elemento es un HTMLInputElement (los select no tienen pattern)
      if (input instanceof HTMLInputElement && input.pattern) {
        if (!input.checkValidity()) {
          input.reportValidity();
          valido = false;
        }
      }
    });

    if (valido) setStep(step + 1);
  };

  const reiniciarFormulario = () => {
    setFormData({});
    setStep(1);
    setError("");
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // 1. Verificación: Si el array de URLs de UploadThing está vacío, no permite continuar
  if (fileUrls.length === 0) {
    setError("Por favor, sube los documentos antes de finalizar.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // 2. Preparación de los datos del formulario (textos)
    const finalFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      finalFormData.append(key, value as string);
    });

    // 3. DIFERENCIA CLAVE: Se envían dos argumentos. 
    // finalFormData va a la tabla 'personas' y fileUrls a la tabla 'documentos'
    const res = await registrarUsuario(finalFormData, fileUrls);
    
    if (!res.success) {
      setError(res.error || "Error al registrar");
    } else {
      // 4. Limpieza del formulario y de los archivos tras el éxito en la DB
      setShowSuccess(true);
      setStep(1);
      setFormData({});
      setFileUrls([]); 
    }
  } catch (err) {
    setError("Error crítico en el envío");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Alerta de Éxito */}
      {showSuccess && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top duration-500">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 border-2 border-green-400">
            <div className="bg-white text-green-600 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">¡Registro Exitoso!</p>
              <p className="text-sm opacity-90">Los datos se guardaron en Drive y SQL.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Registro de Datos Personales</h2>

        {/* Círculos de Progreso */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {num}
              </div>
              {num < 4 && <div className={`w-10 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center font-medium">{error}</div>}

        <form onSubmit={manejarEnvio}>
          
          {step === 1 && (
            <div id="step-1" className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
              <h3 className="col-span-2 font-bold border-b pb-2 text-black text-sm uppercase tracking-wide">Datos básicos</h3>
              <input name="Nombre" placeholder="Primer Nombre" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.Nombre || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="SNombre" placeholder="Segundo Nombre"  pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.Nombre || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="Apellido" placeholder="Primer Apellido" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.Apellido || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="SApellido" placeholder="Segundo Apellido" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.Nombre || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <select name="Genero" required value={formData.Genero || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white">
                <option value="">Género</option>
                <option>Masculino</option>
                <option>Femenino</option>
              </select>
              <input name="Telefono" placeholder="Teléfono" required pattern="[0-9]{7,15}" value={formData.Telefono || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input type="email" name="Correo" placeholder="Correo institucional" required value={formData.Correo || ""} onChange={handleChange} className="p-2 border rounded col-span-2 text-gray-900 bg-white" />
            </div>
          )}

          {step === 2 && (
            <div id="step-2" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-300">
              <h3 className="col-span-full font-bold border-b pb-2 text-black text-sm uppercase tracking-wide">Identificación</h3>
              <select name="TipoIdentificacion" required value={formData.TipoIdentificacion || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white">
                <option value="">Tipo Documento</option>
                <option>CC</option><option>TI</option><option>CE</option><option>NIUP</option>
              </select>
              <input name="NumeroIdentificacion" placeholder="Número identificación" required pattern="[0-9]+" value={formData.NumeroIdentificacion || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Fecha de Nacimiento</label>
                <input type="date" name="FechaNacimiento" required value={formData.FechaNacimiento || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Fecha de Expedición</label>
                <input type="date" name="FechaExpedicion" required value={formData.FechaExpedicion || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div id="step-3" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-300">
              <h3 className="col-span-full font-bold border-b pb-2 text-gray-700 text-sm uppercase tracking-wide">Residencia y afiliación</h3>
              <input name="Direccion" placeholder="Dirección" required value={formData.Direccion || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="Municipio" placeholder="Municipio" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.Municipio || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="EPS" placeholder="EPS" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" value={formData.EPS || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
            </div>
          )}

         {step === 4 && (
          <div id="step-4" className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-full font-bold border-b pb-2 text-gray-700 text-sm uppercase tracking-wide">Contacto de emergencia</h3>
              <input name="ContactoEmergencia" placeholder="Nombre completo" required value={formData.ContactoEmergencia || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
              <input name="ContactoTelefono" placeholder="Teléfono" required value={formData.ContactoTelefono || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 bg-white" />
            </div>
    
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-200">
              <h3 className="font-bold mb-4 text-blue-800 text-sm">Documentación Requerida</h3>
              
              <UploadButton
                endpoint="pdfUploader"
                // Personalización de textos
                content={{
                  button({ ready }) {
                    if (ready) return "";
                    return "Cargando configurador...";
                  },
                  allowedContent:"Subir certificados de afiliación EPS y AFP"
                  
                }}
                // Personalización de estilos para asegurar visibilidad
                appearance={{
                  button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-all w-full md:w-auto",
                  allowedContent: "text-blue-600 text-xs mt-2 font-medium"
                }}
                onClientUploadComplete={(res) => {
                  if (res) {
                    setFileUrls(res.map(f => ({ name: f.name, url: f.url })));
                    alert("Certificados cargados correctamente");
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Error al subir: ${error.message}`);
                }}
              />
                {fileUrls.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">{fileUrls.length} archivos listos.</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium transition-colors">Atrás</button>
            )}
            <div className="ml-auto">
              {step < 4 ? (
                <button type="button" onClick={validarPaso} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors">Siguiente</button>
              ) : (
                <button type="submit" disabled={loading} className={`${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded font-medium transition-colors`}>
                  {loading ? 'Guardando...' : 'Finalizar Registro'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}