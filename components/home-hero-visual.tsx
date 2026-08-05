import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';

const workflow = [
  { label: 'Aberta', active: true },
  { label: 'Em análise', active: true },
  { label: 'Em andamento', active: false },
  { label: 'Resolvida', active: false },
];

const incidents = [
  { title: 'Vazamento no corredor', location: 'Bloco A', severity: 'Alta', status: 'Aberta', color: 'bg-orange-500' },
  { title: 'Quase acidente — laboratório', location: 'Bloco B', severity: 'Crítica', status: 'Em análise', color: 'bg-red-500' },
  { title: 'Iluminação apagada', location: 'Área externa', severity: 'Média', status: 'Resolvida', color: 'bg-yellow-500' },
];

const campusBlocks = [
  { name: 'Bloco A', incidents: 2, x: '12%', y: '18%' },
  { name: 'Bloco B', incidents: 1, x: '58%', y: '22%' },
  { name: 'Externa', incidents: 1, x: '38%', y: '62%' },
];

export function HomeHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Painel principal — visão do gestor */}
      <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Painel do gestor</p>
            <p className="text-lg font-semibold text-slate-900">Visão em tempo real</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Mini mapa do campus */}
        <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          {campusBlocks.map((block) => (
            <div
              key={block.name}
              className="absolute flex flex-col items-center"
              style={{ left: block.x, top: block.y }}
            >
              <div className="relative">
                <MapPin className="h-6 w-6 text-blue-600" fill="currentColor" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {block.incidents}
                </span>
              </div>
              <span className="mt-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
                {block.name}
              </span>
            </div>
          ))}
        </div>

        {/* Fluxo de status */}
        <div className="mb-4 flex items-center gap-1">
          {workflow.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center gap-1">
              <div
                className={`h-2 flex-1 rounded-full ${step.active ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
              {i < workflow.length - 1 && <div className="w-0.5" />}
            </div>
          ))}
        </div>
        <div className="mb-4 flex justify-between text-[10px] text-slate-500">
          {workflow.map((step) => (
            <span key={step.label}>{step.label}</span>
          ))}
        </div>

        {/* Lista de ocorrências */}
        <div className="space-y-2">
          {incidents.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.location}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card flutuante — registro mobile */}
      <div className="absolute -left-4 top-8 z-10 w-44 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:-left-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Novo registro</p>
            <p className="text-[10px] text-slate-500">Foto + GPS</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-600">
          <MapPin className="h-3 w-3" />
          Localização capturada
        </div>
      </div>

      {/* Card flutuante — notificação */}
      <div className="absolute -right-2 bottom-16 z-10 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:-right-6">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Alerta enviado</p>
            <p className="text-[10px] leading-snug text-slate-500">
              Gestor notificado por e-mail
            </p>
          </div>
        </div>
      </div>

      {/* Card flutuante — responsável */}
      <div className="absolute -bottom-4 right-8 z-10 hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-md sm:flex sm:items-center sm:gap-2">
        <User className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-[10px] text-slate-500">Responsável</p>
          <p className="text-xs font-medium text-slate-800">Atribuído ao gestor</p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      </div>
    </div>
  );
}
