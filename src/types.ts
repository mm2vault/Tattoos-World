export type SupportedLanguage = 'tr' | 'en' | 'az' | 'ru' | 'de' | 'es' | 'fr' | 'pt' | 'it';

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
  | 'fine_line'
  | string;

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  discord?: string;
  website?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  handle: string;
  email: string;
  photoURL: string;
  bio: string;
  instagram: string;
  tiktok: string;
  discord: string;
  website: string;
  customLinks: string[];
  isArtist: boolean;
  verified: boolean;
  role: 'user' | 'artist' | 'admin' | string;
  isAdmin: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  savedTattooIds: string[];
  bannerURL?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  recipientUid: string;
  senderUid: string;
  senderName: string;
  senderHandle: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'follow';
  tattooId?: string;
  tattooTitle?: string;
  text: string;
  createdAt: string;
  read: boolean;
  [key: string]: any;
}

export interface Comment {
  id: string;
  tattooId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  [key: string]: any;
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
  creatorRole: string;
  creatorVerified: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isFeatured?: boolean;
  tags: string[];
  socialLinks?: SocialLinks;
  [key: string]: any;
}
