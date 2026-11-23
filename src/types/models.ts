export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Mangaka {
  id: number;
  name: string;
  biography: string;
  country: string;
  birthDate?: string;
}

export interface Studio {
  id: number;
  name: string;
  country: string;
  foundedYear: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Anime {
  id: number;
  title: string;
  synopsis: string;
  coverImageUrl: string;
  bannerImageUrl: string;
  releaseYear: number;
  status: string;
  mangaka?: Mangaka | null;
  studio?: Studio | null;
}

export interface Episode {
  id: number;
  sagaId: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  durationMinutes: number;
  airDate?: string;
}

export interface Saga {
  id: number;
  animeId: number;
  animeTitle: string;
  title: string;
  description: string;
  orderIndex: number;
  episodes: Episode[];
}

export interface Ability {
  id: number;
  characterId: number;
  name: string;
  description: string;
  damageType: string;
}

export interface VoiceActor {
  id: number;
  fullName: string;
  language: string;
  photoUrl: string;
}

export interface Character {
  id: number;
  animeId: number;
  animeTitle: string;
  name: string;
  role: string;
  biography: string;
  imageUrl: string;
  voiceActor?: VoiceActor | null;
  abilities: Ability[];
}

export interface AnimeVideo {
  id: number;
  animeId: number;
  animeTitle: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoType: string;
  durationSeconds: number;
}

export interface Review {
  id: number;
  animeId: number;
  animeTitle: string;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ForumPost {
  id: number;
  animeId: number;
  animeTitle: string;
  userId: number;
  username: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  redirectUrl?: string | null;
  createdAt: string;
}