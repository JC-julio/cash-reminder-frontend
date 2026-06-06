import { NavLink } from "react-router";

const navigation = [
  { to: "/", label: "Visão geral", end: true },
  { to: "/categorias", label: "Categorias" },
  { to: "/cartao", label: "Cartão" },
];

export function AppHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="flex w-full flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
        <NavLink to="/" className="text-lg font-semibold tracking-tight text-stone-950">
          Cash Reminder
        </NavLink>
        <nav className="flex gap-1 overflow-x-auto" aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-800 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
