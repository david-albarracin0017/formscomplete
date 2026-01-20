'use client';
import { useState } from 'react';
import { registrarUsuario } from './actions';

export default function MultiStepPage() {
  const [step, setStep] = useState(1);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Registro de Datos Personales</h2>

        {/* Progreso (Tus círculos del 1 al 4) */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {num}
              </div>
              {num < 4 && <div className={`w-10 h-1 (border-t) ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <form action={registrarUsuario}>
          {/* PASO 1: Datos Básicos */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
              <h3 className="col-span-2 font-bold border-b pb-2 text-black">Datos básicos</h3>
              <input name="nombre" placeholder="Nombre" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
              <input name="segundoNombre" placeholder="Segundo nombre" pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
              <input name="apellido" placeholder="Apellido" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
              <input name="segundoApellido" placeholder="Segundo apellido" pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
              <select name="genero" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Género</option>
                <option>Masculino</option>
                <option>Femenino</option>
              </select>
              <input name="telefono" placeholder="Teléfono" pattern="[0-9]{7,15}" className="p-2 border rounded text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
              <input type="email" name="correo" placeholder="Correo institucional" className="p-2 border rounded col-span-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          )}

          {/* PASO 2: Identificación */}
         {step === 2 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-300">
    <h3 className="col-span-full font-bold border-b pb-2 text-black">Identificación</h3>
    
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
      <select name="tipoIdentificacion" className="p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white">
        <option>CC</option><option>TI</option><option>CE</option>
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Número de Identificación</label>
      <input name="numeroIdentificacion" placeholder="Ej: 12345678" className="p-2 border rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 bg-white" />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Fecha de Expedición</label>
      <input type="date" name="FechaExpedicion" required value={formData.FechaExpedicion || ""} onChange={handleChange} className="p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white" />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
      <input type="date" name="fechaNacimiento" className="p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white" />
    </div>
  </div>
)}

          {/* PASO 3: Residencia y afiliación */}
{step === 3 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-300">
    <h3 className="col-span-full font-bold border-b pb-2 text-gray-700">Residencia y afiliación</h3>
    <input name="direccion" placeholder="Dirección" required  pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
    <input name="municipio" placeholder="Municipio" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
    <input name="eps" placeholder="EPS" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
    <input name="arl" placeholder="ARL" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
      <select name="grupoSanguineo" className="p-2 border border-gray-300 rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-500">
        <option value="">Seleccione</option>
        <option>A</option>
        <option>B</option>
        <option>AB</option>
        <option>O</option>
      </select>
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Factor RH</label>
      <select name="rh" className="p-2 border border-gray-300 rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-500">
        <option value="">Seleccione</option>
        <option value="+">Positivo (+)</option>
        <option value="-">Negativo (-)</option>
      </select>
    </div>
  </div>
)}

{/* PASO 4: Contacto y Documentos */}
{step === 4 && (
  <div className="space-y-6 animate-in slide-in-from-right duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <h3 className="col-span-full font-bold border-b pb-2 text-gray-700">Contacto de emergencia</h3>
      <input name="contactoNombre" placeholder="Nombre" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$"className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
      <input name="contactoApellido" placeholder="Apellido" required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$" className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" />
      <input name="contactoTelefono" placeholder="Teléfono" pattern="[0-9]{7,15}"  className="p-2 border rounded col-span-full text-gray-900" />
    </div>

    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="font-bold mb-2 text-blue-800">Documentos (solo archivos PDF)</h3>
      <input 
        type="file" 
        name="documentos" 
        multiple 
        accept="application/pdf" 
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <p className="text-xs text-gray-500 mt-2 italic">* Los archivos se procesarán en el servidor.</p>
    </div>
  </div>
)}

          {/* BOTONES */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="bg-gray-500 text-white px-6 py-2 rounded">
                Atrás
              </button>
            )}
            
            <div className="ml-auto">
              {step < 4 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="bg-blue-600 text-white px-6 py-2 rounded">
                  Siguiente
                </button>
              ) : (
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
                  Guardar 
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
