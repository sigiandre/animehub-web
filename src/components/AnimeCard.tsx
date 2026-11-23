import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Tv } from "lucide-react";
import type { Anime } from "../types/models";

interface AnimeCardProps {
  anime: Anime;
}

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80";

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  return (
    <Link
      to={`/animes/${anime.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-800/90 bg-brand-card transition duration-300 hover:-translate-y-1 hover:border-brand-accent/60 hover:shadow-xl hover:shadow-brand-accent/10"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
        <img
          src={anime.coverImageUrl || FALLBACK_COVER}
          alt={anime.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {anime.status}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-white transition group-hover:text-brand-accent">
            {anime.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-400">
            {anime.synopsis || "Sin sinopsis disponible."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-800/80 pt-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-brand-accent" />
            {anime.releaseYear}
          </span>
          <span className="flex max-w-[65%] items-center gap-1 truncate">
            <Tv className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="truncate">{anime.studio?.name || "Estudio N/A"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};