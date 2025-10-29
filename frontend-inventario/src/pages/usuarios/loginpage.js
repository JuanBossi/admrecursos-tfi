import React, { useEffect, useMemo, useState } from "react";

/**
 * Frontend React (SPA) minimalista para gestionar Usuarios y Roles contra un backend (NestJS típico).
 *
 * ✔️ TailwindCSS-ready (clases incluidas)
 * ✔️ CRUD de Usuarios y Roles (listar, buscar, crear, editar, eliminar)
 * ✔️ Paginación simple, modal para formularios, validaciones básicas
 * ✔️ Config de API (baseURL y endpoints) desde UI (persisten en localStorage)
 * ✔️ Columnas de tabla auto-inferidas si el backend devuelve campos adicionales
 *
 * 📌 Asume endpoints REST (ajustables en "⚙️ Configuración"):
 *    - GET    {baseURL}{usuariosEP}?page=1&limit=10&search=texto
 *    - POST   {baseURL}{usuariosEP}
 *    - PATCH  {baseURL}{usuariosEP}/:id
 *    - DELETE {baseURL}{usuariosEP}/:id
 *    - GET    {baseURL}{rolesEP}?page=1&limit=10&search=texto
 *    - POST   {baseURL}{rolesEP}
 *    - PATCH  {baseURL}{rolesEP}/:id
 *    - DELETE {baseURL}{rolesEP}/:id
 *
 * 🔧 Si tu backend usa otros nombres (p.ej. "rol" en vez de "roles"), cámbialos en la pantalla de Configuración.
 *
 * 🧩 Para integrar en tu app:
 * - Copia este componente como App.tsx/App.jsx
 * - Asegúrate de tener Tailwind configurado.
 */

// Utilidades ---------------------------------------------------------------
const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const defaultConfig = {
  baseURL: "http://localhost:3000",
  endpoints: {
    usuarios: "/usuarios",
    roles: "/roles", // si tu controlador es @Controller('rol'), cámbialo a "/rol"
  },
};

function useApiConfig() {
  const [cfg, setCfg] = useState(
    () => storage.get("adm-tfi.api-config", defaultConfig)
  );
  useEffect(() => {
    storage.set("adm-tfi.api-config", cfg);
  }, [cfg]);
  return [cfg, setCfg];
}

