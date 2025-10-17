export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-slate-700 text-sm">
        <div>
          <div className="font-semibold mb-3">POLÍTICAS Y CONDICIONES</div>
          <ul className="space-y-1">
            <li>Políticas de Datos Personales</li>
            <li>Condición de Promociones</li>
            <li>Términos y Condiciones</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">ATENCIÓN AL CLIENTE</div>
          <ul className="space-y-1">
            <li>Atención al Cliente</li>
            <li>Horarios de Atención</li>
            <li>Preguntas Frecuentes</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">SÍGUENOS</div>
          <div className="flex items-center gap-3 text-slate-500">  </div>
        </div>
      </div>
      <div className="bg-teal-700 text-white text-xs">
        <div className="mx-auto max-w-6xl px-4 py-3">
          ©2025 VetChain SAC, RUC 34563235. Av. 28 de Julio 1111, Miraflores, Lima, Perú
        </div>
      </div>
    </footer>
  );
}

