import { Tattoo, Comment, UserProfile, CategoryId, Notification } from '../types';
import { 
  auth, 
  googleProvider, 
  ADMIN_EMAIL, 
  isUserAdmin, 
  db 
} from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'tattos_world_notifications_v1',
  TATTOOS: 'tattos_world_tattoos_v1',
  COMMENTS: 'tattos_world_comments_v1',
  LIKES: 'tattos_world_likes_v1',
  USER: 'tattos_world_current_user_v1',
  FOLLOWS: 'tattos_world_follows_v1',
  LANGUAGE: 'tattos_world_lang_v1',
  SESSION: 'tattos_world_session_active_v1',
};

export const INITIAL_USER: UserProfile = {
  uid: 'user_default',
  displayName: 'Alex Rivers',
  handle: '@alexinked',
  email: 'alex@tattosworld.community',
  photoURL: './images/users/avatar_inkedlife.jpg',
  bio: 'Tattoo collector & aesthetic seeker. Living canvas.',
  instagram: 'https://instagram.com/alexinked',
  tiktok: 'https://tiktok.com/@alexinked',
  discord: 'alex#2026',
  website: 'https://tattosworld.com',
  customLinks: [
    'https://www.tiktok.com/@alexinked',
    'https://www.instagram.com/alexinked',
    'https://www.facebook.com/alexrivers.ink'
  ],
  isArtist: false,
  verified: false,
  role: 'user',
  isAdmin: false,
  followersCount: 0,
  followingCount: 0,
  createdAt: '2025-11-12',
  savedTattooIds: ['tattoo_1', 'tattoo_3'],
};

export const INITIAL_ARTISTS: UserProfile[] = [];

export const INITIAL_TATTOOS: Tattoo[] = [
  {
    id: 'tattoo_1',
    title: 'Lion & Clock',
    category: 'realism',
    categoryName: 'Realizm',
    description: 'Zamanın izinde... Güç, sabır ve yeniden doğuş. Bu tasarım, hayatın döngüsünü ve içsel gücü simgeliyor.',
    image: './images/tattoos/lion_clock.jpg',
    additionalImages: [
      './images/tattoos/lion_clock.jpg',
      './images/tattoos/rose_dark.jpg',
      './images/tattoos/hero_sleeve.jpg',
    ],
    creatorId: 'artist_inkedlife',
    creatorName: 'Marco Vance',
    creatorHandle: '@inkedlife',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-03-12',
    likesCount: 0,
    commentsCount: 0,
    isFeatured: true,
    tags: ['Realizm', 'Siyah & Gri', 'Lion', 'Clock'],
    socialLinks: {
      instagram: 'https://instagram.com',
      tiktok: 'https://tiktok.com',
      discord: 'inkedlife#0001',
      website: 'https://inkedlife.studio',
    },
  },
  {
    id: 'tattoo_2',
    title: 'Butterfly',
    category: 'minimal',
    categoryName: 'Minimal',
    description: 'Hafiflik ve dönüşümün en narin hali. Tek iğne (single needle) tekniğiyle tasarlandı.',
    image: './images/tattoos/butterfly_ink.jpg',
    creatorId: 'artist_luna',
    creatorName: 'Luna Valery',
    creatorHandle: '@lunatattoos',
    creatorPhoto: './images/users/avatar_luna.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-03-15',
    likesCount: 0,
    commentsCount: 0,
    isFeatured: true,
    tags: ['Minimal', 'Fine Line', 'Butterfly'],
    socialLinks: {
      instagram: 'https://instagram.com',
      tiktok: '',
      discord: 'luna#7788',
      website: 'https://luna.tattoos',
    },
  },
  {
    id: 'tattoo_3',
    title: 'Snake',
    category: 'dark',
    categoryName: 'Seri / Dark',
    description: 'Derin gölgeler, pulların ritmik dizilimi ve karanlık mitoloji simgeleri.',
    image: './images/tattoos/snake_serpent.jpg',
    creatorId: 'artist_darksoul',
    creatorName: 'Damian Black',
    creatorHandle: '@darksoul',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-03-10',
    likesCount: 0,
    commentsCount: 0,
    isFeatured: true,
    tags: ['Dark', 'Serpent', 'Blackwork'],
    socialLinks: {
      instagram: 'https://instagram.com',
      tiktok: '',
      discord: 'darksoul#666',
      website: 'https://darksoul.ink',
    },
  },
  {
    id: 'tattoo_4',
    title: 'Rose',
    category: 'realism',
    categoryName: 'Realizm',
    description: 'Kadife dokulu yapraklar ve dikenlerin dramatik kontrastı. Yüksek çözünürlüklü gölgelendirme.',
    image: './images/tattoos/rose_dark.jpg',
    creatorId: 'artist_inkedlife',
    creatorName: 'Marco Vance',
    creatorHandle: '@inkedlife',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-02-28',
    likesCount: 0,
    commentsCount: 0,
    tags: ['Realizm', 'Siyah & Gri', 'Rose'],
    socialLinks: {
      instagram: 'https://instagram.com',
    },
  },
  {
    id: 'tattoo_5',
    title: 'Cross',
    category: 'minimal',
    categoryName: 'Minimal',
    description: 'Gotik ve geometrik hatların kusursuz birleşimi. İnce çizgiler ve zamansız estetik.',
    image: './images/tattoos/cross_gothic.jpg',
    creatorId: 'artist_luna',
    creatorName: 'Luna Valery',
    creatorHandle: '@tattoartist',
    creatorPhoto: './images/users/avatar_luna.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-02-15',
    likesCount: 0,
    commentsCount: 0,
    tags: ['Minimal', 'Gothic', 'Cross'],
  },
  {
    id: 'tattoo_6',
    title: 'Wolf',
    category: 'realism',
    categoryName: 'Realizm',
    description: 'Vahşi doğanın asaleti, derin bakışlar ve gerçekçi kürk dokusu.',
    image: './images/tattoos/wolf_dark.jpg',
    creatorId: 'artist_darksoul',
    creatorName: 'Damian Black',
    creatorHandle: '@blackink',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-02-10',
    likesCount: 0,
    commentsCount: 0,
    tags: ['Realizm', 'Hayvanlar', 'Wolf'],
  },
  {
    id: 'tattoo_7',
    title: 'Oriental Dragon',
    category: 'color',
    categoryName: 'Renkli',
    description: 'Geleneksel Doğu mitolojisinden esinlenen, canlı renkler ve akıcı dalgalarla bezenmiş ejderha.',
    image: './images/tattoos/dragon_oriental.jpg',
    creatorId: 'artist_inkedlife',
    creatorName: 'Marco Vance',
    creatorHandle: '@inkedlife',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    creatorRole: 'Sanatçı',
    creatorVerified: true,
    createdAt: '2026-01-20',
    likesCount: 0,
    commentsCount: 0,
    tags: ['Renkli', 'Oriental', 'Dragon'],
  },
];