async function http(method, url, body) {
  const opts = {
    method,
    headers: {
    "Content-Type": "application/json",
    // ⚠️ Autenticación simplificada: contraseña en texto plano
    ...(localStorage.getItem('adm-tfi.password')
      ? { 'X-Password': localStorage.getItem('adm-tfi.password') }
      : {}),
  },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${method} ${url} failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

// Componentes UI -----------------------------------------------------------
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

function Button({ children, className, variant = "primary", ...props }) {
  const base =
    "px-3 py-2 rounded-xl text-sm font-medium shadow-sm transition active:translate-y-[1px]";
  const styles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-300 disabled:text-gray-500",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-800 border border-gray-300",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white",
  };
  return (
    <button className={classNames(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}

function Input({ label, hint, error, ...props }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        className={classNames(
          "rounded-xl border px-3 py-2 outline-none",
          error ? "border-rose-400" : "border-gray-300 focus:border-indigo-400"
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

function Textarea({ label, hint, error, ...props }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-gray-700">{label}</span>
      <textarea
        className={classNames(
          "rounded-xl border px-3 py-2 outline-none min-h-[96px]",
          error ? "border-rose-400" : "border-gray-300 focus:border-indigo-400"
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t p-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="grid place-items-center gap-2 py-12 text-center">
      <div className="text-4xl">🗂️</div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="max-w-md text-sm text-gray-500">{subtitle}</p>
      {action}
    </div>
  );
}

function Table({ items, busy, onEdit, onDelete }) {
  const columns = useMemo(() => {
    if (!items?.length) return [];
    // Ordenamos columnas comunes primero
    const preferred = [
      "id",
      "nombre",
      "email",
      "rol",
      "rolId",
      "activo",
      "createdAt",
      "updatedAt",
    ];
    const keys = Array.from(
      items.reduce((set, it) => {
        Object.keys(it || {}).forEach((k) => set.add(k));
        return set;
      }, new Set())
    );
    const sorted = [
      ...preferred.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !preferred.includes(k)),
    ];
    return sorted.slice(0, 8); // limitamos para que no se haga infinito
  }, [items]);

  return (
    <div className="overflow-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2">
                {c}
              </th>
            ))}
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {busy ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-6 text-center">
                Cargando…
              </td>
            </tr>
          ) : !items?.length ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-6 text-center">
                Sin resultados
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row.id ?? JSON.stringify(row)} className="border-t">
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2 align-top">
                    {renderCell(row[c])}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onEdit?.(row)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => onDelete?.(row)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value) {
  if (value == null) return <span className="text-gray-400">—</span>;
  if (typeof value === "boolean") return <Badge>{value ? "Sí" : "No"}</Badge>;
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string" && /T\d{2}:\d{2}/.test(value)) {
    // ISO datetime
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleString();
  }
  if (typeof value === "object") return <pre className="text-xs">{JSON.stringify(value)}</pre>;
  return String(value);
}

// Paginación simple --------------------------------------------------------
function Pager({ page, setPage, total, pageSize, isLoading }) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs text-gray-500">
        Página {page} de {totalPages}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" disabled={!canPrev || isLoading} onClick={() => setPage(1)}>
          « Primero
        </Button>
        <Button variant="ghost" disabled={!canPrev || isLoading} onClick={() => setPage(page - 1)}>
          ← Anterior
        </Button>
        <Button variant="ghost" disabled={!canNext || isLoading} onClick={() => setPage(page + 1)}>
          Siguiente →
        </Button>
        <Button variant="ghost" disabled={!canNext || isLoading} onClick={() => setPage(totalPages)}>
          Último »
        </Button>
      </div>
    </div>
  );
}

// Hooks de datos -----------------------------------------------------------
function useCollection(resourceName, cfg) {
  const endpoint = cfg.endpoints[resourceName];
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const base = cfg.baseURL.replace(/\/$/, "");

  const list = async () => {
    setIsLoading(true);
    setError("");
    try {
      const url = new URL(base + endpoint);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      if (search) url.searchParams.set("search", search);
      const data = await http("GET", url.toString());
      // Soportamos tanto {items,total} como arrays simples
      if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems(data.items ?? data.data ?? data.result ?? []);
        setTotal(Number(data.total ?? data.count ?? 0));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, endpoint, cfg.baseURL]);

  const createItem = async (payload) => {
    const url = base + endpoint;
    await http("POST", url, payload);
    await list();
  };

  const updateItem = async (id, payload) => {
    const url = `${base + endpoint}/${id}`;
    await http("PATCH", url, payload);
    await list();
  };

  const deleteItem = async (id) => {
    const url = `${base + endpoint}/${id}`;
    await http("DELETE", url);
    await list();
  };

  return {
    items,
    page,
    setPage,
    limit,
    setLimit,
    total,
    search,
    setSearch,
    isLoading,
    error,
    list,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Formularios --------------------------------------------------------------
function UsuarioForm({ value, onChange, roles, errors }) {
  const v = value || {};
  const set = (k, x) => onChange({ ...v, [k]: x });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Nombre"
        value={v.nombre ?? ""}
        onChange={(e) => set("nombre", e.target.value)}
        error={errors?.nombre}
      />
      <Input
        label="Email"
        type="email"
        value={v.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
        error={errors?.email}
      />
      <label className="grid gap-1 text-sm">
        <span className="text-gray-700">Rol</span>
        <select
          className="rounded-xl border border-gray-300 px-3 py-2"
          value={v.rolId ?? v.rol?.id ?? ""}
          onChange={(e) => set("rolId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— Seleccionar —</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre ?? r.name ?? `Rol ${r.id}`}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(v.activo)}
          onChange={(e) => set("activo", e.target.checked)}
        />
        Activo
      </label>
      <Input
        label="CUIL (opcional)"
        value={v.cuil ?? ""}
        onChange={(e) => set("cuil", e.target.value)}
      />
      <Input
        label="Teléfono (opcional)"
        value={v.telefono ?? ""}
        onChange={(e) => set("telefono", e.target.value)}
      />
      <Textarea
        label="Notas"
        value={v.notas ?? ""}
        onChange={(e) => set("notas", e.target.value)}
      />
    </div>
  );
}

function RolForm({ value, onChange, errors }) {
  const v = value || {};
  const set = (k, x) => onChange({ ...v, [k]: x });
  return (
    <div className="grid gap-3">
      <Input
        label="Nombre"
        value={v.nombre ?? ""}
        onChange={(e) => set("nombre", e.target.value)}
        error={errors?.nombre}
      />
      <Textarea
        label="Descripción"
        value={v.descripcion ?? ""}
        onChange={(e) => set("descripcion", e.target.value)}
      />
    </div>
  );
}

// Páginas ------------------------------------------------------------------
function UsuariosPage({ cfg }) {
  const data = useCollection("usuarios", cfg);
  const rolesData = useCollection("roles", cfg);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ activo: true });
  const [errors, setErrors] = useState({});
  const busy = data.isLoading || rolesData.isLoading;

  useEffect(() => {
    rolesData.setLimit(100);
    rolesData.setSearch("");
  }, []);

  const validate = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2) e.nombre = "Requerido";
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ activo: true });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      id: row.id,
      nombre: row.nombre ?? "",
      email: row.email ?? "",
      rolId: row.rolId ?? row.rol?.id ?? null,
      activo: Boolean(row.activo),
      cuil: row.cuil ?? "",
      telefono: row.telefono ?? "",
      notas: row.notas ?? "",
    });
    setErrors({});
    setOpen(true);
  };

  const submit = async () => {
    if (!validate()) return;
    if (editing?.id) {
      await data.updateItem(editing.id, form);
    } else {
      await data.createItem(form);
    }
    setOpen(false);
  };

  const onDelete = async (row) => {
    if (confirm(`¿Eliminar usuario #${row.id}?`)) {
      await data.deleteItem(row.id);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-1">
          <h2 className="text-xl font-semibold">Usuarios</h2>
          <p className="text-sm text-gray-500">
            Gestioná los usuarios del sistema y su rol.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate}>+ Nuevo usuario</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Buscar…"
          className="w-64 rounded-xl border border-gray-300 px-3 py-2"
          value={data.search}
          onChange={(e) => data.setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-gray-300 px-2 py-2 text-sm"
          value={data.limit}
          onChange={(e) => data.setLimit(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>

      {data.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {data.error}
        </div>
      ) : null}

      {!data.items?.length && !busy ? (
        <EmptyState
          title="Sin usuarios"
          subtitle="Todavía no hay usuarios cargados. Creá el primero para empezar."
          action={<Button onClick={openCreate}>Crear usuario</Button>}
        />
      ) : (
        <Table
          items={data.items}
          busy={busy}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      )}

      <Pager
        page={data.page}
        setPage={data.setPage}
        total={data.total}
        pageSize={data.limit}
        isLoading={busy}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Editar usuario #${editing.id}` : "Nuevo usuario"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit}>{editing ? "Guardar" : "Crear"}</Button>
          </>
        }
      >
        <UsuarioForm value={form} onChange={setForm} roles={rolesData.items} errors={errors} />
      </Modal>
    </div>
  );
}

