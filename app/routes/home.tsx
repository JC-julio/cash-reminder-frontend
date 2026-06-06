import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/home";
import { AppHeader } from "../components/AppHeader";
import {
  apiRequest,
  formatDate,
  formatMonth,
  money,
  normalizeAmount,
  todayInputValue,
  type CardSettings,
  type Category,
  type DashboardPayload,
  type MonthlySummary,
  type Payment,
  type PaymentType,
  type TimelineEntry,
} from "../lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cash Reminder" },
    { name: "description", content: "Controle simples de pagamentos pessoais." },
  ];
}

type PaymentForm = {
  description: string;
  category_id: string;
  amount: string;
  purchase_date: string;
  payment_type: PaymentType;
  installments_count: number;
};

function initialForm(): PaymentForm {
  const today = todayInputValue();
  return {
    description: "",
    category_id: "",
    amount: "",
    purchase_date: today,
    payment_type: "cash",
    installments_count: 1,
  };
}

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cardSettings, setCardSettings] = useState<CardSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState<PaymentForm | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<DashboardPayload>("/dashboard/");
      setPayments(data.payments);
      setMonthlySummary(data.monthly_summary);
      setCategories(data.categories);
      setCardSettings(data.card_settings);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível carregar os pagamentos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!editingPayment) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditingPayment(null);
        setEditForm(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [editingPayment]);

  const currentMonth = useMemo(() => {
    const currentKey = todayInputValue().slice(0, 7);
    return monthlySummary.find((month) => month.month === currentKey);
  }, [monthlySummary]);

  const maxMonthTotal = useMemo(
    () => Math.max(1, ...monthlySummary.map((month) => Number(month.total))),
    [monthlySummary],
  );

  const totalRegistered = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const dashboardIndicators = useMemo(() => {
    const entries = monthlySummary.flatMap((month) => month.entries);
    const nextMonthDate = new Date(`${todayInputValue()}T12:00:00`);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthKey = [
      nextMonthDate.getFullYear(),
      String(nextMonthDate.getMonth() + 1).padStart(2, "0"),
    ].join("-");
    const cardTotal = payments
      .filter((payment) => payment.payment_type === "card")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const cashTotal = payments
      .filter((payment) => payment.payment_type === "cash")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const futureOpen = entries
      .filter((entry) => entry.payment_type === "card" && entry.status !== "paid")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    const nextPending = entries
      .filter((entry) => entry.payment_type === "card" && entry.status !== "paid")
      .sort((first, second) => first.due_date.localeCompare(second.due_date))[0];
    const categoryMap = new Map<string, { name: string; color: string; total: number }>();
    const nextMonthCategoryMap = new Map<string, { name: string; color: string; total: number }>();

    entries.forEach((entry) => {
      const key = entry.category || "Sem categoria";
      const current = categoryMap.get(key) ?? {
        name: entry.category || "Sem categoria",
        color: entry.category_color || "#a8a29e",
        total: 0,
      };
      current.total += Number(entry.amount);
      categoryMap.set(key, current);

      if (entry.month === nextMonthKey) {
        const nextMonthCategory = nextMonthCategoryMap.get(key) ?? {
          name: entry.category || "Sem categoria",
          color: entry.category_color || "#a8a29e",
          total: 0,
        };
        nextMonthCategory.total += Number(entry.amount);
        nextMonthCategoryMap.set(key, nextMonthCategory);
      }
    });

    const categoryTotals = [...categoryMap.values()].sort(
      (first, second) => second.total - first.total,
    );
    const nextMonthCategoryTotals = [...nextMonthCategoryMap.values()].sort(
      (first, second) => second.total - first.total,
    );

    return {
      cardTotal,
      cashTotal,
      futureOpen,
      nextPending,
      nextMonthKey,
      nextMonthTopCategory: nextMonthCategoryTotals[0],
      timelineTopCategory: categoryTotals[0],
      categoryTotals,
    };
  }, [monthlySummary, payments]);

  const paymentsById = useMemo(
    () => new Map(payments.map((payment) => [payment.id, payment])),
    [payments],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      description: form.description,
      category_id: form.category_id ? Number(form.category_id) : null,
      amount: normalizeAmount(form.amount),
      purchase_date: form.purchase_date,
      payment_type: form.payment_type,
      installments_count: form.payment_type === "cash" ? 1 : form.installments_count,
    };

    try {
      await apiRequest<Payment>("/payments/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setForm((current) => ({
        ...initialForm(),
        category_id: current.category_id,
        payment_type: current.payment_type,
        installments_count: current.installments_count,
      }));
      await loadDashboard();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar o pagamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePayment(paymentId: number, description: string) {
    if (!window.confirm(`Excluir "${description}" e todas as parcelas vinculadas?`)) {
      return;
    }

    setError(null);
    try {
      await apiRequest<void>(`/payments/${paymentId}/`, { method: "DELETE" });
      await loadDashboard();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível remover o pagamento.");
    }
  }

  async function toggleInstallment(entry: TimelineEntry) {
    setError(null);
    try {
      await apiRequest(`/installments/${entry.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ paid: entry.status !== "paid" }),
      });
      await loadDashboard();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível atualizar a parcela.");
    }
  }

  function openEditModal(payment: Payment) {
    setEditingPayment(payment);
    setEditForm({
      description: payment.description,
      category_id: payment.category?.id.toString() ?? "",
      amount: payment.amount.replace(".", ","),
      purchase_date: payment.purchase_date,
      payment_type: payment.payment_type,
      installments_count: payment.installments_count,
    });
  }

  function closeEditModal() {
    if (isEditing) {
      return;
    }
    setEditingPayment(null);
    setEditForm(null);
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPayment || !editForm) {
      return;
    }

    setIsEditing(true);
    setError(null);
    try {
      await apiRequest<Payment>(`/payments/${editingPayment.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          description: editForm.description,
          category_id: editForm.category_id ? Number(editForm.category_id) : null,
          amount: normalizeAmount(editForm.amount),
          purchase_date: editForm.purchase_date,
          payment_type: editForm.payment_type,
          installments_count: editForm.payment_type === "cash" ? 1 : editForm.installments_count,
        }),
      });
      setEditingPayment(null);
      setEditForm(null);
      await loadDashboard();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Não foi possível editar o pagamento.");
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-stone-950">
      <AppHeader />
      <div className="flex w-full flex-col gap-8 px-3 py-7 sm:px-4 lg:px-5">
        <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              Visão geral
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pagamentos e próximas faturas
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[620px]">
            <Metric label="Este mês" value={money(currentMonth?.total ?? 0)} />
            <Metric label="Em aberto" value={money(currentMonth?.open_total ?? 0)} />
            <Metric label="Pago" value={money(currentMonth?.paid_total ?? 0)} />
            <Metric
              label="Vencido"
              value={money(currentMonth?.overdue_total ?? 0)}
              tone={Number(currentMonth?.overdue_total ?? 0) > 0 ? "danger" : "default"}
            />
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:self-start"
          >
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-semibold">Novo pagamento</h2>
              <p className="mt-1 text-sm text-stone-500">
                {cardSettings
                  ? `Cartão fecha dia ${cardSettings.closing_day} e vence dia ${cardSettings.due_day}.`
                  : "Carregando configuração do cartão..."}
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Descrição
                <input
                  required
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Ex.: ChatGPT, bicicleta"
                  className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Categoria
                <select
                  value={form.category_id}
                  onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                  className="h-11 rounded-md border border-stone-200 bg-white px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Valor total
                  <input
                    required
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    placeholder="0,00"
                    className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  {form.payment_type === "cash" ? "Data do pagamento" : "Data da compra"}
                  <input
                    required
                    type="date"
                    max={form.payment_type === "cash" ? todayInputValue() : undefined}
                    value={form.purchase_date}
                    onChange={(event) => setForm({ ...form, purchase_date: event.target.value })}
                    className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="grid gap-2 text-sm font-medium text-stone-700">
                Forma de pagamento
                <div className="grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1">
                  {[
                    { value: "cash" as const, label: "À vista" },
                    { value: "card" as const, label: "Cartão" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, payment_type: option.value })}
                      className={`h-10 rounded-sm text-sm font-semibold transition ${
                        form.payment_type === option.value
                          ? "bg-white text-emerald-800 shadow-sm"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.payment_type === "card" && (
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Parcelas no cartão
                <input
                  required
                  type="number"
                  min={1}
                  max={15}
                  value={form.installments_count}
                  onChange={(event) =>
                    setForm({ ...form, installments_count: Number(event.target.value) })
                  }
                  className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 h-12 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Registrar pagamento"}
              </button>
            </div>
          </form>

          <div className="grid gap-8">
            <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-stone-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Linha do tempo</h2>
                  <p className="mt-1 text-sm text-stone-500">Parcelas organizadas por vencimento.</p>
                </div>
                <p className="text-sm font-medium text-stone-600">Total lançado: {money(totalRegistered)}</p>
              </div>

              <div className="mt-5 grid gap-4">
                {isLoading ? (
                  <EmptyState text="Carregando sua linha do tempo..." />
                ) : monthlySummary.length === 0 ? (
                  <EmptyState text="Registre um pagamento para montar sua linha do tempo." />
                ) : (
                  monthlySummary.map((month) => (
                    <MonthRow
                      key={month.month}
                      month={month}
                      maxMonthTotal={maxMonthTotal}
                      onToggleInstallment={toggleInstallment}
                      onDeletePayment={deletePayment}
                      onEditPayment={openEditModal}
                      paymentsById={paymentsById}
                    />
                  ))
                )}
              </div>
            </section>

            <DashboardIndicators
              isLoading={isLoading}
              paymentsCount={payments.length}
              indicators={dashboardIndicators}
            />
          </div>
        </section>
      </div>
      {editingPayment && editForm && (
        <EditPaymentModal
          payment={editingPayment}
          form={editForm}
          categories={categories}
          isSaving={isEditing}
          onChange={setEditForm}
          onClose={closeEditModal}
          onSubmit={handleEditSubmit}
        />
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className={`mt-2 text-base font-semibold sm:text-lg ${tone === "danger" ? "text-red-700" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-stone-500">{text}</p>;
}

function EditPaymentModal({
  payment,
  form,
  categories,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: {
  payment: Payment;
  form: PaymentForm;
  categories: Category[];
  isSaving: boolean;
  onChange: (form: PaymentForm) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-payment-title"
        className="w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl sm:w-[36rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4">
          <div>
            <h2 id="edit-payment-title" className="text-lg font-semibold text-stone-950">
              Editar pagamento
            </h2>
            <p className="mt-1 text-sm text-stone-500">{payment.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Descrição
            <input
              autoFocus
              required
              value={form.description}
              onChange={(event) => onChange({ ...form, description: event.target.value })}
              className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Categoria
            <select
              value={form.category_id}
              onChange={(event) => onChange({ ...form, category_id: event.target.value })}
              className="h-11 rounded-md border border-stone-200 bg-white px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Valor total
              <input
                required
                inputMode="decimal"
                value={form.amount}
                onChange={(event) => onChange({ ...form, amount: event.target.value })}
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              {form.payment_type === "cash" ? "Data do pagamento" : "Data da compra"}
              <input
                required
                type="date"
                max={form.payment_type === "cash" ? todayInputValue() : undefined}
                value={form.purchase_date}
                onChange={(event) => onChange({ ...form, purchase_date: event.target.value })}
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="grid gap-2 text-sm font-medium text-stone-700">
            Forma de pagamento
            <div className="grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1">
              {[
                { value: "cash" as const, label: "À vista" },
                { value: "card" as const, label: "Cartão" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...form, payment_type: option.value })}
                  className={`h-10 rounded-sm text-sm font-semibold transition ${
                    form.payment_type === option.value
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {form.payment_type === "card" && (
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Parcelas no cartão
              <input
                required
                type="number"
                min={1}
                max={15}
                value={form.installments_count}
                onChange={(event) =>
                  onChange({ ...form, installments_count: Number(event.target.value) })
                }
                className="h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-md border border-stone-200 px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MonthRow({
  month,
  maxMonthTotal,
  onToggleInstallment,
  onDeletePayment,
  onEditPayment,
  paymentsById,
}: {
  month: MonthlySummary;
  maxMonthTotal: number;
  onToggleInstallment: (entry: TimelineEntry) => Promise<void>;
  onDeletePayment: (paymentId: number, description: string) => Promise<void>;
  onEditPayment: (payment: Payment) => void;
  paymentsById: Map<number, Payment>;
}) {
  const progress = Math.max(3, (Number(month.total) / maxMonthTotal) * 100);

  return (
    <article className="grid gap-3 rounded-lg border border-stone-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold capitalize">{formatMonth(month.month)}</h3>
          <p className="mt-1 text-sm text-stone-500">
            Fatura {money(month.invoice_total)} + à vista {money(month.cash_total)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-lg font-semibold">{money(month.total)}</p>
          <p className="text-sm font-medium text-stone-500">
            {money(month.open_total)} em aberto
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-emerald-700" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-2 pt-1">
        {month.entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-3 rounded-md bg-stone-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {entry.category_color && (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.category_color }} />
                )}
                <span className="font-medium text-stone-800">{entry.description}</span>
                {entry.payment_type === "card" && entry.installments_count > 1 && (
                  <span className="text-xs text-stone-500">
                    {entry.installment_number}/{entry.installments_count}
                  </span>
                )}
                <StatusLabel entry={entry} />
              </div>
              <p className="mt-1 text-xs text-stone-500">Vence em {formatDate(entry.due_date)}</p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="font-semibold">{money(entry.amount)}</span>
              {entry.payment_type === "card" && (
                <button
                  type="button"
                  onClick={() => void onToggleInstallment(entry)}
                  className={`h-9 rounded-md px-3 text-sm font-medium transition ${
                    entry.status === "paid"
                      ? "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                      : "bg-emerald-800 text-white hover:bg-emerald-900"
                  }`}
                >
                  {entry.status === "paid" ? "Desfazer" : "Marcar paga"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const payment = paymentsById.get(entry.payment_id);
                  if (payment) {
                    onEditPayment(payment);
                  }
                }}
                title="Editar pagamento"
                aria-label={`Editar ${entry.description}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={() => void onDeletePayment(entry.payment_id, entry.description)}
                className="h-9 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
                aria-label={`Excluir ${entry.description} e todas as parcelas`}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatusLabel({ entry }: { entry: TimelineEntry }) {
  const status = {
    paid: { label: "Pago", className: "bg-emerald-100 text-emerald-800" },
    overdue: { label: "Vencido", className: "bg-red-100 text-red-800" },
    due_today: { label: "Vence hoje", className: "bg-amber-100 text-amber-800" },
    pending: { label: "Pendente", className: "bg-stone-200 text-stone-700" },
  }[entry.status];

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label} - {entry.category}</span>;
}

function DashboardIndicators({
  isLoading,
  paymentsCount,
  indicators,
}: {
  isLoading: boolean;
  paymentsCount: number;
  indicators: {
    cardTotal: number;
    cashTotal: number;
    futureOpen: number;
    nextPending: TimelineEntry | undefined;
    nextMonthKey: string;
    nextMonthTopCategory: { name: string; color: string; total: number } | undefined;
    timelineTopCategory: { name: string; color: string; total: number } | undefined;
    categoryTotals: Array<{ name: string; color: string; total: number }>;
  };
}) {
  const categoriesTotal = indicators.categoryTotals.reduce(
    (sum, category) => sum + category.total,
    0,
  );
  let accumulatedPercentage = 0;
  const pieSegments = indicators.categoryTotals.map((category) => {
    const start = accumulatedPercentage;
    const percentage = categoriesTotal > 0 ? (category.total / categoriesTotal) * 100 : 0;
    accumulatedPercentage += percentage;
    return `${category.color} ${start}% ${accumulatedPercentage}%`;
  });
  const pieBackground =
    pieSegments.length > 0 ? `conic-gradient(${pieSegments.join(", ")})` : "#e7e5e4";

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="border-b border-stone-100 pb-4">
        <h2 className="text-lg font-semibold">Indicadores</h2>
        <p className="mt-1 text-sm text-stone-500">Visão consolidada dos pagamentos cadastrados.</p>
      </div>

      {isLoading ? (
        <EmptyState text="Calculando indicadores..." />
      ) : paymentsCount === 0 ? (
        <EmptyState text="Cadastre pagamentos para visualizar os indicadores." />
      ) : (
        <div className="mt-5 grid gap-6">
          <div className="grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-3">
            <IndicatorValue label="Total no cartão" value={money(indicators.cardTotal)} />
            <IndicatorValue label="Total à vista" value={money(indicators.cashTotal)} />
            <IndicatorValue label="Saldo futuro" value={money(indicators.futureOpen)} />
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-2">
            <CategoryHighlight
              label={`Categoria mais cara em ${formatMonth(indicators.nextMonthKey)}`}
              category={indicators.nextMonthTopCategory}
            />
            <CategoryHighlight
              label="Categoria mais cara na linha do tempo"
              category={indicators.timelineTopCategory}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                Próxima cobrança
              </p>
              {indicators.nextPending ? (
                <div className="mt-3">
                  <p className="text-lg font-semibold text-stone-950">
                    {indicators.nextPending.description}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDate(indicators.nextPending.due_date)} ·{" "}
                    {indicators.nextPending.installment_number}/
                    {indicators.nextPending.installments_count}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-800">
                    {money(indicators.nextPending.amount)}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-500">Nenhuma cobrança pendente.</p>
              )}
            </div>

            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                Gastos por categoria
              </p>
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-[13rem_1fr]">
                <div
                  className="mx-auto aspect-square w-full rounded-full border-8 border-white shadow-sm"
                  style={{ background: pieBackground }}
                  role="img"
                  aria-label="Gráfico em pizza dos gastos por categoria"
                />
                <div className="grid gap-3">
                  {indicators.categoryTotals.map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium text-stone-700">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold text-stone-950">
                          {money(category.total)}
                        </span>
                        <span className="text-xs text-stone-500">
                          {categoriesTotal > 0
                            ? `${((category.total / categoriesTotal) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CategoryHighlight({
  label,
  category,
}: {
  label: string;
  category: { name: string; color: string; total: number } | undefined;
}) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{label}</p>
      {category ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2 font-semibold text-stone-950">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="truncate">{category.name}</span>
          </span>
          <span className="shrink-0 text-lg font-semibold text-emerald-800">
            {money(category.total)}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-stone-500">Nenhum gasto previsto.</p>
      )}
    </div>
  );
}

function IndicatorValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
