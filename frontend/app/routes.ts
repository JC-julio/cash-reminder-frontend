import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("categorias", "routes/categories.tsx"),
  route("cartao", "routes/card-settings.tsx"),
] satisfies RouteConfig;
