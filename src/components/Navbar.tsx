import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Flame, LogIn, LogOut, PlusCircle, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import type { NotificationItem } from "../types/models";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    axiosClient
      .get<NotificationItem[]>(`/Notifications/user/${user.id}`)
      .then((res) => {
        const unread = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-brand-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent text-white shadow-lg shadow-brand-accent/25">
            <Flame className="h-5 w-5" />
          </span>
          <span>
            Anime<span className="text-brand-accent">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/"
            className="text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Catálogo
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link
                to="/watchlist"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition hover:text-white"
                title="Favoritos y Notificaciones"
              >
                <Bookmark className="h-4 w-4 text-brand-accent" />
                <span className="hidden sm:inline">Mi Lista</span>
              </Link>

              <Link
                to="/manage"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition hover:text-white"
              >
                <PlusCircle className="h-4 w-4 text-brand-accent" />
                <span className="hidden sm:inline">Gestionar</span>
              </Link>

              <Link
                to="/watchlist"
                className="relative rounded-lg bg-brand-card p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white"
                title="Notificaciones"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="hidden items-center gap-2 rounded-full border border-gray-800 bg-brand-card px-3 py-1.5 text-xs font-medium text-gray-200 md:flex">
                <UserIcon className="h-3.5 w-3.5 text-brand-accent" />
                <span>{user.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-brand-card px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-brand-accent hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-accent-hover"
            >
              <LogIn className="h-4 w-4" />
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};