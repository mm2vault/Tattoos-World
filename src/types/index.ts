export type CategoryId = 
  | 'all'
  | 'realism'
  | 'minimal'
  | 'mystic'
  | 'black_and_grey'
  | 'color'
  | 'geometric'
  | 'animals'
  | 'dark'
  | 'fantasy'
  | 'lettering'
  | 'traditional'
  | 'fine_line';

export interface Comment {
  id: string;
  tattooId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes?: number;
}

export interface Tattoo {
  id: string;
  title: string;
  category: CategoryId;
  categoryName: string;
  description: string;
  image: string;
  additionalImages?: string[];
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorPhoto: string;
  creatorRole?: string;
  creatorVerified?: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  tags: string[];
  isFeatured?: boolean;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    discord?: string;
    website?: string;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  handle: string;
  email: string;
  photoURL: string;
  bannerURL?: string;
  bio: string;
  instagram: string;
  tiktok: string;
  discord: string;
  website: string;
  isArtist?: boolean;
  verified?: boolean;
  role?: 'admin' | 'artist' | 'user';
  isAdmin?: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  savedTattooIds: string[];
  customLinks?: string[];
}

export type SupportedLanguage = 'tr' | 'en' | 'az' | 'ru' | 'de' | 'es' | 'fr' | 'pt' | 'it';

export type NotificationType = 'like' | 'comment' | 'follow' | 'announcement' | 'system' | 'badge';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  timestamp: number;
  senderName?: string;
  senderAvatar?: string;
  targetId?: string;
  targetImage?: string;
  badge?: string;
}

export interface PlatformSettings {
  allowUploads: boolean;
  allowComments: boolean;
  featuredDailyTattooId?: string;
  maintenanceNotice?: string;
}
