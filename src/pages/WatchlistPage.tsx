import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Bell, Bookmark, CheckCircle2, Trash2 } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import type { NotificationItem } from "../types/models";

interface FavoriteResponse {
  id: number;
  userId: number;
  animeId: number;
  animeTitle: string;
  coverImageUrl: string;
  addedAt: string;
}

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80";

export const WatchlistPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        const [favRes, notifRes] = await Promise.all([
          axiosClient.get<FavoriteResponse[]>(`/Favorites/user/${user.id}`),
          axiosClient.get<NotificationItem[]>(`/Notifications/user/${user.id}`),
        ]);
        setFavorites(favRes.data);
        setNotifications(notifRes.data);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleRemoveFavorite = async (favoriteId: number) => {
    await axiosClient.delete(`/Favorites/${favoriteId}`);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await axiosClient.patch(`/Notifications/${notificationId}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Mi Lista y Actividad
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Administra tus animes favoritos y revisa tus notificaciones recientes.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Cargando tu información...</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Columna Favoritos (2/3) */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-brand-accent" />
              <h2 className="text-lg font-bold text-white">
                Animes Favoritos ({favorites.length})
              </h2>
            </div>

            {favorites.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-brand-card p-8 text-center text-sm text-gray-400">
                Aún no tienes animes en favoritos. Explora el{" "}
                <Link to="/" className="font-semibold text-brand-accent hover:underline">
                  catálogo
                </Link>{" "}
                y guarda tus series preferidas.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-brand-card p-3"
                  >
                    <Link
                      to={`/animes/${fav.animeId}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <img
                        src={fav.coverImageUrl || FALLBACK_COVER}
                        alt={fav.animeTitle}
                        className="h-20 w-14 shrink-0 rounded-lg object-cover bg-gray-900"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-white hover:text-brand-accent">
                          {fav.animeTitle}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Agregado el {new Date(fav.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleRemoveFavorite(fav.id)}
                      title="Quitar de favoritos"
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 transition hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Columna Notificaciones (1/3) */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-accent" />
              <h2 className="text-lg font-bold text-white">
                Notificaciones ({notifications.length})
              </h2>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-brand-card p-6 text-center text-sm text-gray-400">
                No tienes notificaciones por ahora.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-xl border p-4 transition ${
                      notif.isRead
                        ? "border-gray-800/70 bg-brand-card/60 opacity-75"
                        : "border-brand-accent/50 bg-brand-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Marcar como leída"
                          className="flex shrink-0 items-center gap-1 rounded-md bg-brand-accent/15 px-2 py-1 text-[11px] font-semibold text-brand-accent hover:bg-brand-accent/25"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Leída</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-300">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};