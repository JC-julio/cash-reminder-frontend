import { useEffect, useState } from "react";
import type { Route } from "./+types/categories";
import { AppHeader } from "../components/AppHeader";
import { apiRequest, type Category } from "../lib/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Categorias | Cash Reminder" }];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#047857");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setCategories(await apiRequest<Category[]>("/categories/"));
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível carregar as categorias.");
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await apiRequest<Category>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name, color }),
      });
      setName("");
      await loadCategories();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar a categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) {
      return;
    }

    setError(null);
    try {
      await apiRequest<void>(`/categories/${category.id}/`, { method: "DELETE" });
      await loadCategories();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível remover a categoria.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-stone-950">
      <AppHeader />
      <div className="grid w-full gap-8 px-3 py-8 sm:px-4 lg:grid-cols-[340px_1fr] lg:px-5">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Categorias</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Organize os pagamentos por finalidade e selecione a categoria ao registrar uma compra.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Nome
              <input
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Assinaturas"
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Cor
              <div className="flex h-11 items-center gap-3 rounded-md border border-stone-200 px-3">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-sm uppercase text-stone-500">{color}</span>
              </div>
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : "Adicionar categoria"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-semibold">Categorias cadastradas</h2>
            <p className="mt-1 text-sm text-stone-500">{categories.length} no total</p>
          </div>

          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

          <div className="divide-y divide-stone-100">
            {categories.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">Nenhuma categoria cadastrada.</p>
            ) : (
              categories.map((category) => (
                <article key={category.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-stone-950">{category.name}</h3>
                      <p className="text-sm text-stone-500">
                        {category.payments_count} {category.payments_count === 1 ? "pagamento" : "pagamentos"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeCategory(category)}
                    className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
