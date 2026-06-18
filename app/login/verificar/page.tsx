export default function VerificarPage() {
  return (
    <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Revisá tu email</h1>
        <p className="text-gray-500 text-sm">
          Te mandamos un link para ingresar. Hacé clic en ese link y listo.
        </p>
        <p className="text-xs text-gray-400 mt-4">¿No llegó? Revisá la carpeta de spam.</p>
      </div>
    </div>
  )
}
