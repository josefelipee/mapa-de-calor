import { useState } from 'react';
import { APP_TITLE, APP_SUBTITLE } from '../config/mockUsers';

interface LoginProps {
  onLogin: (email: string) => void;
}

const LOGO = `${import.meta.env.BASE_URL}logo.png`;

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19.5c1.2-3.2 3.9-5 7-5s5.8 1.8 7 5" strokeLinecap="round" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 20V10M12 20V4M19 20v-7" strokeLinecap="round" />
  </svg>
);

const IconMetrics = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19h16M7 16l3-4 3 2 4-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFilter = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 6.5l4 4" strokeLinecap="round" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="9" r="3" />
    <path d="M3 19c.9-2.6 3.2-4 6-4s5.1 1.4 6 4" strokeLinecap="round" />
    <path d="M16 6.5a3 3 0 010 5.6M17.5 19c-.4-1.4-1.1-2.5-2-3.3" strokeLinecap="round" />
  </svg>
);

const DESTAQUES = [
  { icon: <IconChart />, titulo: 'Visão macro e detalhada', descricao: 'Compare semanas e dias em um só lugar' },
  { icon: <IconMetrics />, titulo: 'Total, média e pico', descricao: 'Indicadores de volume e pressão' },
  { icon: <IconFilter />, titulo: 'Filtros por projeto, tipo e período', descricao: 'Encontre rapidamente o que precisa' },
  { icon: <IconEdit />, titulo: 'Edição e gestão de registros', descricao: 'Mantenha os dados sempre atualizados' },
];

const HEAT_CORES = ['bg-[#79c879]', 'bg-[#f4c542]', 'bg-[#f2994a]', 'bg-[#eb5757]'];
const HEAT_PATTERN = [
  0, 0, 1, 2, 3, 0, 1, 0, 1, 2, 0, 0, 2, 3, 1, 0, 0, 1, 2, 2, 0, 3, 0, 1, 1, 2, 0, 0, 1, 3, 2, 0, 0, 1, 1, 2,
];

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-corporate-950 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        {/* Painel esquerdo (institucional) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-corporate-950 via-[#0b2545] to-blue-900 p-8 lg:p-10 md:flex">
          {/* Grade decorativa de heatmap */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-16 grid rotate-[-6deg] grid-cols-6 gap-1.5 opacity-[0.22]"
          >
            {HEAT_PATTERN.map((c, i) => (
              <span key={i} className={`h-7 w-11 rounded ${HEAT_CORES[c]}`} />
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-corporate-950 via-corporate-950/80 to-transparent"
          />

          <div className="relative z-10 flex items-center gap-3">
            <img src={LOGO} alt={APP_TITLE} className="h-11 w-11 rounded-xl object-contain shadow-md" />
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-wider text-white">{APP_TITLE}</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-200/70">{APP_SUBTITLE}</p>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <h2 className="max-w-sm text-3xl font-bold leading-tight text-white lg:text-4xl">
              Visualize a ocupação da equipe de forma{' '}
              <span className="text-blue-400">simples e estratégica.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-100/80">
              Acompanhe a alocação por projeto, semana e dia, identifique picos de demanda e tome decisões com mais
              agilidade.
            </p>
          </div>

          <ul className="relative z-10 space-y-4">
            {DESTAQUES.map(d => (
              <li key={d.titulo} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                  {d.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{d.titulo}</p>
                  <p className="text-xs text-blue-100/70">{d.descricao}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Painel direito (formulário) */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img src={LOGO} alt={APP_TITLE} className="h-10 w-10 rounded-lg object-contain" />
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-wider text-gray-900">{APP_TITLE}</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">{APP_SUBTITLE}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Acesso ao sistema</h2>
          <p className="mt-1 text-sm text-gray-500">Mapa de Calor — Ocupação Semanal</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <IconUser />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Entrar no sistema
              <IconArrow />
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <IconUsers />
              <p className="text-sm font-semibold">Perfis de acesso</p>
            </div>
            <div className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">Visualizador:</span> consulta e análise dos dados
              </p>
              <p>
                <span className="font-semibold text-gray-800">Editor:</span> consulta, análise e edição dos registros
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
