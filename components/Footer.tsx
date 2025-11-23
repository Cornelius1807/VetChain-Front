export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-700 md:grid-cols-3">
        <div>
          <div className="mb-3 font-semibold">Politicas y condiciones</div>
          <ul className="space-y-1">
            <li>Politica de datos personales</li>
            <li>Condicion de promociones</li>
            <li>Terminos y condiciones</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-semibold">Atencion al cliente</div>
          <ul className="space-y-1">
            <li>Atencion al cliente</li>
            <li>Horarios de atencion</li>
            <li>Preguntas frecuentes</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-semibold">Siguenos</div>
          <div className="flex items-center gap-3 text-slate-500">Facebook Instagram YouTube</div>
        </div>
      </div>
      <div className="bg-teal-700 text-xs text-white">
        <div className="mx-auto max-w-6xl px-4 py-3">(c) 2025 VetChain SAC, Av. 28 de Julio 1111, Miraflores, Lima, Peru</div>
      </div>
    </footer>
  );
}
