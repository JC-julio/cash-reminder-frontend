export type InstallmentStatus = "paid" | "overdue" | "due_today" | "pending";
export type PaymentType = "cash" | "card";

export type Category = {
  id: number;
  name: string;
  color: string;
  payments_count: number;
  created_at: string;
};

export type CardSettings = {
  closing_day: number;
  due_day: number;
  updated_at: string;
};

export type TimelineEntry = {
  id: number;
  payment_id: number;
  description: string;
  category: string;
  category_color: string;
  purchase_date: string;
  payment_type: PaymentType;
  installment_number: number;
  installments_count: number;
  amount: string;
  month: string;
  due_date: string;
  paid_at: string | null;
  status: InstallmentStatus;
};

export type Payment = {
  id: number;
  description: string;
  category: Category | null;
  amount: string;
  purchase_date: string;
  payment_type: PaymentType;
  installments_count: number;
  first_due_date: string | null;
  installment_preview: TimelineEntry[];
  created_at: string;
  updated_at: string;
};

export type MonthlySummary = {
  month: string;
  cash_total: string;
  invoice_total: string;
  total: string;
  remaining_invoice_after_month: string;
  paid_total: string;
  open_total: string;
  overdue_total: string;
  entries: TimelineEntry[];
};

export type DashboardPayload = {
  payments: Payment[];
  monthly_summary: MonthlySummary[];
  categories: Category[];
  card_settings: CardSettings;
};

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está rodando.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const firstError = data
      ? Object.values(data).flat().find((value) => typeof value === "string")
      : null;
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : typeof firstError === "string"
          ? firstError
          : "A API recusou a requisição.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function money(value: string | number) {
  return currencyFormatter.format(Number(value));
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

export function formatMonth(value: string) {
  return monthFormatter.format(new Date(`${value}-01T12:00:00`));
}

export function todayInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function normalizeAmount(value: string) {
  return value.replace(/\./g, "").replace(",", ".");
}