function RolesPage({ cfg }) {
  const data = useCollection("roles", cfg);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2) e.nombre = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setErrors({});
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ id: row.id, nombre: row.nombre ?? "", descripcion: row.descripcion ?? "" });
    setErrors({});
    setOpen(true);
  };

  const submit = async () => {
    if (!validate()) return;
    if (editing?.id) {
      await data.updateItem(editing.id, form);
    } else {
      await data.createItem(form);
    }
    setOpen(false);
  };

  const onDelete = async (row) => {
    if (confirm(`¿Eliminar rol #${row.id}?`)) {
      await data.deleteItem(row.id);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-1">
          <h2 className="text-xl font-semibold">Roles</h2>
          <p className="text-sm text-gray-500">Definí los roles del sistema.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate}>+ Nuevo rol</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Buscar…"
          className="w-64 rounded-xl border border-gray-300 px-3 py-2"
          value={data.search}
          onChange={(e) => data.setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-gray-300 px-2 py-2 text-sm"
          value={data.limit}
          onChange={(e) => data.setLimit(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>

      {data.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {data.error}
        </div>
      ) : null}

      {!data.items?.length && !data.isLoading ? (
        <EmptyState
          title="Sin roles"
          subtitle="Aún no hay roles cargados. Creá el primero para empezar."
          action={<Button onClick={openCreate}>Crear rol</Button>}
        />
      ) : (
        <Table items={data.items} busy={data.isLoading} onEdit={openEdit} onDelete={onDelete} />
      )}

      <Pager
        page={data.page}
        setPage={data.setPage}
        total={data.total}
        pageSize={data.limit}
        isLoading={data.isLoading}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Editar rol #${editing.id}` : "Nuevo rol"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit}>{editing ? "Guardar" : "Crear"}</Button>
          </>
        }
      >
        <RolForm value={form} onChange={setForm} errors={errors} />
      </Modal>
    </div>
  );
}

