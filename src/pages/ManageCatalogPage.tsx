import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Building2, Film, FolderPlus, PenTool, PlusCircle } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import type { Category, Mangaka, Studio } from "../types/models";

type ManageTab = "anime" | "category" | "studio" | "mangaka";

export const ManageCatalogPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ManageTab>("anime");
  const [mangakas, setMangakas] = useState<Mangaka[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Estado para nuevo Anime
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [status, setStatus] = useState("Finalizado");
  const [mangakaId, setMangakaId] = useState<string>("");
  const [studioId, setStudioId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Estado para nueva Categoría
  const [categoryName, setCategoryName] = useState("");

  // Estado para nuevo Estudio
  const [studioName, setStudioName] = useState("");
  const [studioCountry, setStudioCountry] = useState("Japón");
  const [foundedYear, setFoundedYear] = useState<number>(2000);

  // Estado para nuevo Mangaka
  const [mangakaName, setMangakaName] = useState("");
  const [mangakaBio, setMangakaBio] = useState("");
  const [mangakaCountry, setMangakaCountry] = useState("Japón");

  const loadSelectData = async () => {
    try {
      const [mRes, sRes, cRes] = await Promise.all([
        axiosClient.get<Mangaka[]>("/Mangakas"),
        axiosClient.get<Studio[]>("/Studios"),
        axiosClient.get<Category[]>("/Categories"),
      ]);
      setMangakas(mRes.data);
      setStudios(sRes.data);
      setCategories(cRes.data);
    } catch {
      // Ignorado si no hay datos aún
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSelectData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const notifySuccess = (text: string) => {
    setStatusMessage({ type: "success", text });
    loadSelectData();
  };

  const notifyError = (text: string) => {
    setStatusMessage({ type: "error", text });
  };

  const handleCreateAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const createdRes = await axiosClient.post<{ id: number }>("/Animes", {
        title: title.trim(),
        synopsis: synopsis.trim(),
        coverImageUrl: coverImageUrl.trim(),
        bannerImageUrl: bannerImageUrl.trim(),
        releaseYear: Number(releaseYear),
        status,
        mangakaId: mangakaId ? Number(mangakaId) : null,
        studioId: studioId ? Number(studioId) : null,
      });

      if (selectedCategoryId && createdRes.data?.id) {
        await axiosClient.post("/Categories/assign", {
          animeId: createdRes.data.id,
          categoryId: Number(selectedCategoryId),
        });
      }

      notifySuccess(`Anime "${title.trim()}" creado con éxito.`);
      setTitle("");
      setSynopsis("");
      setCoverImageUrl("");
      setBannerImageUrl("");
      setSelectedCategoryId("");
    } catch {
      notifyError("No se pudo crear el anime. Verifica los campos e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await axiosClient.post("/Categories", { name: categoryName.trim() });
      notifySuccess(`Categoría "${categoryName.trim()}" agregada.`);
      setCategoryName("");
    } catch {
      notifyError("Error al crear la categoría.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await axiosClient.post("/Studios", {
        name: studioName.trim(),
        country: studioCountry.trim() || "Japón",
        foundedYear: Number(foundedYear),
      });
      notifySuccess(`Estudio "${studioName.trim()}" registrado.`);
      setStudioName("");
    } catch {
      notifyError("Error al registrar el estudio.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMangaka = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangakaName.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      await axiosClient.post("/Mangakas", {
        name: mangakaName.trim(),
        biography: mangakaBio.trim(),
        country: mangakaCountry.trim() || "Japón",
      });
      notifySuccess(`Mangaka "${mangakaName.trim()}" registrado.`);
      setMangakaName("");
      setMangakaBio("");
    } catch {
      notifyError("Error al registrar el mangaka.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabItems: { key: ManageTab; label: string; icon: React.ReactNode }[] = [
    { key: "anime", label: "Nuevo Anime", icon: <Film className="h-4 w-4" /> },
    { key: "category", label: "Categoría", icon: <FolderPlus className="h-4 w-4" /> },
    { key: "studio", label: "Estudio", icon: <Building2 className="h-4 w-4" /> },
    { key: "mangaka", label: "Mangaka", icon: <PenTool className="h-4 w-4" /> },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Panel de Catálogo</h1>
          <p className="mt-1 text-xs text-gray-400">
            Agrega series, categorías, estudios y mangakas directo a tu base de datos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="self-start rounded-xl border border-gray-700 bg-brand-card px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-brand-accent hover:text-white"
        >
          Ver Catálogo
        </button>
      </div>

      {/* Selector de pestañas */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setActiveTab(item.key);
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === item.key
                ? "bg-brand-accent text-white"
                : "border border-gray-800 bg-brand-card text-gray-300 hover:border-gray-600"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {statusMessage && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-xs font-medium ${
            statusMessage.type === "success"
              ? "border-emerald-700/60 bg-emerald-950/30 text-emerald-300"
              : "border-red-800/60 bg-red-950/30 text-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Formulario Nuevo Anime */}
      {activeTab === "anime" && (
        <form
          onSubmit={handleCreateAnime}
          className="space-y-4 rounded-2xl border border-gray-800 bg-brand-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Título del Anime *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Demon Slayer: Kimetsu no Yaiba"
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Año Estreno
                </label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                >
                  <option value="Finalizado">Finalizado</option>
                  <option value="En emisión">En emisión</option>
                  <option value="Próximamente">Próximamente</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              Sinopsis *
            </label>
            <textarea
              rows={3}
              required
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Resume la trama principal de la serie..."
              className="w-full rounded-xl border border-gray-700 bg-brand-dark p-3 text-sm text-white outline-none focus:border-brand-accent"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                URL Portada (Cover) *
              </label>
              <input
                type="url"
                required
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                URL Banner (opcional)
              </label>
              <input
                type="url"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Mangaka
              </label>
              <select
                value={mangakaId}
                onChange={(e) => setMangakaId(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
              >
                <option value="">-- Seleccionar --</option>
                {mangakas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Estudio
              </label>
              <select
                value={studioId}
                onChange={(e) => setStudioId(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
              >
                <option value="">-- Seleccionar --</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Categoría inicial
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
              >
                <option value="">-- Ninguna --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{submitting ? "Guardando..." : "Publicar Anime"}</span>
          </button>
        </form>
      )}

      {/* Formulario Categoría */}
      {activeTab === "category" && (
        <form
          onSubmit={handleCreateCategory}
          className="space-y-4 rounded-2xl border border-gray-800 bg-brand-card p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej. Acción, Fantasía Oscura, Seinen..."
              className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Crear Categoría"}
          </button>
        </form>
      )}

      {/* Formulario Estudio */}
      {activeTab === "studio" && (
        <form
          onSubmit={handleCreateStudio}
          className="space-y-4 rounded-2xl border border-gray-800 bg-brand-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Nombre del Estudio *
              </label>
              <input
                type="text"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Ej. ufotable, MAPPA, Wit Studio..."
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Año Fundación
              </label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              País
            </label>
            <input
              type="text"
              value={studioCountry}
              onChange={(e) => setStudioCountry(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Registrar Estudio"}
          </button>
        </form>
      )}

      {/* Formulario Mangaka */}
      {activeTab === "mangaka" && (
        <form
          onSubmit={handleCreateMangaka}
          className="space-y-4 rounded-2xl border border-gray-800 bg-brand-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Nombre del Mangaka *
              </label>
              <input
                type="text"
                required
                value={mangakaName}
                onChange={(e) => setMangakaName(e.target.value)}
                placeholder="Ej. Koyoharu Gotouge"
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                País
              </label>
              <input
                type="text"
                value={mangakaCountry}
                onChange={(e) => setMangakaCountry(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              Biografía
            </label>
            <textarea
              rows={3}
              value={mangakaBio}
              onChange={(e) => setMangakaBio(e.target.value)}
              placeholder="Obras destacadas o notas biográficas..."
              className="w-full rounded-xl border border-gray-700 bg-brand-dark p-3 text-sm text-white outline-none focus:border-brand-accent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Registrar Mangaka"}
          </button>
        </form>
      )}
    </main>
  );
};