class TattooStoreService {
  private tattoos: Tattoo[] = [];
  private comments: Record<string, Comment[]> = {};
  private userLikes: Record<string, Set<string>> = {};
  private currentUser: UserProfile = INITIAL_USER;
  private follows: Set<string> = new Set();
  private followerCounts: Record<string, number> = {};
  private notifications: Notification[] = [];
  private static readonly INTERACTION_RESET_KEY = 'tattos_world_interactions_reset_v2';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTattoos = localStorage.getItem(STORAGE_KEYS.TATTOOS);
      if (storedTattoos) {
        this.tattoos = JSON.parse(storedTattoos);
      } else {
        this.tattoos = [...INITIAL_TATTOOS];
        this.saveTattoos();
      }

      const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (storedComments) {
        this.comments = JSON.parse(storedComments);
      } else {
        // Fresh community starts with zero comments.
        this.comments = {};
        this.saveComments();
      }

      const storedLikes = localStorage.getItem(STORAGE_KEYS.LIKES);
      if (storedLikes) {
        const parsed = JSON.parse(storedLikes);
        this.userLikes = {};
        for (const [k, v] of Object.entries(parsed)) {
          this.userLikes[k] = new Set(v as string[]);
        }
      } else {
        // No seeded likes: every tattoo starts at zero and grows only from real actions.
        this.userLikes = {};
        this.saveLikes();
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Safety: If old mock admin or unauthenticated admin was in localStorage, reset to standard user
          if (parsed.uid === 'admin_mm2ultimatehub' || (!auth.currentUser && parsed.isAdmin)) {
            parsed.isAdmin = false;
            if (parsed.role === 'admin') parsed.role = 'user';
          }
          this.currentUser = parsed;
        } catch {
          this.currentUser = { ...INITIAL_USER };
        }
      } else {
        this.currentUser = { ...INITIAL_USER };
        this.saveUser();
      }

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifications) {
        this.notifications = JSON.parse(storedNotifications);
      }

      const storedFollows = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
      if (storedFollows) {
        this.follows = new Set(JSON.parse(storedFollows));
      }

      // Check Firebase Auth state & sync with Firestore
      try {
        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            this.setSessionActive(true);
            if (isUserAdmin(fbUser.email)) {
              await this.resetOldTestInteractions();
            }
            const isAdmin = isUserAdmin(fbUser.email);
            this.syncNotificationsFromFirestore().catch(() => {});
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const remote = snap.data() as Partial<UserProfile>;
                // Keep locally selected profile images when an older Firestore document
                // has no image (or still contains the starter image). This prevents a
                // reload/auth-state race from making a newly uploaded avatar/banner disappear.
                const localPhoto = this.currentUser.photoURL;
                const localBanner = this.currentUser.bannerURL;
                const remotePhoto = remote.photoURL;
                const remoteBanner = remote.bannerURL;
                const keepLocalPhoto = Boolean(localPhoto?.startsWith('data:image/'));
                const keepLocalBanner = Boolean(localBanner?.startsWith('data:image/'));
                this.currentUser = {
                  ...this.currentUser,
                  ...remote,
                  photoURL: keepLocalPhoto ? localPhoto : (remotePhoto || localPhoto || './images/users/avatar_inkedlife.jpg'),
                  bannerURL: keepLocalBanner ? localBanner : (remoteBanner || localBanner || ''),
                  uid: fbUser.uid,
                  email: fbUser.email || this.currentUser.email,
                  isAdmin,
                  role: isAdmin ? 'admin' : (remote.role || 'user'),
                  verified: isAdmin || remote.verified || false,
                };
                this.saveUser();
              } else {
                this.currentUser = {
                  ...this.currentUser,
                  uid: fbUser.uid,
                  email: fbUser.email || '',
                  displayName: fbUser.displayName || this.currentUser.displayName,
                  isAdmin,
                  role: isAdmin ? 'admin' : 'user',
                  verified: isAdmin,
                };
                this.saveUser();
              }
            } catch (err) {
              console.warn('Auth state Firestore sync notice:', err);
            }
          } else {
            // When not logged into Firebase Auth, never retain admin privileges.
            if (this.currentUser.isAdmin) {
              this.currentUser.isAdmin = false;
              if (this.currentUser.role === 'admin') this.currentUser.role = 'user';
              this.saveUser();
            }
          }
        });
        // Public community data can be read even before a user logs in.
        this.syncCommunityFromFirestore().catch(() => {});
      } catch (err) {
        console.warn('Firebase onAuthStateChanged setup notice:', err);
      }
    } catch (e) {
      console.error('Error loading tattoo store from localStorage', e);
      this.tattoos = [...INITIAL_TATTOOS];
      this.currentUser = INITIAL_USER;
    }
  }

  private saveTattoos() {
    try {
      localStorage.setItem(STORAGE_KEYS.TATTOOS, JSON.stringify(this.tattoos));
    } catch (e) {
      console.error('Error saving tattoos', e);
    }
  }

  private saveComments() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
    } catch (e) {
      console.error('Error saving comments', e);
    }
  }

  private saveLikes() {
    try {
      const serializable: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(this.userLikes)) {
        serializable[k] = Array.from(v);
      }
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(serializable));
    } catch (e) {
      console.error('Error saving likes', e);
    }
  }

  private saveUser() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error('Error saving user', e);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications.slice(0, 100)));
    } catch (e) {
      console.error('Error saving notifications', e);
    }
  }

  private emitNotificationUpdate() {
    try { window.dispatchEvent(new CustomEvent('tattoos-world-notifications')); } catch {}
  }

  private saveFollows() {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(Array.from(this.follows)));
    } catch (e) {
      console.error('Error saving follows', e);
    }
  }

  // Getters
  public getTattoos(): Tattoo[] {
    return this.tattoos;
  }

  public getTattooById(id: string): Tattoo | undefined {
    return this.tattoos.find(t => t.id === id);
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    this.saveUser();
  }

  /**
   * Check if user has an active, persistent session (no login popup on reload/re-entry)
   */
  public hasActiveSession(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Set session active status
   */
  public setSessionActive(active: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, active ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving session status', e);
    }
  }

  /**
   * Pull public community data from Firestore and merge it with the local cache.
   * Local starter content is preserved; remote content wins when IDs collide.
   */
  /**
   * One-time admin cleanup for the old test interaction dataset.
   * After this runs, likes/comments/follows are created only by current users.
   */
  public async resetOldTestInteractions(): Promise<void> {
    if (!this.isCurrentUserAdmin()) return;
    try {
      const alreadyReset = localStorage.getItem(TattooStoreService.INTERACTION_RESET_KEY) === 'done';
      if (alreadyReset) return;
      const resetMarker = await getDoc(doc(db, 'system', 'interaction_reset_v2'));
      if (resetMarker.exists()) {
        localStorage.setItem(TattooStoreService.INTERACTION_RESET_KEY, 'done');
        return;
      }

      const [commentSnap, likeSnap, followSnap] = await Promise.all([
        getDocs(collection(db, 'comments')),
        getDocs(collection(db, 'likes')),
        getDocs(collection(db, 'follows')),
      ]);
      await Promise.all([
        ...commentSnap.docs.map((d) => deleteDoc(d.ref)),
        ...likeSnap.docs.map((d) => deleteDoc(d.ref)),
        ...followSnap.docs.map((d) => deleteDoc(d.ref)),
      ]);

      this.comments = {};
      this.userLikes = {};
      this.follows = new Set();
      this.followerCounts = {};
      this.tattoos = this.tattoos.map((t) => ({ ...t, likesCount: 0, commentsCount: 0 }));
      this.currentUser.followersCount = 0;
      this.currentUser.followingCount = 0;
      this.saveComments();
      this.saveLikes();
      this.saveFollows();
      this.saveTattoos();
      this.saveUser();
      await setDoc(doc(db, 'system', 'interaction_reset_v2'), {
        completedAt: new Date().toISOString(),
        version: 2,
      });
      localStorage.setItem(TattooStoreService.INTERACTION_RESET_KEY, 'done');
    } catch (err) {
      console.warn('Old interaction cleanup skipped:', err);
    }
  }

  public async syncCommunityFromFirestore(): Promise<void> {
    try {
      const [tattooSnap, commentSnap, likeSnap] = await Promise.all([
        getDocs(collection(db, 'tattoos')),
        getDocs(collection(db, 'comments')),
        getDocs(collection(db, 'likes')),
      ]);
      const followSnap = await getDocs(collection(db, 'follows')).catch(() => null);

      const remoteTattoos = tattooSnap.docs.map((d) => d.data() as Tattoo);
      const merged = new Map<string, Tattoo>();
      this.tattoos.forEach((t) => merged.set(t.id, t));
      remoteTattoos.forEach((t) => merged.set(t.id, t));
      this.tattoos = Array.from(merged.values()).sort((a, b) => {
        const ad = new Date(a.createdAt).getTime() || 0;
        const bd = new Date(b.createdAt).getTime() || 0;
        return bd - ad;
      });
      this.saveTattoos();

      // Remote Firestore is the source of truth for interaction counts.
      this.comments = {};
      this.userLikes = {};
      this.tattoos.forEach((t) => {
        t.likesCount = 0;
        t.commentsCount = 0;
      });

      const remoteComments: Record<string, Comment[]> = {};
      commentSnap.docs.forEach((d) => {
        const value = d.data() as Comment;
        if (!remoteComments[value.tattooId]) remoteComments[value.tattooId] = [];
        remoteComments[value.tattooId].push(value);
      });
      Object.entries(remoteComments).forEach(([tattooId, values]) => {
        const local = this.comments[tattooId] || [];
        const byId = new Map<string, Comment>();
        local.forEach((x) => byId.set(x.id, x));
        values.forEach((x) => byId.set(x.id, x));
        this.comments[tattooId] = Array.from(byId.values()).sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt))
        );
        const tattoo = this.tattoos.find((t) => t.id === tattooId);
        if (tattoo) tattoo.commentsCount = this.comments[tattooId].length;
      });
      this.saveComments();
      this.saveTattoos();

      const remoteLikes: Record<string, Set<string>> = {};
      likeSnap.docs.forEach((d) => {
        const value = d.data() as { tattooId?: string; uid?: string };
        if (!value.tattooId || !value.uid) return;
        if (!remoteLikes[value.tattooId]) remoteLikes[value.tattooId] = new Set();
        remoteLikes[value.tattooId].add(value.uid);
      });
      Object.entries(remoteLikes).forEach(([tattooId, users]) => {
        this.userLikes[tattooId] = new Set([
          ...(this.userLikes[tattooId] ? Array.from(this.userLikes[tattooId]) : []),
          ...Array.from(users),
        ]);
        const tattoo = this.tattoos.find((t) => t.id === tattooId);
        if (tattoo) tattoo.likesCount = this.userLikes[tattooId].size;
      });
      this.saveLikes();

      if (followSnap) {
        this.followerCounts = {};
        const myFollows = new Set<string>();
        followSnap.docs.forEach((d) => {
          const value = d.data() as { uid?: string; handle?: string };
          if (!value.handle) return;
          this.followerCounts[value.handle] = (this.followerCounts[value.handle] || 0) + 1;
          if (value.uid === this.currentUser.uid) myFollows.add(value.handle);
        });
        this.follows = myFollows;
        this.currentUser.followingCount = this.follows.size;
        this.saveFollows();
        this.saveUser();
      }
    } catch (err) {
      console.warn('Community Firestore sync skipped:', err);
    }
  }

  /**
   * Sync user document to Firestore users/{uid}
   * Preserves and merges existing user profile customizations (bio, links, avatar, banner)
   */
  public async syncUserToFirestore(user: UserProfile): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const remote = snap.data() as Partial<UserProfile>;
        const merged: UserProfile = {
          ...user,
          ...remote,
          uid: user.uid,
          email: user.email || remote.email || '',
        };
        this.currentUser = merged;
        this.saveUser();
        await setDoc(userRef, {
          ...merged,
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
        return merged;
      } else {
        await setDoc(userRef, {
          ...user,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        }, { merge: true });
        return user;
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
      return user;
    }
  }

  /**
   * Real Google Authentication via Firebase Auth
   * With seamless fallback and designated mm2ultimatehub@gmail.com Admin detection
   */
  public async loginWithGoogle(manualUser?: Partial<UserProfile>): Promise<UserProfile> {
    // If manual test user provided
    if (manualUser && manualUser.email) {
      const isAdmin = isUserAdmin(manualUser.email);
      const user: UserProfile = {
        uid: manualUser.uid || 'user_google_' + Date.now(),
        displayName: manualUser.displayName || 'Google User',
        handle: manualUser.handle || ('@' + (manualUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_')),
        email: manualUser.email,
        photoURL: manualUser.photoURL || './images/users/avatar_inkedlife.jpg',
        bio: manualUser.bio || (isAdmin ? 'Tatto\'s World Master Admin' : 'Tattoo explorer & art devotee.'),
        instagram: manualUser.instagram || '',
        tiktok: manualUser.tiktok || '',
        discord: manualUser.discord || '',
        website: manualUser.website || '',
        isArtist: isAdmin ? true : (manualUser.isArtist || false),
        verified: isAdmin ? true : (manualUser.verified || false),
        role: isAdmin ? 'admin' : 'user',
        isAdmin,
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        savedTattooIds: ['tattoo_1', 'tattoo_2'],
      };

      this.currentUser = user;
      this.saveUser();
      this.setSessionActive(true);
      const synced = await this.syncUserToFirestore(user);
      this.syncNotificationsFromFirestore().catch(() => {});
      return synced;
    }

    try {
      // Attempt Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdmin = isUserAdmin(fbUser.email);

      const userProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Google User',
        handle: '@' + (fbUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || './images/users/avatar_inkedlife.jpg',
        bio: isAdmin ? 'Tatto\'s World Master Admin' : 'Tattoo lover and collector.',
        instagram: '',
        tiktok: '',
        discord: '',
        website: '',
        isArtist: isAdmin,
        verified: isAdmin,
        role: isAdmin ? 'admin' : 'user',
        isAdmin,
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        savedTattooIds: ['tattoo_1'],
      };

      this.currentUser = userProfile;
      this.saveUser();
      this.setSessionActive(true);
      const synced = await this.syncUserToFirestore(userProfile);
      this.syncNotificationsFromFirestore().catch(() => {});
      return synced;
    } catch (popupError: any) {
      console.warn('Firebase signInWithPopup failed:', popupError);
      // Never pretend a failed Google authentication succeeded.
      throw popupError;
    }
  }

  public loginAsGuest(): UserProfile {
    const guestUser: UserProfile = {
      uid: 'guest_' + Math.floor(Math.random() * 10000),
      displayName: 'Guest Explorer',
      handle: '@guest_' + Math.floor(Math.random() * 999),
      email: 'guest@tattosworld.community',
      photoURL: './images/users/avatar_inkedlife.jpg',
      bio: 'Browsing the art and stories of Tatto\'s World.',
      instagram: '',
      tiktok: '',
      discord: '',
      website: '',
      isArtist: false,
      verified: false,
      role: 'user',
      isAdmin: false,
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      savedTattooIds: [],
      customLinks: [],
    };
    this.currentUser = guestUser;
    this.saveUser();
    this.setSessionActive(true);
    this.syncUserToFirestore(this.currentUser).catch(() => {});
    return this.currentUser;
  }

  /**
   * Explicit sign out
   */
  public async logout(): Promise<void> {
    this.setSessionActive(false);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out note:', e);
    }
    // Reset user to default clean guest user
    this.currentUser = { ...INITIAL_USER };
    this.saveUser();
  }

  // ================= ADMIN & USER PRIVILEGES =================
  /**
   * Checks if current active user is verified Master Admin.
   * STRICT SECURITY: Only true if Firebase Auth actively confirms the admin's email.
   */
  public isCurrentUserAdmin(): boolean {
    const authEmail = auth.currentUser?.email;
    if (authEmail && isUserAdmin(authEmail)) {
      return true;
    }
    // Also check if currentUser holds an admin email AND matches the authenticated user
    if (this.currentUser?.email && isUserAdmin(this.currentUser.email) && authEmail?.toLowerCase() === this.currentUser.email.toLowerCase()) {
      return true;
    }
    return false;
  }

  /**
   * Everyone can delete their own shared tattoos.
   * Admin can delete ANY tattoo.
   */
  public deleteTattoo(tattooId: string, requester: UserProfile): boolean {
    const tattoo = this.tattoos.find(t => t.id === tattooId);
    if (!tattoo) return false;

    const isAdmin = Boolean(
      requester.isAdmin || requester.role === 'admin' || isUserAdmin(requester.email)
    );

    const isOwner =
      tattoo.creatorId === requester.uid ||
      tattoo.creatorHandle.toLowerCase() === requester.handle.toLowerCase();

    if (!isAdmin && !isOwner) {
      console.warn('Unauthorized: You can only delete your own tattoos.');
      return false;
    }

    this.tattoos = this.tattoos.filter(t => t.id !== tattooId);
    this.saveTattoos();

    // Clean comments & likes
    delete this.comments[tattooId];
    delete this.userLikes[tattooId];
    this.saveComments();
    this.saveLikes();

    // Firestore deletion
    try {
      deleteDoc(doc(db, 'tattoos', tattooId)).catch(() => {});
    } catch (e) {}

    return true;
  }

  /**
   * Admin: Delete ANY tattoo
   */
  public adminDeleteTattoo(tattooId: string): boolean {
    return this.deleteTattoo(tattooId, this.currentUser);
  }

  /**
   * Update current user profile (photoURL, bannerURL, displayName, bio, etc.)
   */
  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };
    this.saveUser();

    // Sync in Firestore
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      setDoc(userRef, this.currentUser, { merge: true }).catch(() => {});
    } catch (e) {}

    return this.currentUser;
  }

  /**
   * Admin: Update ANY tattoo
   */
  public adminUpdateTattoo(tattooId: string, updates: Partial<Tattoo>): Tattoo | null {
    if (!this.isCurrentUserAdmin()) return null;

    const index = this.tattoos.findIndex(t => t.id === tattooId);
    if (index === -1) return null;

    this.tattoos[index] = {
      ...this.tattoos[index],
      ...updates,
    };
    this.saveTattoos();

    try {
      updateDoc(doc(db, 'tattoos', tattooId), updates).catch(() => {});
    } catch (e) {}

    return this.tattoos[index];
  }

  /**
   * Admin: Toggle Featured flag
   */
  public adminToggleFeatured(tattooId: string): boolean {
    if (!this.isCurrentUserAdmin()) return false;
    const tattoo = this.tattoos.find(t => t.id === tattooId);
    if (!tattoo) return false;

    tattoo.isFeatured = !tattoo.isFeatured;
    this.saveTattoos();
    return tattoo.isFeatured;
  }

  /**
   * Admin: Delete ANY comment
   */
  public adminDeleteComment(tattooId: string, commentId: string): boolean {
    if (!this.isCurrentUserAdmin()) return false;
    return this.deleteComment(tattooId, commentId);
  }

  /**
   * Admin: Change user role or verification
   */
  public adminUpdateUser(uid: string, updates: Partial<UserProfile>): boolean {
    if (!this.isCurrentUserAdmin()) return false;

    if (this.currentUser.uid === uid) {
      this.currentUser = { ...this.currentUser, ...updates };
      this.saveUser();
    }
    return true;
  }

  // ================= NOTIFICATIONS =================
  public getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public async syncNotificationsFromFirestore(): Promise<void> {
    if (!auth.currentUser) return;
    try {
      const snap = await getDocs(query(collection(db, 'notifications'), where('recipientUid', '==', auth.currentUser.uid)));
      this.notifications = snap.docs
        .map((d) => d.data() as Notification)
        .filter((n) => n.recipientUid === auth.currentUser?.uid)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 100);
      this.saveNotifications();
      this.emitNotificationUpdate();
    } catch (err) {
      console.warn('Notification sync skipped:', err);
    }
  }

  public async markNotificationsRead(): Promise<void> {
    const unread = this.notifications.filter((n) => !n.read);
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.saveNotifications();
    this.emitNotificationUpdate();
    if (!auth.currentUser) return;
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})));
  }

  public async clearNotifications(): Promise<void> {
    const current = [...this.notifications];
    this.notifications = [];
    this.saveNotifications();
    this.emitNotificationUpdate();
    if (!auth.currentUser) return;
    await Promise.all(current.map((n) => deleteDoc(doc(db, 'notifications', n.id)).catch(() => {})));
  }

  private createNotification(
    recipientUid: string,
    type: Notification['type'],
    text: string,
    tattoo?: Tattoo
  ) {
    if (!auth.currentUser || !recipientUid || recipientUid === auth.currentUser.uid) return;
    const notification: Notification = {
      id: 'notification_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      recipientUid,
      senderUid: auth.currentUser.uid,
      senderName: this.currentUser.displayName,
      senderHandle: this.currentUser.handle,
      senderAvatar: this.currentUser.photoURL,
      type,
      tattooId: tattoo?.id,
      tattooTitle: tattoo?.title,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(notification);
    this.notifications = this.notifications.slice(0, 100);
    this.saveNotifications();
    setDoc(doc(db, 'notifications', notification.id), notification).catch(() => {});
    this.emitNotificationUpdate();
  }

  // ================= COMMUNITY & INTERACTION =================
  public async reportTattoo(tattooId: string, reason: string): Promise<boolean> {
    if (!auth.currentUser || !reason.trim()) return false;
    try {
      const reportId = 'report_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      await setDoc(doc(db, 'reports', reportId), {
        id: reportId,
        type: 'tattoo',
        targetId: tattooId,
        reporterUid: auth.currentUser.uid,
        reporterName: this.currentUser.displayName,
        reason: reason.trim().slice(0, 500),
        createdAt: new Date().toISOString(),
        status: 'open',
      });
      return true;
    } catch (err) {
      console.warn('Report submission failed:', err);
      return false;
    }
  }

  public isLiked(tattooId: string, uid?: string): boolean {
    const targetUid = uid || this.currentUser.uid;
    return this.userLikes[tattooId]?.has(targetUid) || false;
  }

  public toggleLike(tattooId: string): { isLiked: boolean; newCount: number } {
    const uid = this.currentUser.uid;
    if (!this.userLikes[tattooId]) {
      this.userLikes[tattooId] = new Set();
    }

    const set = this.userLikes[tattooId];
    let isLikedNow = false;

    if (set.has(uid)) {
      set.delete(uid);
      isLikedNow = false;
    } else {
      set.add(uid);
      isLikedNow = true;
    }

    const tattoo = this.tattoos.find(t => t.id === tattooId);
    if (tattoo) {
      tattoo.likesCount = Math.max(0, tattoo.likesCount + (isLikedNow ? 1 : -1));
      this.saveTattoos();
    }

    this.saveLikes();

    const likeRef = doc(db, 'likes', `${tattooId}_${uid}`);
    if (isLikedNow) {
      setDoc(likeRef, { tattooId, uid, createdAt: new Date().toISOString() }).catch(() => {});
    } else {
      deleteDoc(likeRef).catch(() => {});
    }

    if (isLikedNow && tattoo && tattoo.creatorId !== uid) {
      this.createNotification(tattoo.creatorId, 'like', `${this.currentUser.handle} gönderini beğendi.`, tattoo);
    }

    return {
      isLiked: isLikedNow,
      newCount: tattoo?.likesCount ?? set.size,
    };
  }

  public toggleSaveTattoo(tattooId: string): boolean {
    const saved = new Set(this.currentUser.savedTattooIds || []);
    let isSavedNow = false;
    if (saved.has(tattooId)) {
      saved.delete(tattooId);
      isSavedNow = false;
    } else {
      saved.add(tattooId);
      isSavedNow = true;
    }
    this.currentUser.savedTattooIds = Array.from(saved);
    this.saveUser();
    return isSavedNow;
  }

  public isSaved(tattooId: string): boolean {
    return this.currentUser.savedTattooIds?.includes(tattooId) || false;
  }

  public getComments(tattooId: string): Comment[] {
    return this.comments[tattooId] || [];
  }

  public addComment(tattooId: string, text: string): Comment {
    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      tattooId,
      userId: this.currentUser.uid,
      userName: this.currentUser.handle || this.currentUser.displayName,
      userHandle: this.currentUser.handle,
      userAvatar: this.currentUser.photoURL,
      text: text.trim(),
      createdAt: 'Az önce',
      likes: 0,
    };

    if (!this.comments[tattooId]) {
      this.comments[tattooId] = [];
    }
    this.comments[tattooId].unshift(newComment);

    const tattoo = this.tattoos.find(t => t.id === tattooId);
    if (tattoo) {
      tattoo.commentsCount += 1;
      this.saveTattoos();
    }

    this.saveComments();

    setDoc(doc(db, 'comments', newComment.id), newComment).catch(() => {});
    if (tattoo && tattoo.creatorId !== this.currentUser.uid) {
      this.createNotification(tattoo.creatorId, 'comment', `${this.currentUser.handle} gönderine yorum yaptı.`, tattoo);
    }
    return newComment;
  }

  public deleteComment(tattooId: string, commentId: string): boolean {
    if (!this.comments[tattooId]) return false;
    const initialLen = this.comments[tattooId].length;
    this.comments[tattooId] = this.comments[tattooId].filter(c => c.id !== commentId);

    if (this.comments[tattooId].length !== initialLen) {
      const tattoo = this.tattoos.find(t => t.id === tattooId);
      if (tattoo && tattoo.commentsCount > 0) {
        tattoo.commentsCount -= 1;
        this.saveTattoos();
      }
      this.saveComments();
      deleteDoc(doc(db, 'comments', commentId)).catch(() => {});
      return true;
    }
    return false;
  }

  public createTattoo(data: {
    title: string;
    category: CategoryId;
    categoryName: string;
    description: string;
    image: string;
    additionalImages?: string[];
    tags?: string[];
    socialLinks?: {
      instagram?: string;
      tiktok?: string;
      discord?: string;
      website?: string;
    };
  }): Tattoo {
    const newTattoo: Tattoo = {
      id: 'tattoo_' + Date.now(),
      title: data.title,
      category: data.category,
      categoryName: data.categoryName,
      description: data.description,
      image: data.image,
      additionalImages: data.additionalImages || [],
      creatorId: this.currentUser.uid,
      creatorName: this.currentUser.displayName,
      creatorHandle: this.currentUser.handle,
      creatorPhoto: this.currentUser.photoURL,
      creatorRole: this.isCurrentUserAdmin() ? 'Master Admin' : (this.currentUser.isArtist ? 'Sanatçı' : 'Koleksiyoner'),
      creatorVerified: this.currentUser.verified || this.isCurrentUserAdmin(),
      createdAt: new Date().toISOString().split('T')[0],
      likesCount: 0,
      commentsCount: 0,
      tags: data.tags || [data.categoryName],
      socialLinks: data.socialLinks || {
        instagram: this.currentUser.instagram,
        tiktok: this.currentUser.tiktok,
        discord: this.currentUser.discord,
        website: this.currentUser.website,
      }
    };

    this.tattoos.unshift(newTattoo);
    this.saveTattoos();

    // Firestore sync
    try {
      setDoc(doc(db, 'tattoos', newTattoo.id), newTattoo).catch(() => {});
    } catch (e) {}

    return newTattoo;
  }

  public isFollowing(handle: string): boolean {
    return this.follows.has(handle);
  }

  public toggleFollow(handle: string): boolean {
    let nowFollowing = false;
    if (this.follows.has(handle)) {
      this.follows.delete(handle);
      nowFollowing = false;
    } else {
      this.follows.add(handle);
      nowFollowing = true;
    }

    this.currentUser.followingCount = Math.max(0, this.follows.size);
    this.followerCounts[handle] = Math.max(
      0,
      (this.followerCounts[handle] || 0) + (nowFollowing ? 1 : -1)
    );
    this.saveFollows();
    this.saveUser();

    const followId = `${this.currentUser.uid}_${encodeURIComponent(handle)}`;
    const followRef = doc(db, 'follows', followId);
    if (nowFollowing) {
      setDoc(followRef, {
        uid: this.currentUser.uid,
        handle,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    } else {
      deleteDoc(followRef).catch(() => {});
    }

    if (nowFollowing) {
      const profile = this.getArtistProfile(handle);
      if (profile && profile.uid !== this.currentUser.uid) {
        this.createNotification(profile.uid, 'follow', `${this.currentUser.handle} seni takip etmeye başladı.`);
      }
    }

    return nowFollowing;
  }

  public getFollowerCount(handle: string): number {
    return this.followerCounts[handle] || 0;
  }

  public getFollowingCount(): number {
    return this.follows.size;
  }

  public getArtistProfile(handle: string): UserProfile | undefined {
    if (handle === this.currentUser.handle) {
      return { ...this.currentUser, followersCount: this.getFollowerCount(handle), followingCount: this.getFollowingCount() };
    }
    const found = INITIAL_ARTISTS.find(a => a.handle.toLowerCase() === handle.toLowerCase());
    if (found) {
      return { ...found, followersCount: this.getFollowerCount(found.handle), followingCount: this.getFollowingCount() };
    }

    // Community users who are not in the starter artist list still get a real profile
    // built from their published tattoo data instead of being shown as a generic artist.
    const userTattoo = this.tattoos.find(
      (t) => t.creatorHandle.toLowerCase() === handle.toLowerCase()
    );
    if (userTattoo) {
      return {
        uid: userTattoo.creatorId,
        displayName: userTattoo.creatorName,
        handle: userTattoo.creatorHandle,
        email: '',
        photoURL: userTattoo.creatorPhoto || './images/users/avatar_inkedlife.jpg',
        bio: 'Tattoos-World topluluk üyesi.',
        instagram: userTattoo.socialLinks?.instagram || '',
        tiktok: userTattoo.socialLinks?.tiktok || '',
        discord: userTattoo.socialLinks?.discord || '',
        website: userTattoo.socialLinks?.website || '',
        customLinks: [],
        isArtist: userTattoo.creatorRole.toLowerCase().includes('sanat') || userTattoo.creatorRole.toLowerCase().includes('artist'),
        verified: userTattoo.creatorVerified,
        role: userTattoo.creatorRole || 'user',
        isAdmin: false,
        followersCount: this.getFollowerCount(userTattoo.creatorHandle),
        followingCount: this.getFollowingCount(),
        createdAt: userTattoo.createdAt,
        savedTattooIds: [],
      };
    }

    return {
      uid: 'artist_' + handle.replace('@', ''),
      displayName: handle.replace('@', ''),
      handle,
      email: `${handle.replace('@', '')}@tattosworld.art`,
      photoURL: './images/users/avatar_inkedlife.jpg',
      bio: 'Tattoo Artist & Visionary Creator. Sharing unique body art on Tatto\'s World.',
      instagram: `https://instagram.com/${handle.replace('@', '')}`,
      tiktok: '',
      discord: `${handle.replace('@', '')}#1234`,
      website: '',
      isArtist: true,
      verified: true,
      role: 'artist',
      isAdmin: false,
      followersCount: this.getFollowerCount(handle),
      followingCount: this.getFollowingCount(),
      createdAt: '2025-01-01',
      savedTattooIds: [],
    };
  }
}

export const tattooStore = new TattooStoreService();