// Configuración ------------------------------------------------------------
function ConfigPage({ cfg, setCfg }) {
  const [form, setForm] = useState(cfg);
  useEffect(() => setForm(cfg), [cfg]);

  const save = () => setCfg(form);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Configuración</h2>
        <p className="text-sm text-gray-500">Ajustá la URL base y endpoints.</p>
      </div>
      <div className="grid gap-3 max-w-2xl">
        <Input
          label="Base URL"
          value={form.baseURL}
          onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
          hint="Ej: http://localhost:3000"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Endpoint Usuarios"
            value={form.endpoints.usuarios}
            onChange={(e) => setForm({ ...form, endpoints: { ...form.endpoints, usuarios: e.target.value } })}
          />
          <Input
            label="Endpoint Roles"
            value={form.endpoints.roles}
            onChange={(e) => setForm({ ...form, endpoints: { ...form.endpoints, roles: e.target.value } })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={save}>Guardar cambios</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setForm(defaultConfig);
            setCfg(defaultConfig);
          }}
        >
          Restaurar por defecto
        </Button>
      </div>
    </div>
  );
}

// Layout -------------------------------------------------------------------
function Tabs({ value, onChange, tabs }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={classNames(
            "rounded-xl px-3 py-2 text-sm",
            value === t.value ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Container({ children }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">Panel de Administración</h1>
          <p className="text-sm text-gray-500">Inventario / Seguridad / Usuarios</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-white p-2">
          <Badge>React</Badge>
          <Badge>Tailwind</Badge>
          <Badge>REST</Badge>
        </div>
      </header>
      {children}
      <footer className="mt-8 border-t pt-6 text-xs text-gray-500">
        Hecho con ♥ para tu backend NestJS. Ajustá los endpoints en ⚙️ Configuración si es necesario.
      </footer>
    </div>
  );
}

export default function App() {
  const [cfg, setCfg] = useApiConfig();
  const [tab, setTab] = useState("usuarios");

  const body = useMemo(() => {
    switch (tab) {
      case "usuarios":
        return <UsuariosPage cfg={cfg} />;
      case "roles":
        return <RolesPage cfg={cfg} />;
      case "config":
        return <ConfigPage cfg={cfg} setCfg={setCfg} />;
      default:
        return null;
    }
  }, [tab, cfg]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Container>
        <div className="flex items-center justify-between">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "usuarios", label: "Usuarios" },
              { value: "roles", label: "Roles" },
              { value: "config", label: "⚙️ Configuración" },
            ]}
          />
          <div className="text-xs text-gray-500">
            Base URL actual: <span className="font-mono">{cfg.baseURL}</span>
          </div>
        </div>

        <main className="grid gap-6 rounded-3xl border bg-white p-4 sm:p-6">
          {body}
        </main>
      </Container>
    </div>
  );
}

// ---------------------------------------------------------------
// usuarios/loginpage.js
// Página de Login SIN TOKENS: guarda la contraseña en texto plano y la envía
// en cada request mediante el header `X-Password` (http()).
// ---------------------------------------------------------------
export function LoginPage() {
  const [cfg] = useApiConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // ✅ SIN llamada a /auth: simplemente persistimos y redirigimos
      if (!password || password.length < 1) throw new Error("Ingresá la contraseña");
      if (remember) localStorage.setItem("adm-tfi.auth-email", email || "");
      // Guardamos la contraseña en texto plano (pedido explícito)
      localStorage.setItem("adm-tfi.password", password);
      // Redirección básica
      if (window && window.location) window.location.href = "/";
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("adm-tfi.auth-email");
    if (saved) setEmail(saved);
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Ingresá al Panel</h1>
          <p className="text-sm text-gray-500">Usuarios · Seguridad · Inventario</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="grid gap-4">
          <Input
            label="Email (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
          <label className="grid gap-1 text-sm">
            <span className="text-gray-700">Contraseña</span>
            <div className="flex items-stretch gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-indigo-400"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button type="button" variant="ghost" onClick={() => setShowPwd((s) => !s)}>
                {showPwd ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Recordarme en este equipo
          </label>
          <Button type="submit">Ingresar</Button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-500">
          Base URL actual: <span className="font-mono">{cfg.baseURL}</span>
          <br />
          Modo auth: <span className="font-mono">X-Password (texto plano)</span>
        </div>
        <div className="mt-4 text-[11px] text-gray-400">
          ⚠️ Aviso: guardar contraseñas en texto plano es inseguro. Me lo pediste así; si cambiás de idea, puedo migrarlo a tokens/JWT o Basic Auth.
        </div>
      </div>
    </div>
  );
}
