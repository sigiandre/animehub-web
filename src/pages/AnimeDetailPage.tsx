import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bookmark,
  ExternalLink,
  Film,
  Layers,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import type {
  Ability,
  Anime,
  AnimeVideo,
  Category,
  Character,
  Episode,
  ForumPost,
  Review,
  Saga,
} from "../types/models";

type TabKey = "sagas" | "characters" | "videos" | "reviews" | "forum";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const animeId = Number(id);
  const { user, isAuthenticated } = useAuth();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [videos, setVideos] = useState<AnimeVideo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("sagas");
  const [loading, setLoading] = useState<boolean>(true);
  const [favMessage, setFavMessage] = useState<string | null>(null);

  // Reseñas y Foro
  const [rating, setRating] = useState<number>(9);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [postTitle, setPostTitle] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");

  // Nueva Saga
  const [sagaTitle, setSagaTitle] = useState<string>("");
  const [sagaDescription, setSagaDescription] = useState<string>("");
  const [sagaOrder, setSagaOrder] = useState<number>(1);

  // Nuevo Episodio (asociado a una saga)
  const [activeEpisodeSagaId, setActiveEpisodeSagaId] = useState<number | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [episodeTitle, setEpisodeTitle] = useState<string>("");
  const [episodeSynopsis, setEpisodeSynopsis] = useState<string>("");
  const [episodeDuration, setEpisodeDuration] = useState<number>(24);

  // Nuevo Personaje
  const [charName, setCharName] = useState<string>("");
  const [charRole, setCharRole] = useState<string>("Protagonista");
  const [charBio, setCharBio] = useState<string>("");
  const [charImageUrl, setCharImageUrl] = useState<string>("");

  // Nueva Habilidad (asociada a un personaje)
  const [activeAbilityCharId, setActiveAbilityCharId] = useState<number | null>(null);
  const [abilityName, setAbilityName] = useState<string>("");
  const [abilityDesc, setAbilityDesc] = useState<string>("");

  // Nuevo Video
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [videoType, setVideoType] = useState<string>("Opening");
  const [durationSeconds, setDurationSeconds] = useState<number>(90);

  useEffect(() => {
    if (!animeId) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const [
          animeRes,
          catRes,
          sagasRes,
          charsRes,
          videosRes,
          reviewsRes,
          forumRes,
        ] = await Promise.all([
          axiosClient.get<Anime>(`/Animes/${animeId}`),
          axiosClient.get<Category[]>(`/Categories/anime/${animeId}`),
          axiosClient.get<Saga[]>(`/Sagas/anime/${animeId}`),
          axiosClient.get<Character[]>(`/Characters/anime/${animeId}`),
          axiosClient.get<AnimeVideo[]>(`/AnimeVideos/anime/${animeId}`),
          axiosClient.get<Review[]>(`/Reviews/anime/${animeId}`),
          axiosClient.get<ForumPost[]>(`/ForumPosts/anime/${animeId}`),
        ]);

        setAnime(animeRes.data);
        setCategories(catRes.data);
        setSagas(sagasRes.data);
        setSagaOrder(sagasRes.data.length + 1);
        setCharacters(
          charsRes.data.map((c) => ({ ...c, abilities: c.abilities ?? [] }))
        );
        setVideos(videosRes.data);
        setReviews(reviewsRes.data);
        setForumPosts(forumRes.data);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [animeId]);

  const handleAddFavorite = async () => {
    if (!isAuthenticated || !user) {
      setFavMessage("Inicia sesión para guardar animes en tu lista.");
      return;
    }

    try {
      await axiosClient.post("/Favorites", { userId: user.id, animeId });
      setFavMessage("¡Agregado a tus favoritos!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo agregar a favoritos.";
      setFavMessage(msg);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewComment.trim()) return;

    const res = await axiosClient.post<Review>("/Reviews", {
      animeId,
      userId: user.id,
      rating,
      comment: reviewComment.trim(),
    });
    setReviews((prev) => [res.data, ...prev]);
    setReviewComment("");
  };

  const handleCreateForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postTitle.trim() || !postContent.trim()) return;

    const res = await axiosClient.post<ForumPost>("/ForumPosts", {
      animeId,
      userId: user.id,
      title: postTitle.trim(),
      content: postContent.trim(),
    });
    setForumPosts((prev) => [res.data, ...prev]);
    setPostTitle("");
    setPostContent("");
  };

  const handleCreateSaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sagaTitle.trim()) return;

    const res = await axiosClient.post<Saga>("/Sagas", {
      animeId,
      title: sagaTitle.trim(),
      description: sagaDescription.trim(),
      orderIndex: Number(sagaOrder),
    });
    const createdSaga: Saga = { ...res.data, episodes: res.data.episodes ?? [] };
    setSagas((prev) => [...prev, createdSaga]);
    setSagaTitle("");
    setSagaDescription("");
    setSagaOrder((prev) => prev + 1);
  };

  const openEpisodeForm = (saga: Saga) => {
    setActiveEpisodeSagaId(saga.id);
    const nextEpNumber =
      saga.episodes.length > 0
        ? Math.max(...saga.episodes.map((ep) => ep.episodeNumber)) + 1
        : 1;
    setEpisodeNumber(nextEpNumber);
    setEpisodeTitle("");
    setEpisodeSynopsis("");
    setEpisodeDuration(24);
  };

  const handleCreateEpisode = async (e: React.FormEvent, sagaId: number) => {
    e.preventDefault();
    if (!episodeTitle.trim()) return;

    const res = await axiosClient.post<Episode>("/Episodes", {
      sagaId,
      episodeNumber: Number(episodeNumber),
      title: episodeTitle.trim(),
      synopsis: episodeSynopsis.trim(),
      durationMinutes: Number(episodeDuration),
    });

    setSagas((prev) =>
      prev.map((s) =>
        s.id === sagaId
          ? { ...s, episodes: [...(s.episodes ?? []), res.data] }
          : s
      )
    );
    setActiveEpisodeSagaId(null);
    setEpisodeTitle("");
    setEpisodeSynopsis("");
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;

    const res = await axiosClient.post<Character>("/Characters", {
      animeId,
      name: charName.trim(),
      role: charRole,
      biography: charBio.trim(),
      imageUrl: charImageUrl.trim(),
    });

    const createdChar: Character = {
      ...res.data,
      abilities: res.data.abilities ?? [],
    };
    setCharacters((prev) => [...prev, createdChar]);
    setCharName("");
    setCharBio("");
    setCharImageUrl("");
  };

  const handleCreateAbility = async (e: React.FormEvent, characterId: number) => {
    e.preventDefault();
    if (!abilityName.trim()) return;

    const res = await axiosClient.post<Ability>("/Abilities", {
      characterId,
      name: abilityName.trim(),
      description: abilityDesc.trim(),
    });

    setCharacters((prev) =>
      prev.map((c) =>
        c.id === characterId
          ? { ...c, abilities: [...(c.abilities ?? []), res.data] }
          : c
      )
    );
    setActiveAbilityCharId(null);
    setAbilityName("");
    setAbilityDesc("");
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    const res = await axiosClient.post<AnimeVideo>("/AnimeVideos", {
      animeId,
      title: videoTitle.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      videoType,
      durationSeconds: Number(durationSeconds),
    });
    setVideos((prev) => [res.data, ...prev]);
    setVideoTitle("");
    setVideoUrl("");
    setThumbnailUrl("");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-gray-400">
        Cargando ficha del anime...
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-red-400">
        Anime no encontrado.
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "sagas", label: "Sagas y Episodios", icon: <Layers className="h-4 w-4" />, count: sagas.length },
    { key: "characters", label: "Personajes", icon: <Users className="h-4 w-4" />, count: characters.length },
    { key: "videos", label: "Videos", icon: <Film className="h-4 w-4" />, count: videos.length },
    { key: "reviews", label: "Reseñas", icon: <Star className="h-4 w-4" />, count: reviews.length },
    { key: "forum", label: "Foro", icon: <MessageSquare className="h-4 w-4" />, count: forumPosts.length },
  ];

  return (
    <div className="pb-14">
      {/* Banner y Cabecera */}
      <div className="relative h-64 w-full overflow-hidden border-b border-gray-800 sm:h-80">
        <img
          src={anime.bannerImageUrl || anime.coverImageUrl || FALLBACK_BANNER}
          alt={anime.title}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
      </div>

      <div className="mx-auto -mt-32 max-w-7xl px-4 sm:-mt-40 sm:px-6">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end">
          <img
            src={anime.coverImageUrl || FALLBACK_BANNER}
            alt={anime.title}
            className="h-64 w-44 shrink-0 rounded-xl border-2 border-gray-700 object-cover shadow-2xl"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-brand-accent px-2.5 py-0.5 text-xs font-bold text-white">
                {anime.status}
              </span>
              <span className="rounded-md bg-brand-card px-2.5 py-0.5 text-xs font-medium text-gray-300">
                {anime.releaseYear}
              </span>
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-md border border-gray-700 bg-brand-card/80 px-2.5 py-0.5 text-xs text-gray-300"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              {anime.title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">
              {anime.synopsis}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
              <span>
                <strong className="text-gray-200">Mangaka:</strong>{" "}
                {anime.mangaka?.name || "No registrado"}
              </span>
              <span>
                <strong className="text-gray-200">Estudio:</strong>{" "}
                {anime.studio?.name || "No registrado"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddFavorite}
                className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-accent-hover"
              >
                <Bookmark className="h-4 w-4" />
                <span>Agregar a Favoritos</span>
              </button>
              {favMessage && (
                <span className="text-xs font-medium text-emerald-400">{favMessage}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="mt-10 flex gap-2 overflow-x-auto border-b border-gray-800 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.key
                  ? "bg-brand-accent text-white"
                  : "bg-brand-card text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido de Pestañas */}
        <div className="mt-6">
          {/* SAGAS Y EPISODIOS */}
          {activeTab === "sagas" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <form
                  onSubmit={handleCreateSaga}
                  className="space-y-3 rounded-xl border border-gray-800 bg-brand-card p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4 text-brand-accent" />
                    <span>Agregar Saga a {anime.title}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <input
                      type="text"
                      required
                      value={sagaTitle}
                      onChange={(e) => setSagaTitle(e.target.value)}
                      placeholder="Nombre de la saga..."
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent sm:col-span-3"
                    />
                    <input
                      type="number"
                      min={1}
                      value={sagaOrder}
                      onChange={(e) => setSagaOrder(Number(e.target.value))}
                      placeholder="Orden"
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                    />
                  </div>
                  <input
                    type="text"
                    value={sagaDescription}
                    onChange={(e) => setSagaDescription(e.target.value)}
                    placeholder="Descripción breve de la saga..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-accent-hover"
                  >
                    Guardar Saga
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {sagas.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay sagas registradas para este anime.</p>
                ) : (
                  sagas.map((saga) => (
                    <div
                      key={saga.id}
                      className="rounded-xl border border-gray-800 bg-brand-card p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {saga.orderIndex}. {saga.title}
                          </h3>
                          <p className="mt-1 text-xs text-gray-400">{saga.description}</p>
                        </div>

                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={() =>
                              activeEpisodeSagaId === saga.id
                                ? setActiveEpisodeSagaId(null)
                                : openEpisodeForm(saga)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-brand-dark px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-brand-accent hover:text-white"
                          >
                            <Tv className="h-3.5 w-3.5 text-brand-accent" />
                            <span>
                              {activeEpisodeSagaId === saga.id
                                ? "Cerrar"
                                : "+ Episodio"}
                            </span>
                          </button>
                        )}
                      </div>

                      {activeEpisodeSagaId === saga.id && (
                        <form
                          onSubmit={(e) => handleCreateEpisode(e, saga.id)}
                          className="mt-4 space-y-3 rounded-xl border border-gray-700/80 bg-brand-dark p-4"
                        >
                          <p className="text-xs font-bold text-white">
                            Nuevo episodio en "{saga.title}"
                          </p>
                          <div className="grid gap-3 sm:grid-cols-5">
                            <input
                              type="number"
                              min={1}
                              required
                              value={episodeNumber}
                              onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                              placeholder="N° Ep."
                              className="rounded-lg border border-gray-700 bg-brand-card px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                            />
                            <input
                              type="text"
                              required
                              value={episodeTitle}
                              onChange={(e) => setEpisodeTitle(e.target.value)}
                              placeholder="Título del episodio..."
                              className="rounded-lg border border-gray-700 bg-brand-card px-3 py-2 text-sm text-white outline-none focus:border-brand-accent sm:col-span-3"
                            />
                            <input
                              type="number"
                              min={1}
                              value={episodeDuration}
                              onChange={(e) => setEpisodeDuration(Number(e.target.value))}
                              placeholder="Min."
                              className="rounded-lg border border-gray-700 bg-brand-card px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                            />
                          </div>
                          <input
                            type="text"
                            value={episodeSynopsis}
                            onChange={(e) => setEpisodeSynopsis(e.target.value)}
                            placeholder="Sinopsis breve del episodio..."
                            className="w-full rounded-lg border border-gray-700 bg-brand-card px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-accent-hover"
                          >
                            Guardar Episodio
                          </button>
                        </form>
                      )}

                      <div className="mt-4 space-y-2">
                        {(saga.episodes ?? []).map((ep) => (
                          <div
                            key={ep.id}
                            className="flex flex-col justify-between rounded-lg border border-gray-800/80 bg-brand-dark/70 p-3 sm:flex-row sm:items-center"
                          >
                            <div>
                              <span className="text-xs font-bold text-brand-accent">
                                Ep. {ep.episodeNumber}
                              </span>{" "}
                              <span className="text-sm font-semibold text-white">
                                {ep.title}
                              </span>
                              <p className="mt-0.5 text-xs text-gray-400">{ep.synopsis}</p>
                            </div>
                            <span className="mt-2 shrink-0 text-xs text-gray-400 sm:mt-0">
                              {ep.durationMinutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PERSONAJES Y HABILIDADES */}
          {activeTab === "characters" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <form
                  onSubmit={handleCreateCharacter}
                  className="space-y-3 rounded-xl border border-gray-800 bg-brand-card p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4 text-brand-accent" />
                    <span>Agregar Personaje a {anime.title}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      required
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="Nombre del personaje..."
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent sm:col-span-2"
                    />
                    <select
                      value={charRole}
                      onChange={(e) => setCharRole(e.target.value)}
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                    >
                      <option value="Protagonista">Protagonista</option>
                      <option value="Secundario">Secundario</option>
                      <option value="Antagonista">Antagonista</option>
                    </select>
                  </div>
                  <input
                    type="url"
                    value={charImageUrl}
                    onChange={(e) => setCharImageUrl(e.target.value)}
                    placeholder="URL de imagen del personaje (opcional)..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <textarea
                    rows={2}
                    value={charBio}
                    onChange={(e) => setCharBio(e.target.value)}
                    placeholder="Biografía o rol en la historia..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark p-3 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-accent-hover"
                  >
                    Guardar Personaje
                  </button>
                </form>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {characters.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay personajes registrados.</p>
                ) : (
                  characters.map((char) => (
                    <div
                      key={char.id}
                      className="flex flex-col justify-between rounded-xl border border-gray-800 bg-brand-card p-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={char.imageUrl || FALLBACK_BANNER}
                          alt={char.name}
                          className="h-28 w-20 shrink-0 rounded-lg object-cover bg-gray-900"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-white">{char.name}</h4>
                            <span className="rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
                              {char.role}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">{char.biography}</p>
                          {char.voiceActor && (
                            <p className="mt-2 text-xs text-amber-400">
                              Seiyuu / Voz: {char.voiceActor.fullName} ({char.voiceActor.language})
                            </p>
                          )}

                          {(char.abilities ?? []).length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {char.abilities.map((ab) => (
                                <span
                                  key={ab.id}
                                  title={ab.description}
                                  className="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-0.5 text-[11px] font-medium text-brand-accent"
                                >
                                  {ab.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {isAuthenticated && (
                        <div className="mt-3 border-t border-gray-800/80 pt-3">
                          {activeAbilityCharId === char.id ? (
                            <form
                              onSubmit={(e) => handleCreateAbility(e, char.id)}
                              className="space-y-2 rounded-lg bg-brand-dark p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">
                                  Nueva habilidad para {char.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveAbilityCharId(null)}
                                  className="text-[11px] text-gray-400 hover:text-white"
                                >
                                  Cancelar
                                </button>
                              </div>
                              <input
                                type="text"
                                required
                                value={abilityName}
                                onChange={(e) => setAbilityName(e.target.value)}
                                placeholder="Ej. Rasengan, Modo Sabio..."
                                className="w-full rounded-lg border border-gray-700 bg-brand-card px-3 py-1.5 text-xs text-white outline-none focus:border-brand-accent"
                              />
                              <input
                                type="text"
                                value={abilityDesc}
                                onChange={(e) => setAbilityDesc(e.target.value)}
                                placeholder="Descripción corta (opcional)..."
                                className="w-full rounded-lg border border-gray-700 bg-brand-card px-3 py-1.5 text-xs text-white outline-none focus:border-brand-accent"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-accent-hover"
                              >
                                Agregar Habilidad
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAbilityCharId(char.id);
                                setAbilityName("");
                                setAbilityDesc("");
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Agregar habilidad</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIDEOS CON REPRODUCTOR EMBEBIDO DE YOUTUBE */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <form
                  onSubmit={handleCreateVideo}
                  className="space-y-3 rounded-xl border border-gray-800 bg-brand-card p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4 text-brand-accent" />
                    <span>Agregar Video (Opening, Ending o Trailer)</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Título del video..."
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent sm:col-span-2"
                    />
                    <select
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                    >
                      <option value="Opening">Opening</option>
                      <option value="Ending">Ending</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Clip">Clip</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="URL de YouTube o video..."
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent sm:col-span-2"
                    />
                    <input
                      type="number"
                      min={1}
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      placeholder="Duración (seg)"
                      className="rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                    />
                  </div>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="URL de miniatura (opcional)..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-accent-hover"
                  >
                    Publicar Video
                  </button>
                </form>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {videos.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay videos registrados.</p>
                ) : (
                  videos.map((vid) => {
                    const embedUrl = getYouTubeEmbedUrl(vid.videoUrl);
                    return (
                      <div
                        key={vid.id}
                        className="overflow-hidden rounded-xl border border-gray-800 bg-brand-card"
                      >
                        {embedUrl ? (
                          <div className="aspect-video w-full bg-black">
                            <iframe
                              src={embedUrl}
                              title={vid.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <img
                            src={vid.thumbnailUrl || FALLBACK_BANNER}
                            alt={vid.title}
                            className="h-44 w-full object-cover bg-gray-900"
                          />
                        )}
                        <div className="p-4">
                          <span className="rounded bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-brand-accent">
                            {vid.videoType}
                          </span>
                          <h4 className="mt-2 text-sm font-bold text-white">{vid.title}</h4>
                          <a
                            href={vid.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:underline"
                          >
                            <span>Abrir en nueva pestaña</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* RESEÑAS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <form
                  onSubmit={handleCreateReview}
                  className="space-y-3 rounded-xl border border-gray-800 bg-brand-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Escribir reseña</h4>
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <span>Puntuación (1-10):</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-16 rounded-lg border border-gray-700 bg-brand-dark px-2 py-1 text-center text-white"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Comparte tu opinión sobre este anime..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark p-3 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-accent-hover"
                  >
                    Publicar Reseña
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-gray-800 bg-brand-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{rev.username}</span>
                      <span className="rounded-md bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                        ★ {rev.rating}/10
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORO */}
          {activeTab === "forum" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <form
                  onSubmit={handleCreateForumPost}
                  className="space-y-3 rounded-xl border border-gray-800 bg-brand-card p-4"
                >
                  <h4 className="text-sm font-bold text-white">Nuevo tema de debate</h4>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Título del debate o teoría..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark px-3.5 py-2 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Desarrolla tu pregunta o teoría..."
                    className="w-full rounded-xl border border-gray-700 bg-brand-dark p-3 text-sm text-white outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-accent-hover"
                  >
                    Crear Hilo
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {forumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl border border-gray-800 bg-brand-card p-4"
                  >
                    <h4 className="text-base font-bold text-white">{post.title}</h4>
                    <p className="mt-1.5 text-sm text-gray-300">{post.content}</p>
                    <p className="mt-2.5 text-xs text-gray-400">
                      Publicado por <strong className="text-gray-200">{post.username}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};