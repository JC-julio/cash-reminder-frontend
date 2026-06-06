import { useEffect, useState } from "react";
import type { Route } from "./+types/card-settings";
import { AppHeader } from "../components/AppHeader";
import { apiRequest, type CardSettings } from "../lib/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cartão | Cash Reminder" }];
}

export default function CardSettingsPage() {
  const [settings, setSettings] = useState<CardSettings>({ closing_day: 5, due_day: 15, updated_at: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<CardSettings>("/card-settings/")
      .then(setSettings)
      .catch((apiError) =>
        setError(apiError instanceof Error ? apiError.message : "Não foi possível carregar a configuração."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await apiRequest<CardSettings>("/card-settings/", {
        method: "PUT",
        body: JSON.stringify({
          closing_day: settings.closing_day,
          due_day: settings.due_day,
        }),
      });
      setSettings(updated);
      setMessage("Configuração atualizada para as próximas compras parceladas.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar a configuração.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-stone-950">
      <AppHeader />
      <div className="w-full px-3 py-8 sm:px-4 lg:px-5">
        <h1 className="text-3xl font-semibold tracking-tight">Configuração do cartão</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          O fechamento define em qual fatura uma compra entra. O vencimento define a data mensal das parcelas.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Dia de fechamento
              <input
                required
                type="number"
                min={1}
                max={31}
                disabled={isLoading}
                value={settings.closing_day}
                onChange={(event) =>
                  setSettings({ ...settings, closing_day: Number(event.target.value) })
                }
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Dia de vencimento
              <input
                required
                type="number"
                min={1}
                max={31}
                disabled={isLoading}
                value={settings.due_day}
                onChange={(event) => setSettings({ ...settings, due_day: Number(event.target.value) })}
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="mt-5 rounded-md bg-stone-100 px-4 py-3 text-sm leading-6 text-stone-700">
            Compras feitas até o dia {settings.closing_day} entram na fatura que vence no dia{" "}
            {settings.due_day}. Compras posteriores entram na fatura seguinte.
          </div>

          {message && <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="mt-5 h-11 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {isSaving ? "Salvando..." : "Salvar configuração"}
          </button>
        </form>
      </div>
    </main>
  );
}
