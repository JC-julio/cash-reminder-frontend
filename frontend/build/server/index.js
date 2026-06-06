import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
	if (request.method.toUpperCase() === "HEAD") return new Response(null, {
		status: responseStatusCode,
		headers: responseHeaders
	});
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let userAgent = request.headers.get("user-agent");
		let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		let timeoutId = setTimeout(() => abort(), 6e3);
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough({ final(callback) {
					clearTimeout(timeoutId);
					timeoutId = void 0;
					callback();
				} });
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				pipe(body);
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
	});
}
//#endregion
//#region app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	ErrorBoundary: () => ErrorBoundary,
	Layout: () => Layout,
	default: () => root_default,
	links: () => links
});
var links = () => [
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
	}
];
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {})
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
var ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary({ error }) {
	let message = "Algo saiu do esperado";
	let details = "Ocorreu um erro inesperado.";
	let stack;
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Erro";
		details = error.status === 404 ? "A página solicitada não foi encontrada." : error.statusText || details;
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "w-full p-3 pt-16 sm:p-4 sm:pt-16 lg:p-5 lg:pt-16",
		children: [
			/* @__PURE__ */ jsx("h1", { children: message }),
			/* @__PURE__ */ jsx("p", { children: details }),
			stack
		]
	});
});
//#endregion
//#region app/components/AppHeader.tsx
var navigation = [
	{
		to: "/",
		label: "Visão geral",
		end: true
	},
	{
		to: "/categorias",
		label: "Categorias"
	},
	{
		to: "/cartao",
		label: "Cartão"
	}
];
function AppHeader() {
	return /* @__PURE__ */ jsx("header", {
		className: "border-b border-stone-200 bg-white",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex w-full flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-5",
			children: [/* @__PURE__ */ jsx(NavLink, {
				to: "/",
				className: "text-lg font-semibold tracking-tight text-stone-950",
				children: "Cash Reminder"
			}), /* @__PURE__ */ jsx("nav", {
				className: "flex gap-1 overflow-x-auto",
				"aria-label": "Navegação principal",
				children: navigation.map((item) => /* @__PURE__ */ jsx(NavLink, {
					to: item.to,
					end: item.end,
					className: ({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-emerald-800 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"}`,
					children: item.label
				}, item.to))
			})]
		})
	});
}
//#endregion
//#region app/lib/api.ts
var API_BASE_URL = "http://localhost:8000/api";
async function apiRequest(path, init) {
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...init?.headers
			}
		});
	} catch {
		throw new Error("Não foi possível conectar à API. Verifique se o backend está rodando.");
	}
	if (!response.ok) {
		const data = await response.json().catch(() => null);
		const firstError = data ? Object.values(data).flat().find((value) => typeof value === "string") : null;
		throw new Error(typeof data?.detail === "string" ? data.detail : typeof firstError === "string" ? firstError : "A API recusou a requisição.");
	}
	if (response.status === 204) return;
	return response.json();
}
var currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL"
});
var dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
});
var monthFormatter = new Intl.DateTimeFormat("pt-BR", {
	month: "long",
	year: "numeric"
});
function money(value) {
	return currencyFormatter.format(Number(value));
}
function formatDate(value) {
	return dateFormatter.format(/* @__PURE__ */ new Date(`${value}T12:00:00`));
}
function formatMonth(value) {
	return monthFormatter.format(/* @__PURE__ */ new Date(`${value}-01T12:00:00`));
}
function todayInputValue() {
	const now = /* @__PURE__ */ new Date();
	return (/* @__PURE__ */ new Date(now.getTime() - now.getTimezoneOffset() * 6e4)).toISOString().slice(0, 10);
}
function normalizeAmount(value) {
	return value.replace(/\./g, "").replace(",", ".");
}
//#endregion
//#region app/routes/home.tsx
var home_exports = /* @__PURE__ */ __exportAll({
	default: () => home_default,
	meta: () => meta$2
});
function meta$2({}) {
	return [{ title: "Cash Reminder" }, {
		name: "description",
		content: "Controle simples de pagamentos pessoais."
	}];
}
function initialForm() {
	return {
		description: "",
		category_id: "",
		amount: "",
		purchase_date: todayInputValue(),
		payment_type: "cash",
		installments_count: 1
	};
}
var home_default = UNSAFE_withComponentProps(function Home() {
	const [payments, setPayments] = useState([]);
	const [monthlySummary, setMonthlySummary] = useState([]);
	const [categories, setCategories] = useState([]);
	const [cardSettings, setCardSettings] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState(null);
	const [form, setForm] = useState(initialForm);
	const [editingPayment, setEditingPayment] = useState(null);
	const [editForm, setEditForm] = useState(null);
	async function loadDashboard() {
		setIsLoading(true);
		setError(null);
		try {
			const data = await apiRequest("/dashboard/");
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
		loadDashboard();
	}, []);
	useEffect(() => {
		if (!editingPayment) return;
		function closeOnEscape(event) {
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
	const maxMonthTotal = useMemo(() => Math.max(1, ...monthlySummary.map((month) => Number(month.total))), [monthlySummary]);
	const totalRegistered = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
	const dashboardIndicators = useMemo(() => {
		const entries = monthlySummary.flatMap((month) => month.entries);
		const nextMonthDate = /* @__PURE__ */ new Date(`${todayInputValue()}T12:00:00`);
		nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
		const nextMonthKey = [nextMonthDate.getFullYear(), String(nextMonthDate.getMonth() + 1).padStart(2, "0")].join("-");
		const cardTotal = payments.filter((payment) => payment.payment_type === "card").reduce((sum, payment) => sum + Number(payment.amount), 0);
		const cashTotal = payments.filter((payment) => payment.payment_type === "cash").reduce((sum, payment) => sum + Number(payment.amount), 0);
		const futureOpen = entries.filter((entry) => entry.payment_type === "card" && entry.status !== "paid").reduce((sum, entry) => sum + Number(entry.amount), 0);
		const nextPending = entries.filter((entry) => entry.payment_type === "card" && entry.status !== "paid").sort((first, second) => first.due_date.localeCompare(second.due_date))[0];
		const categoryMap = /* @__PURE__ */ new Map();
		const nextMonthCategoryMap = /* @__PURE__ */ new Map();
		entries.forEach((entry) => {
			const key = entry.category || "Sem categoria";
			const current = categoryMap.get(key) ?? {
				name: entry.category || "Sem categoria",
				color: entry.category_color || "#a8a29e",
				total: 0
			};
			current.total += Number(entry.amount);
			categoryMap.set(key, current);
			if (entry.month === nextMonthKey) {
				const nextMonthCategory = nextMonthCategoryMap.get(key) ?? {
					name: entry.category || "Sem categoria",
					color: entry.category_color || "#a8a29e",
					total: 0
				};
				nextMonthCategory.total += Number(entry.amount);
				nextMonthCategoryMap.set(key, nextMonthCategory);
			}
		});
		const categoryTotals = [...categoryMap.values()].sort((first, second) => second.total - first.total);
		return {
			cardTotal,
			cashTotal,
			futureOpen,
			nextPending,
			nextMonthKey,
			nextMonthTopCategory: [...nextMonthCategoryMap.values()].sort((first, second) => second.total - first.total)[0],
			timelineTopCategory: categoryTotals[0],
			categoryTotals
		};
	}, [monthlySummary, payments]);
	const paymentsById = useMemo(() => new Map(payments.map((payment) => [payment.id, payment])), [payments]);
	async function handleSubmit(event) {
		event.preventDefault();
		setIsSaving(true);
		setError(null);
		const payload = {
			description: form.description,
			category_id: form.category_id ? Number(form.category_id) : null,
			amount: normalizeAmount(form.amount),
			purchase_date: form.purchase_date,
			payment_type: form.payment_type,
			installments_count: form.payment_type === "cash" ? 1 : form.installments_count
		};
		try {
			await apiRequest("/payments/", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			setForm((current) => ({
				...initialForm(),
				category_id: current.category_id,
				payment_type: current.payment_type,
				installments_count: current.installments_count
			}));
			await loadDashboard();
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar o pagamento.");
		} finally {
			setIsSaving(false);
		}
	}
	async function deletePayment(paymentId, description) {
		if (!window.confirm(`Excluir "${description}" e todas as parcelas vinculadas?`)) return;
		setError(null);
		try {
			await apiRequest(`/payments/${paymentId}/`, { method: "DELETE" });
			await loadDashboard();
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível remover o pagamento.");
		}
	}
	async function toggleInstallment(entry) {
		setError(null);
		try {
			await apiRequest(`/installments/${entry.id}/`, {
				method: "PATCH",
				body: JSON.stringify({ paid: entry.status !== "paid" })
			});
			await loadDashboard();
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível atualizar a parcela.");
		}
	}
	function openEditModal(payment) {
		setEditingPayment(payment);
		setEditForm({
			description: payment.description,
			category_id: payment.category?.id.toString() ?? "",
			amount: payment.amount.replace(".", ","),
			purchase_date: payment.purchase_date,
			payment_type: payment.payment_type,
			installments_count: payment.installments_count
		});
	}
	function closeEditModal() {
		if (isEditing) return;
		setEditingPayment(null);
		setEditForm(null);
	}
	async function handleEditSubmit(event) {
		event.preventDefault();
		if (!editingPayment || !editForm) return;
		setIsEditing(true);
		setError(null);
		try {
			await apiRequest(`/payments/${editingPayment.id}/`, {
				method: "PATCH",
				body: JSON.stringify({
					description: editForm.description,
					category_id: editForm.category_id ? Number(editForm.category_id) : null,
					amount: normalizeAmount(editForm.amount),
					purchase_date: editForm.purchase_date,
					payment_type: editForm.payment_type,
					installments_count: editForm.payment_type === "cash" ? 1 : editForm.installments_count
				})
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
	return /* @__PURE__ */ jsxs("main", {
		className: "min-h-screen bg-[#f6f5f1] text-stone-950",
		children: [
			/* @__PURE__ */ jsx(AppHeader, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex w-full flex-col gap-8 px-3 py-7 sm:px-4 lg:px-5",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-700",
							children: "Visão geral"
						}), /* @__PURE__ */ jsx("h1", {
							className: "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
							children: "Pagamentos e próximas faturas"
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[620px]",
							children: [
								/* @__PURE__ */ jsx(Metric, {
									label: "Este mês",
									value: money(currentMonth?.total ?? 0)
								}),
								/* @__PURE__ */ jsx(Metric, {
									label: "Em aberto",
									value: money(currentMonth?.open_total ?? 0)
								}),
								/* @__PURE__ */ jsx(Metric, {
									label: "Pago",
									value: money(currentMonth?.paid_total ?? 0)
								}),
								/* @__PURE__ */ jsx(Metric, {
									label: "Vencido",
									value: money(currentMonth?.overdue_total ?? 0),
									tone: Number(currentMonth?.overdue_total ?? 0) > 0 ? "danger" : "default"
								})
							]
						})]
					}),
					error && /* @__PURE__ */ jsx("div", {
						className: "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
						children: error
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]",
						children: [/* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:self-start",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "border-b border-stone-100 pb-4",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "text-lg font-semibold",
									children: "Novo pagamento"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-stone-500",
									children: cardSettings ? `Cartão fecha dia ${cardSettings.closing_day} e vence dia ${cardSettings.due_day}.` : "Carregando configuração do cartão..."
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "mt-5 grid gap-4",
								children: [
									/* @__PURE__ */ jsxs("label", {
										className: "grid gap-2 text-sm font-medium text-stone-700",
										children: ["Descrição", /* @__PURE__ */ jsx("input", {
											required: true,
											value: form.description,
											onChange: (event) => setForm({
												...form,
												description: event.target.value
											}),
											placeholder: "Ex.: ChatGPT, bicicleta",
											className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
										})]
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "grid gap-2 text-sm font-medium text-stone-700",
										children: ["Categoria", /* @__PURE__ */ jsxs("select", {
											value: form.category_id,
											onChange: (event) => setForm({
												...form,
												category_id: event.target.value
											}),
											className: "h-11 rounded-md border border-stone-200 bg-white px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100",
											children: [/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Sem categoria"
											}), categories.map((category) => /* @__PURE__ */ jsx("option", {
												value: category.id,
												children: category.name
											}, category.id))]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ jsxs("label", {
											className: "grid gap-2 text-sm font-medium text-stone-700",
											children: ["Valor total", /* @__PURE__ */ jsx("input", {
												required: true,
												inputMode: "decimal",
												value: form.amount,
												onChange: (event) => setForm({
													...form,
													amount: event.target.value
												}),
												placeholder: "0,00",
												className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
											})]
										}), /* @__PURE__ */ jsxs("label", {
											className: "grid gap-2 text-sm font-medium text-stone-700",
											children: [form.payment_type === "cash" ? "Data do pagamento" : "Data da compra", /* @__PURE__ */ jsx("input", {
												required: true,
												type: "date",
												max: form.payment_type === "cash" ? todayInputValue() : void 0,
												value: form.purchase_date,
												onChange: (event) => setForm({
													...form,
													purchase_date: event.target.value
												}),
												className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
											})]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2 text-sm font-medium text-stone-700",
										children: ["Forma de pagamento", /* @__PURE__ */ jsx("div", {
											className: "grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1",
											children: [{
												value: "cash",
												label: "À vista"
											}, {
												value: "card",
												label: "Cartão"
											}].map((option) => /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setForm({
													...form,
													payment_type: option.value
												}),
												className: `h-10 rounded-sm text-sm font-semibold transition ${form.payment_type === option.value ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500 hover:text-stone-900"}`,
												children: option.label
											}, option.value))
										})]
									}),
									form.payment_type === "card" && /* @__PURE__ */ jsxs("label", {
										className: "grid gap-2 text-sm font-medium text-stone-700",
										children: ["Parcelas no cartão", /* @__PURE__ */ jsx("input", {
											required: true,
											type: "number",
											min: 1,
											max: 15,
											value: form.installments_count,
											onChange: (event) => setForm({
												...form,
												installments_count: Number(event.target.value)
											}),
											className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
										})]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "submit",
										disabled: isSaving,
										className: "mt-2 h-12 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60",
										children: isSaving ? "Salvando..." : "Registrar pagamento"
									})
								]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid gap-8",
							children: [/* @__PURE__ */ jsxs("section", {
								className: "rounded-lg border border-stone-200 bg-white p-5 shadow-sm",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-2 border-b border-stone-100 pb-4 sm:flex-row sm:items-end sm:justify-between",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
										className: "text-lg font-semibold",
										children: "Linha do tempo"
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1 text-sm text-stone-500",
										children: "Parcelas organizadas por vencimento."
									})] }), /* @__PURE__ */ jsxs("p", {
										className: "text-sm font-medium text-stone-600",
										children: ["Total lançado: ", money(totalRegistered)]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-5 grid gap-4",
									children: isLoading ? /* @__PURE__ */ jsx(EmptyState, { text: "Carregando sua linha do tempo..." }) : monthlySummary.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { text: "Registre um pagamento para montar sua linha do tempo." }) : monthlySummary.map((month) => /* @__PURE__ */ jsx(MonthRow, {
										month,
										maxMonthTotal,
										onToggleInstallment: toggleInstallment,
										onDeletePayment: deletePayment,
										onEditPayment: openEditModal,
										paymentsById
									}, month.month))
								})]
							}), /* @__PURE__ */ jsx(DashboardIndicators, {
								isLoading,
								paymentsCount: payments.length,
								indicators: dashboardIndicators
							})]
						})]
					})
				]
			}),
			editingPayment && editForm && /* @__PURE__ */ jsx(EditPaymentModal, {
				payment: editingPayment,
				form: editForm,
				categories,
				isSaving: isEditing,
				onChange: setEditForm,
				onClose: closeEditModal,
				onSubmit: handleEditSubmit
			})
		]
	});
});
function Metric({ label, value, tone = "default" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border border-stone-200 bg-white px-3 py-3 shadow-sm",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-xs font-medium uppercase tracking-[0.14em] text-stone-500",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: `mt-2 text-base font-semibold sm:text-lg ${tone === "danger" ? "text-red-700" : ""}`,
			children: value
		})]
	});
}
function EmptyState({ text }) {
	return /* @__PURE__ */ jsx("p", {
		className: "py-6 text-center text-sm text-stone-500",
		children: text
	});
}
function EditPaymentModal({ payment, form, categories, isSaving, onChange, onClose, onSubmit }) {
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 sm:p-4",
		role: "presentation",
		onMouseDown: (event) => {
			if (event.target === event.currentTarget) onClose();
		},
		children: /* @__PURE__ */ jsxs("section", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "edit-payment-title",
			className: "w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl sm:w-[36rem]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					id: "edit-payment-title",
					className: "text-lg font-semibold text-stone-950",
					children: "Editar pagamento"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-stone-500",
					children: payment.description
				})] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					title: "Fechar",
					"aria-label": "Fechar modal",
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-950",
					children: /* @__PURE__ */ jsx(CloseIcon, {})
				})]
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit,
				className: "grid gap-4 p-5",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "grid gap-2 text-sm font-medium text-stone-700",
						children: ["Descrição", /* @__PURE__ */ jsx("input", {
							autoFocus: true,
							required: true,
							value: form.description,
							onChange: (event) => onChange({
								...form,
								description: event.target.value
							}),
							className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "grid gap-2 text-sm font-medium text-stone-700",
						children: ["Categoria", /* @__PURE__ */ jsxs("select", {
							value: form.category_id,
							onChange: (event) => onChange({
								...form,
								category_id: event.target.value
							}),
							className: "h-11 rounded-md border border-stone-200 bg-white px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Sem categoria"
							}), categories.map((category) => /* @__PURE__ */ jsx("option", {
								value: category.id,
								children: category.name
							}, category.id))]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "grid gap-2 text-sm font-medium text-stone-700",
							children: ["Valor total", /* @__PURE__ */ jsx("input", {
								required: true,
								inputMode: "decimal",
								value: form.amount,
								onChange: (event) => onChange({
									...form,
									amount: event.target.value
								}),
								className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
							})]
						}), /* @__PURE__ */ jsxs("label", {
							className: "grid gap-2 text-sm font-medium text-stone-700",
							children: [form.payment_type === "cash" ? "Data do pagamento" : "Data da compra", /* @__PURE__ */ jsx("input", {
								required: true,
								type: "date",
								max: form.payment_type === "cash" ? todayInputValue() : void 0,
								value: form.purchase_date,
								onChange: (event) => onChange({
									...form,
									purchase_date: event.target.value
								}),
								className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-2 text-sm font-medium text-stone-700",
						children: ["Forma de pagamento", /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1",
							children: [{
								value: "cash",
								label: "À vista"
							}, {
								value: "card",
								label: "Cartão"
							}].map((option) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => onChange({
									...form,
									payment_type: option.value
								}),
								className: `h-10 rounded-sm text-sm font-semibold transition ${form.payment_type === option.value ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500 hover:text-stone-900"}`,
								children: option.label
							}, option.value))
						})]
					}),
					form.payment_type === "card" && /* @__PURE__ */ jsxs("label", {
						className: "grid gap-2 text-sm font-medium text-stone-700",
						children: ["Parcelas no cartão", /* @__PURE__ */ jsx("input", {
							required: true,
							type: "number",
							min: 1,
							max: 15,
							value: form.installments_count,
							onChange: (event) => onChange({
								...form,
								installments_count: Number(event.target.value)
							}),
							className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex justify-end gap-3 border-t border-stone-100 pt-4",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							disabled: isSaving,
							className: "h-10 rounded-md border border-stone-200 px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60",
							children: "Cancelar"
						}), /* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: isSaving,
							className: "h-10 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60",
							children: isSaving ? "Salvando..." : "Salvar alterações"
						})]
					})
				]
			})]
		})
	});
}
function MonthRow({ month, maxMonthTotal, onToggleInstallment, onDeletePayment, onEditPayment, paymentsById }) {
	const progress = Math.max(3, Number(month.total) / maxMonthTotal * 100);
	return /* @__PURE__ */ jsxs("article", {
		className: "grid gap-3 rounded-lg border border-stone-200 p-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-base font-semibold capitalize",
					children: formatMonth(month.month)
				}), /* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-sm text-stone-500",
					children: [
						"Fatura ",
						money(month.invoice_total),
						" + à vista ",
						money(month.cash_total)
					]
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "text-left sm:text-right",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-lg font-semibold",
						children: money(month.total)
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-sm font-medium text-stone-500",
						children: [money(month.open_total), " em aberto"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-2 overflow-hidden rounded-full bg-stone-100",
				children: /* @__PURE__ */ jsx("div", {
					className: "h-full rounded-full bg-emerald-700",
					style: { width: `${progress}%` }
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid gap-2 pt-1",
				children: month.entries.map((entry) => /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-3 rounded-md bg-stone-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								entry.category_color && /* @__PURE__ */ jsx("span", {
									className: "h-2.5 w-2.5 rounded-full",
									style: { backgroundColor: entry.category_color }
								}),
								/* @__PURE__ */ jsx("span", {
									className: "font-medium text-stone-800",
									children: entry.description
								}),
								entry.payment_type === "card" && entry.installments_count > 1 && /* @__PURE__ */ jsxs("span", {
									className: "text-xs text-stone-500",
									children: [
										entry.installment_number,
										"/",
										entry.installments_count
									]
								}),
								/* @__PURE__ */ jsx(StatusLabel, { entry })
							]
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-xs text-stone-500",
							children: ["Vence em ", formatDate(entry.due_date)]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-3 sm:justify-end",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-semibold",
								children: money(entry.amount)
							}),
							entry.payment_type === "card" && /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => void onToggleInstallment(entry),
								className: `h-9 rounded-md px-3 text-sm font-medium transition ${entry.status === "paid" ? "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100" : "bg-emerald-800 text-white hover:bg-emerald-900"}`,
								children: entry.status === "paid" ? "Desfazer" : "Marcar paga"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									const payment = paymentsById.get(entry.payment_id);
									if (payment) onEditPayment(payment);
								},
								title: "Editar pagamento",
								"aria-label": `Editar ${entry.description}`,
								className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800",
								children: /* @__PURE__ */ jsx(PencilIcon, {})
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => void onDeletePayment(entry.payment_id, entry.description),
								className: "h-9 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:bg-red-50",
								"aria-label": `Excluir ${entry.description} e todas as parcelas`,
								children: "Excluir"
							})
						]
					})]
				}, entry.id))
			})
		]
	});
}
function StatusLabel({ entry }) {
	const status = {
		paid: {
			label: "Pago",
			className: "bg-emerald-100 text-emerald-800"
		},
		overdue: {
			label: "Vencido",
			className: "bg-red-100 text-red-800"
		},
		due_today: {
			label: "Vence hoje",
			className: "bg-amber-100 text-amber-800"
		},
		pending: {
			label: "Pendente",
			className: "bg-stone-200 text-stone-700"
		}
	}[entry.status];
	return /* @__PURE__ */ jsxs("span", {
		className: `rounded-full px-2 py-1 text-xs font-medium ${status.className}`,
		children: [
			status.label,
			" - ",
			entry.category
		]
	});
}
function DashboardIndicators({ isLoading, paymentsCount, indicators }) {
	const categoriesTotal = indicators.categoryTotals.reduce((sum, category) => sum + category.total, 0);
	let accumulatedPercentage = 0;
	const pieSegments = indicators.categoryTotals.map((category) => {
		const start = accumulatedPercentage;
		const percentage = categoriesTotal > 0 ? category.total / categoriesTotal * 100 : 0;
		accumulatedPercentage += percentage;
		return `${category.color} ${start}% ${accumulatedPercentage}%`;
	});
	const pieBackground = pieSegments.length > 0 ? `conic-gradient(${pieSegments.join(", ")})` : "#e7e5e4";
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-lg border border-stone-200 bg-white p-5 shadow-sm",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-stone-100 pb-4",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-semibold",
				children: "Indicadores"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-stone-500",
				children: "Visão consolidada dos pagamentos cadastrados."
			})]
		}), isLoading ? /* @__PURE__ */ jsx(EmptyState, { text: "Calculando indicadores..." }) : paymentsCount === 0 ? /* @__PURE__ */ jsx(EmptyState, { text: "Cadastre pagamentos para visualizar os indicadores." }) : /* @__PURE__ */ jsxs("div", {
			className: "mt-5 grid gap-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ jsx(IndicatorValue, {
							label: "Total no cartão",
							value: money(indicators.cardTotal)
						}),
						/* @__PURE__ */ jsx(IndicatorValue, {
							label: "Total à vista",
							value: money(indicators.cashTotal)
						}),
						/* @__PURE__ */ jsx(IndicatorValue, {
							label: "Saldo futuro",
							value: money(indicators.futureOpen)
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-2",
					children: [/* @__PURE__ */ jsx(CategoryHighlight, {
						label: `Categoria mais cara em ${formatMonth(indicators.nextMonthKey)}`,
						category: indicators.nextMonthTopCategory
					}), /* @__PURE__ */ jsx(CategoryHighlight, {
						label: "Categoria mais cara na linha do tempo",
						category: indicators.timelineTopCategory
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-6 xl:grid-cols-[0.8fr_1.4fr]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-t border-stone-100 pt-4",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-medium uppercase tracking-[0.14em] text-stone-500",
							children: "Próxima cobrança"
						}), indicators.nextPending ? /* @__PURE__ */ jsxs("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-lg font-semibold text-stone-950",
									children: indicators.nextPending.description
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-sm text-stone-500",
									children: [
										formatDate(indicators.nextPending.due_date),
										" ·",
										" ",
										indicators.nextPending.installment_number,
										"/",
										indicators.nextPending.installments_count
									]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-3 text-2xl font-semibold text-emerald-800",
									children: money(indicators.nextPending.amount)
								})
							]
						}) : /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm text-stone-500",
							children: "Nenhuma cobrança pendente."
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "border-t border-stone-100 pt-4",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-medium uppercase tracking-[0.14em] text-stone-500",
							children: "Gastos por categoria"
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-4 grid items-center gap-6 sm:grid-cols-[13rem_1fr]",
							children: [/* @__PURE__ */ jsx("div", {
								className: "mx-auto aspect-square w-full rounded-full border-8 border-white shadow-sm",
								style: { background: pieBackground },
								role: "img",
								"aria-label": "Gráfico em pizza dos gastos por categoria"
							}), /* @__PURE__ */ jsx("div", {
								className: "grid gap-3",
								children: indicators.categoryTotals.map((category) => /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between gap-4 text-sm",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "flex min-w-0 items-center gap-2 font-medium text-stone-700",
										children: [/* @__PURE__ */ jsx("span", {
											className: "h-2.5 w-2.5 shrink-0 rounded-full",
											style: { backgroundColor: category.color }
										}), /* @__PURE__ */ jsx("span", {
											className: "truncate",
											children: category.name
										})]
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-right",
										children: [/* @__PURE__ */ jsx("span", {
											className: "block font-semibold text-stone-950",
											children: money(category.total)
										}), /* @__PURE__ */ jsx("span", {
											className: "text-xs text-stone-500",
											children: categoriesTotal > 0 ? `${(category.total / categoriesTotal * 100).toFixed(1)}%` : "0%"
										})]
									})]
								}, category.name))
							})]
						})]
					})]
				})
			]
		})]
	});
}
function CategoryHighlight({ label, category }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-white px-4 py-4",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-xs font-medium uppercase tracking-[0.14em] text-stone-500",
			children: label
		}), category ? /* @__PURE__ */ jsxs("div", {
			className: "mt-3 flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex min-w-0 items-center gap-2 font-semibold text-stone-950",
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-3 w-3 shrink-0 rounded-full",
					style: { backgroundColor: category.color }
				}), /* @__PURE__ */ jsx("span", {
					className: "truncate",
					children: category.name
				})]
			}), /* @__PURE__ */ jsx("span", {
				className: "shrink-0 text-lg font-semibold text-emerald-800",
				children: money(category.total)
			})]
		}) : /* @__PURE__ */ jsx("p", {
			className: "mt-3 text-sm text-stone-500",
			children: "Nenhum gasto previsto."
		})]
	});
}
function IndicatorValue({ label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-white px-4 py-4",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-xs font-medium uppercase tracking-[0.14em] text-stone-500",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-xl font-semibold text-stone-950",
			children: value
		})]
	});
}
function PencilIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		width: "17",
		height: "17",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M12 20h9" }), /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })]
	});
}
function CloseIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		width: "18",
		height: "18",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "m18 6-12 12" }), /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })]
	});
}
//#endregion
//#region app/routes/categories.tsx
var categories_exports = /* @__PURE__ */ __exportAll({
	default: () => categories_default,
	meta: () => meta$1
});
function meta$1({}) {
	return [{ title: "Categorias | Cash Reminder" }];
}
var categories_default = UNSAFE_withComponentProps(function Categories() {
	const [categories, setCategories] = useState([]);
	const [name, setName] = useState("");
	const [color, setColor] = useState("#047857");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	async function loadCategories() {
		try {
			setCategories(await apiRequest("/categories/"));
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível carregar as categorias.");
		}
	}
	useEffect(() => {
		loadCategories();
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		setIsSaving(true);
		setError(null);
		try {
			await apiRequest("/categories/", {
				method: "POST",
				body: JSON.stringify({
					name,
					color
				})
			});
			setName("");
			await loadCategories();
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar a categoria.");
		} finally {
			setIsSaving(false);
		}
	}
	async function removeCategory(category) {
		if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
		setError(null);
		try {
			await apiRequest(`/categories/${category.id}/`, { method: "DELETE" });
			await loadCategories();
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível remover a categoria.");
		}
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "min-h-screen bg-[#f6f5f1] text-stone-950",
		children: [/* @__PURE__ */ jsx(AppHeader, {}), /* @__PURE__ */ jsxs("div", {
			className: "grid w-full gap-8 px-3 py-8 sm:px-4 lg:grid-cols-[340px_1fr] lg:px-5",
			children: [/* @__PURE__ */ jsxs("section", { children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "Categorias"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm leading-6 text-stone-600",
					children: "Organize os pagamentos por finalidade e selecione a categoria ao registrar uma compra."
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "mt-6 grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm",
					children: [
						/* @__PURE__ */ jsxs("label", {
							className: "grid gap-2 text-sm font-medium text-stone-700",
							children: ["Nome", /* @__PURE__ */ jsx("input", {
								required: true,
								maxLength: 80,
								value: name,
								onChange: (event) => setName(event.target.value),
								placeholder: "Ex.: Assinaturas",
								className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
							})]
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "grid gap-2 text-sm font-medium text-stone-700",
							children: ["Cor", /* @__PURE__ */ jsxs("div", {
								className: "flex h-11 items-center gap-3 rounded-md border border-stone-200 px-3",
								children: [/* @__PURE__ */ jsx("input", {
									type: "color",
									value: color,
									onChange: (event) => setColor(event.target.value),
									className: "h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-sm uppercase text-stone-500",
									children: color
								})]
							})]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: isSaving,
							className: "h-11 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60",
							children: isSaving ? "Salvando..." : "Adicionar categoria"
						})
					]
				})
			] }), /* @__PURE__ */ jsxs("section", {
				className: "rounded-lg border border-stone-200 bg-white p-5 shadow-sm",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "border-b border-stone-100 pb-4",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-lg font-semibold",
							children: "Categorias cadastradas"
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-stone-500",
							children: [categories.length, " no total"]
						})]
					}),
					error && /* @__PURE__ */ jsx("p", {
						className: "mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800",
						children: error
					}),
					/* @__PURE__ */ jsx("div", {
						className: "divide-y divide-stone-100",
						children: categories.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "py-8 text-center text-sm text-stone-500",
							children: "Nenhuma categoria cadastrada."
						}) : categories.map((category) => /* @__PURE__ */ jsxs("article", {
							className: "flex items-center justify-between gap-4 py-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "h-4 w-4 shrink-0 rounded-full",
									style: { backgroundColor: category.color }
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("h3", {
										className: "truncate font-medium text-stone-950",
										children: category.name
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-sm text-stone-500",
										children: [
											category.payments_count,
											" ",
											category.payments_count === 1 ? "pagamento" : "pagamentos"
										]
									})]
								})]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => void removeCategory(category),
								className: "h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50",
								children: "Excluir"
							})]
						}, category.id))
					})
				]
			})]
		})]
	});
});
//#endregion
//#region app/routes/card-settings.tsx
var card_settings_exports = /* @__PURE__ */ __exportAll({
	default: () => card_settings_default,
	meta: () => meta
});
function meta({}) {
	return [{ title: "Cartão | Cash Reminder" }];
}
var card_settings_default = UNSAFE_withComponentProps(function CardSettingsPage() {
	const [settings, setSettings] = useState({
		closing_day: 5,
		due_day: 15,
		updated_at: ""
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	useEffect(() => {
		apiRequest("/card-settings/").then(setSettings).catch((apiError) => setError(apiError instanceof Error ? apiError.message : "Não foi possível carregar a configuração.")).finally(() => setIsLoading(false));
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		setIsSaving(true);
		setError(null);
		setMessage(null);
		try {
			setSettings(await apiRequest("/card-settings/", {
				method: "PUT",
				body: JSON.stringify({
					closing_day: settings.closing_day,
					due_day: settings.due_day
				})
			}));
			setMessage("Configuração atualizada para as próximas compras parceladas.");
		} catch (apiError) {
			setError(apiError instanceof Error ? apiError.message : "Não foi possível salvar a configuração.");
		} finally {
			setIsSaving(false);
		}
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "min-h-screen bg-[#f6f5f1] text-stone-950",
		children: [/* @__PURE__ */ jsx(AppHeader, {}), /* @__PURE__ */ jsxs("div", {
			className: "w-full px-3 py-8 sm:px-4 lg:px-5",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "Configuração do cartão"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm leading-6 text-stone-600",
					children: "O fechamento define em qual fatura uma compra entra. O vencimento define a data mensal das parcelas."
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "grid gap-2 text-sm font-medium text-stone-700",
								children: ["Dia de fechamento", /* @__PURE__ */ jsx("input", {
									required: true,
									type: "number",
									min: 1,
									max: 31,
									disabled: isLoading,
									value: settings.closing_day,
									onChange: (event) => setSettings({
										...settings,
										closing_day: Number(event.target.value)
									}),
									className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "grid gap-2 text-sm font-medium text-stone-700",
								children: ["Dia de vencimento", /* @__PURE__ */ jsx("input", {
									required: true,
									type: "number",
									min: 1,
									max: 31,
									disabled: isLoading,
									value: settings.due_day,
									onChange: (event) => setSettings({
										...settings,
										due_day: Number(event.target.value)
									}),
									className: "h-11 rounded-md border border-stone-200 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-5 rounded-md bg-stone-100 px-4 py-3 text-sm leading-6 text-stone-700",
							children: [
								"Compras feitas até o dia ",
								settings.closing_day,
								" entram na fatura que vence no dia",
								" ",
								settings.due_day,
								". Compras posteriores entram na fatura seguinte."
							]
						}),
						message && /* @__PURE__ */ jsx("p", {
							className: "mt-4 text-sm font-medium text-emerald-700",
							children: message
						}),
						error && /* @__PURE__ */ jsx("p", {
							className: "mt-4 text-sm font-medium text-red-700",
							children: error
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: isLoading || isSaving,
							className: "mt-5 h-11 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60",
							children: isSaving ? "Salvando..." : "Salvar configuração"
						})
					]
				})
			]
		})]
	});
});
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-O7i1QjvI.js",
		"imports": ["/assets/jsx-runtime-Cc6DCyMV.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": true,
			"module": "/assets/root-BT_KsU3d.js",
			"imports": ["/assets/jsx-runtime-Cc6DCyMV.js"],
			"css": ["/assets/root-B-xZaNpb.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/home": {
			"id": "routes/home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/home-BY-WUm_e.js",
			"imports": ["/assets/jsx-runtime-Cc6DCyMV.js", "/assets/api-B1uMDWp5.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/categories": {
			"id": "routes/categories",
			"parentId": "root",
			"path": "categorias",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/categories-BaDUqOTn.js",
			"imports": ["/assets/jsx-runtime-Cc6DCyMV.js", "/assets/api-B1uMDWp5.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/card-settings": {
			"id": "routes/card-settings",
			"parentId": "root",
			"path": "cartao",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/card-settings-BOfrtOMr.js",
			"imports": ["/assets/jsx-runtime-Cc6DCyMV.js", "/assets/api-B1uMDWp5.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-7a31772d.js",
	"version": "7a31772d",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"unstable_optimizeDeps": false,
	"v8_passThroughRequests": true,
	"v8_trailingSlashAwareDataRequests": true,
	"unstable_previewServerPrerendering": false,
	"v8_middleware": true,
	"v8_splitRouteModules": true,
	"v8_viteEnvironmentApi": true
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_node_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/home": {
		id: "routes/home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: home_exports
	},
	"routes/categories": {
		id: "routes/categories",
		parentId: "root",
		path: "categorias",
		index: void 0,
		caseSensitive: void 0,
		module: categories_exports
	},
	"routes/card-settings": {
		id: "routes/card-settings",
		parentId: "root",
		path: "cartao",
		index: void 0,
		caseSensitive: void 0,
		module: card_settings_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
