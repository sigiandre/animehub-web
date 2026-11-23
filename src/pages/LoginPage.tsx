import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Lock, Mail, User as UserIcon, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(username.trim(), email.trim(), password, avatarUrl.trim());
      } else {
        await login(email.trim(), password);
      }
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (isRegister
          ? "No se pudo completar el registro. Revisa los datos."
          : "Correo o contraseña incorrectos.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-gray-800 bg-brand-card p-7 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white shadow-lg shadow-brand-accent/25">
            <Flame className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            {isRegister
              ? "Únete a AnimeHub para guardar favoritos, reseñar y debatir."
              : "Inicia sesión para gestionar tu lista y comunidad."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-800/70 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                Nombre de usuario
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. AndreUzumaki"
                  className="w-full rounded-xl border border-gray-700 bg-brand-dark py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-accent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-gray-700 bg-brand-dark py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-700 bg-brand-dark py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                URL de Avatar (opcional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-700 bg-brand-dark py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-accent py-2.5 text-sm font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {loading
              ? "Procesando..."
              : isRegister
              ? "Registrarme"
              : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-800 pt-4 text-center text-xs text-gray-400">
          {isRegister ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="font-bold text-brand-accent hover:underline"
          >
            {isRegister ? "Inicia sesión aquí" : "Regístrate gratis"}
          </button>
        </div>
      </div>
    </div>
  );
};