import React, { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import axiosClient from "../api/axiosClient";
import type { Anime, Category } from "../types/models";
import { AnimeCard } from "../components/AnimeCard";

export const HomePage: React.FC = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryAnimeIds, setCategoryAnimeIds] = useState<number[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const [animesRes, categoriesRes] = await Promise.all([
          axiosClient.get<Anime[]>("/Animes"),
          axiosClient.get<Category[]>("/Categories"),
        ]);
        setAnimes(animesRes.data);
        setCategories(categoriesRes.data);
      } catch {
        setError("No se pudo conectar con AnimeHubAPI. Verifica que el backend esté ejecutándose.");
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const handleSelectCategory = async (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === null) {
      setCategoryAnimeIds(null);
      return;
    }

    try {
      const checks = await Promise.all(
        animes.map(async (anime) => {
          const res = await axiosClient.get<Category[]>(`/Categories/anime/${anime.id}`);
          const hasCategory = res.data.some((c) => c.id === categoryId);
          return hasCategory ? anime.id : null;
        })
      );
      setCategoryAnimeIds(checks.filter((id): id is number => id !== null));
    } catch {
      setCategoryAnimeIds([]);
    }
  };

  const filteredAnimes = useMemo(() => {
    return animes.filter((anime) => {
      const matchesCategory =
        categoryAnimeIds === null || categoryAnimeIds.includes(anime.id);
      const query = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !query ||
        anime.title.toLowerCase().includes(query) ||
        (anime.mangaka?.name.toLowerCase().includes(query) ?? false) ||
        (anime.studio?.name.toLowerCase().includes(query) ?? false);

      return matchesCategory && matchesQuery;
    });
  }, [animes, categoryAnimeIds, searchTerm]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Cabecera */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-gray-800 bg-gradient-to-r from-brand-card via-brand-card to-red-950/20 p-6 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-semibold text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Catálogo Oficial AnimeHub</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            Explora series, sagas y personajes
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Descubre fichas técnicas, habilidades, videos, reseñas y debates de la comunidad.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar anime, estudio o mangaka..."
            className="w-full rounded-xl border border-gray-700 bg-brand-dark py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-accent"
          />
        </div>
      </div>

      {/* Filtros de Categoría */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleSelectCategory(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            selectedCategoryId === null
              ? "bg-brand-accent text-white"
              : "border border-gray-800 bg-brand-card text-gray-300 hover:border-gray-600"
          }`}
        >
          Todos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              selectedCategoryId === cat.id
                ? "bg-brand-accent text-white"
                : "border border-gray-800 bg-brand-card text-gray-300 hover:border-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Estados */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-80 animate-pulse rounded-xl bg-brand-card" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && filteredAnimes.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-brand-card p-10 text-center text-sm text-gray-400">
          No se encontraron animes con esos filtros.
        </div>
      )}

      {!loading && !error && filteredAnimes.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </main>
  );
};