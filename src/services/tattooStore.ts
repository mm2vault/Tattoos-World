import { Tattoo, Comment, UserProfile, CategoryId, Notification, Story } from '../types';
import { 
  auth, 
  googleProvider, 
  ADMIN_EMAIL, 
  isUserAdmin, 
  db 
} from './firebase';
import { signInWithPopup, signInWithRedirect, signInAnonymously, onAuthStateChanged, signOut as fbSignOut, linkWithPopup, linkWithRedirect } from 'firebase/auth';
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
  uid: 'guest_local',
  displayName: 'Guest Explorer',
  handle: '@guest_explorer',
  email: 'guest@tattosworld.community',
  photoURL: '',
  bio: 'Tattoos World topluluğunu keşfediyor.',
  instagram: '',
  tiktok: '',
  discord: '',
  website: '',
  customLinks: [],
  isArtist: false,
  verified: false,
  role: 'user',
  isAdmin: false,
  followersCount: 0,
  followingCount: 0,
  createdAt: new Date().toISOString().split('T')[0],
  savedTattooIds: [],
};

export const INITIAL_ARTISTS: UserProfile[] = [];

// No fake community tattoos are seeded. Real posts come from authenticated users.
export const INITIAL_TATTOOS: Tattoo[] = [];

class TattooStoreService {
  private tattoos: Tattoo[] = [];
  private comments: Record<string, Comment[]> = {};
  private userLikes: Record<string, Set<string>> = {};
  private currentUser: UserProfile = INITIAL_USER;
  private follows: Set<string> = new Set();
  private followerCounts: Record<string, number> = {};
  private followingCountsByUid: Record<string, number> = {};
  private notifications: Notification[] = [];
  private publicUserProfiles: Record<string, UserProfile> = {};
  private stories: Story[] = [];

  private static readonly INTERACTION_RESET_KEY = 'tattos_world_interactions_reset_v2';
  private static readonly SEED_CLEANUP_KEY = 'tattos_world_seed_cleanup_v3';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      this.cleanupLegacyDemoCache();
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
          const safeHandleBase = String(parsed.handle || parsed.email || 'tattoo_user')
            .replace(/^@+/, '')
            .split('@')[0]
            .replace(/[^a-zA-Z0-9._-]/g, '')
            .slice(0, 20) || 'tattoo_user';

          this.currentUser = {
            ...INITIAL_USER,
            ...parsed,
            displayName: parsed.displayName || INITIAL_USER.displayName,
            handle: parsed.handle || '@' + safeHandleBase,
            bio: typeof parsed.bio === 'string' ? parsed.bio : INITIAL_USER.bio,
            customLinks: Array.isArray(parsed.customLinks) ? parsed.customLinks : [],
            savedTattooIds: Array.isArray(parsed.savedTattooIds) ? parsed.savedTattooIds : [],
          };
        } catch {
          this.currentUser = { ...INITIAL_USER };
        }
      } else {
        this.currentUser = { ...INITIAL_USER };
        this.saveUser();
      }

      const storedStories = localStorage.getItem('tattos_world_stories_v1');
      if (storedStories) {
        const now = Date.now();
        this.stories = (JSON.parse(storedStories) as Story[]).filter((story) => new Date(story.expiresAt).getTime() > now);
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
              await this.cleanupLegacyDemoFirestore();
              await this.resetOldTestInteractions();
            }
            const isAdmin = isUserAdmin(fbUser.email);
            this.syncNotificationsFromFirestore().catch(() => {});
            try {
              const userRef = doc(db, 'users', fbUser.uid);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const remote = snap.data() as Partial<UserProfile>;
                // Some older user documents may be missing newer profile fields.
                // Only merge defined remote values and always keep safe defaults so
                // desktop sessions cannot crash the React tree with undefined handles.
                const remoteDefined = Object.fromEntries(
                  Object.entries(remote).filter(([, value]) => value !== undefined && value !== null)
                ) as Partial<UserProfile>;
                const localPhoto = this.currentUser.photoURL;
                const localBanner = this.currentUser.bannerURL;
                const remotePhoto = remoteDefined.photoURL;
                const remoteBanner = remoteDefined.bannerURL;
                const keepLocalPhoto = Boolean(localPhoto?.startsWith('data:image/'));
                const keepLocalBanner = Boolean(localBanner?.startsWith('data:image/'));
                const fallbackHandleBase = (fbUser.email || 'tattoo_user')
                  .split('@')[0]
                  .replace(/[^a-zA-Z0-9._-]/g, '')
                  .slice(0, 20) || 'tattoo_user';

                this.currentUser = {
                  ...INITIAL_USER,
                  ...this.currentUser,
                  ...remoteDefined,
                  uid: fbUser.uid,
                  email: fbUser.email || remoteDefined.email || this.currentUser.email || INITIAL_USER.email,
                  displayName: remoteDefined.displayName || this.currentUser.displayName || fbUser.displayName || INITIAL_USER.displayName,
                  handle: remoteDefined.handle || this.currentUser.handle || ('@' + fallbackHandleBase),
                  photoURL: keepLocalPhoto ? localPhoto : (remotePhoto || localPhoto || './images/users/avatar_inkedlife.jpg'),
                  bannerURL: keepLocalBanner ? localBanner : (remoteBanner || localBanner || ''),
                  isAdmin,
                  role: isAdmin ? 'admin' : (remoteDefined.role || this.currentUser.role || 'user'),
                  verified: isAdmin || Boolean(remoteDefined.verified || this.currentUser.verified),
                  savedTattooIds: Array.isArray(remoteDefined.savedTattooIds)
                    ? remoteDefined.savedTattooIds
                    : (this.currentUser.savedTattooIds || []),
                };
                this.saveUser();
                window.dispatchEvent(new Event('tattoos-world-user-updated'));
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
                window.dispatchEvent(new Event('tattoos-world-user-updated'));
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

  /** Remove the old demo tattoo/user documents from Firestore when an admin signs in. */
  private async cleanupLegacyDemoFirestore(): Promise<void> {
    if (!this.isCurrentUserAdmin()) return;
    try {
      const markerRef = doc(db, 'system', 'demo_cleanup_v3');
      const markerSnap = await getDoc(markerRef);
      if (markerSnap.exists()) return;

      const legacyTattooIds = new Set(['tattoo_1','tattoo_2','tattoo_3','tattoo_4','tattoo_5','tattoo_6','tattoo_7']);
      await Promise.all(Array.from(legacyTattooIds).map((id) => deleteDoc(doc(db, 'tattoos', id)).catch(() => {})));

      const usersSnap = await getDocs(collection(db, 'users'));
      const legacyUserIds = new Set(['artist_inkedlife','artist_luna','artist_darksoul']);
      await Promise.all(
        usersSnap.docs
          .filter((d) => legacyUserIds.has(d.id) || legacyUserIds.has(String(d.data()?.handle || '')))
          .map((d) => deleteDoc(d.ref).catch(() => {}))
      );

      await setDoc(markerRef, { completedAt: new Date().toISOString(), version: 3 });
    } catch (err) {
      console.warn('Legacy Firestore demo cleanup skipped:', err);
    }
  }

  /** Remove legacy demo users/tattoos from older builds without touching real user content. */
  private cleanupLegacyDemoCache() {
    try {
      if (localStorage.getItem(TattooStoreService.SEED_CLEANUP_KEY) === 'done') return;
      const legacyIds = new Set(['tattoo_1','tattoo_2','tattoo_3','tattoo_4','tattoo_5','tattoo_6','tattoo_7']);
      const legacyCreators = new Set(['artist_inkedlife','artist_luna','artist_darksoul','@inkedlife','@lunatattoos','@darksoul','@tattoartist','@blackink']);
      const stored = localStorage.getItem(STORAGE_KEYS.TATTOOS);
      if (stored) {
        const parsed = JSON.parse(stored) as Tattoo[];
        this.tattoos = parsed.filter((t) => !legacyIds.has(t.id) && !legacyCreators.has(t.creatorId) && !legacyCreators.has(t.creatorHandle));
        localStorage.setItem(STORAGE_KEYS.TATTOOS, JSON.stringify(this.tattoos));
      }
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const u = JSON.parse(storedUser) as UserProfile;
        if (u.handle === '@alexinked' || u.uid === 'user_default' || u.email === 'alex@tattosworld.community') {
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.FOLLOWS);
          localStorage.removeItem(STORAGE_KEYS.LIKES);
          localStorage.removeItem(STORAGE_KEYS.COMMENTS);
        }
      }
      localStorage.setItem(TattooStoreService.SEED_CLEANUP_KEY, 'done');
    } catch (err) {
      console.warn('Legacy demo cleanup skipped:', err);
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

  private saveStories() {
    try {
      localStorage.setItem('tattos_world_stories_v1', JSON.stringify(this.stories));
    } catch (e) {
      console.error('Error saving stories', e);
    }
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


  /** Update the current user's lightweight online/last-seen heartbeat. */
  public async touchLastSeen(): Promise<void> {
    const fbUser = auth.currentUser;
    if (!fbUser) return;

    const lastSeenAt = new Date().toISOString();
    this.currentUser = { ...this.currentUser, uid: fbUser.uid, lastSeenAt };
    this.saveUser();

    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        lastSeenAt,
      }, { merge: true });
      window.dispatchEvent(new Event('tattoos-world-user-updated'));
    } catch (err) {
      console.warn('Last-seen heartbeat skipped:', err);
    }
  }


  public getStories(): Story[] {
    const now = Date.now();
    this.stories = this.stories.filter((story) => new Date(story.expiresAt).getTime() > now);
    this.saveStories();
    return [...this.stories].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async syncStoriesFromFirestore(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'stories'));
      const now = Date.now();
      const remoteStories = snap.docs
        .map((d) => {
          const raw = d.data() as Partial<Story>;
          const expiresAt = String(raw.expiresAt || '');
          return {
            ...raw,
            id: String(raw.id || d.id),
            creatorId: String(raw.creatorId || ''),
            creatorName: String(raw.creatorName || 'Tattoo User'),
            creatorHandle: String(raw.creatorHandle || '@tattoo_user'),
            creatorPhoto: String(raw.creatorPhoto || './images/users/avatar_inkedlife.jpg'),
            mediaUrl: String(raw.mediaUrl || ''),
            mediaType: 'image' as const,
            text: typeof raw.text === 'string' ? raw.text : '',
            createdAt: String(raw.createdAt || new Date().toISOString()),
            expiresAt,
            viewedBy: Array.isArray(raw.viewedBy) ? raw.viewedBy.map(String) : [],
          } as Story;
        })
        .filter((story) => story.mediaUrl && new Date(story.expiresAt).getTime() > now);

      const merged = new Map<string, Story>();
      remoteStories.forEach((story) => merged.set(story.id, story));
      this.stories.forEach((story) => {
        if (new Date(story.expiresAt).getTime() > now && !merged.has(story.id)) {
          merged.set(story.id, story);
        }
      });
      this.stories = Array.from(merged.values())
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.saveStories();
    } catch (err) {
      console.warn('Story sync skipped:', err);
    }
  }

  public async createStory(mediaUrl: string, text?: string): Promise<Story> {
    if (!auth.currentUser) {
      throw new Error('Hikâye paylaşmak için giriş yapmalısın.');
    }
    if (!mediaUrl || mediaUrl.length > 820000) {
      throw new Error('Hikâye görseli çok büyük.');
    }

    const now = new Date();
    const story: Story = {
      id: 'story_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      creatorId: auth.currentUser.uid,
      creatorName: this.currentUser.displayName,
      creatorHandle: this.currentUser.handle,
      creatorPhoto: this.currentUser.photoURL,
      mediaUrl,
      mediaType: 'image',
      text: text?.trim().slice(0, 140) || '',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      viewedBy: [],
    };

    await setDoc(doc(db, 'stories', story.id), story);
    this.stories.push(story);
    this.saveStories();
    return story;
  }

  public async viewStory(storyId: string): Promise<void> {
    const uid = auth.currentUser?.uid || this.currentUser.uid;
    if (!uid) return;

    const index = this.stories.findIndex((item) => item.id === storyId);
    if (index < 0) return;
    if (this.stories[index].viewedBy.includes(uid)) return;

    this.stories[index] = {
      ...this.stories[index],
      viewedBy: [...this.stories[index].viewedBy, uid],
    };
    this.saveStories();

    await updateDoc(doc(db, 'stories', storyId), {
      viewedBy: this.stories[index].viewedBy,
    }).catch(() => {});
  }

  public async deleteStory(storyId: string): Promise<boolean> {
    const story = this.stories.find((item) => item.id === storyId);
    if (!story) return false;
    if (!this.isCurrentUserAdmin() && story.creatorId !== this.currentUser.uid && story.creatorId !== auth.currentUser?.uid) {
      return false;
    }

    this.stories = this.stories.filter((item) => item.id !== storyId);
    this.saveStories();
    await deleteDoc(doc(db, 'stories', storyId)).catch(() => {});
    return true;
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

      // Never wipe all interaction collections. Only remove records that can
      // be positively identified as belonging to the old demo dataset.
      const legacyTattooIds = new Set([
        'tattoo_1', 'tattoo_2', 'tattoo_3', 'tattoo_4',
        'tattoo_5', 'tattoo_6', 'tattoo_7',
      ]);
      const legacyUserIds = new Set([
        'artist_inkedlife', 'artist_luna', 'artist_darksoul',
      ]);
      const legacyHandles = new Set([
        '@inkedlife', '@lunatattoos', '@darksoul',
        '@tattoartist', '@blackink',
      ]);

      const [commentSnap, likeSnap, followSnap] = await Promise.all([
        getDocs(collection(db, 'comments')),
        getDocs(collection(db, 'likes')),
        getDocs(collection(db, 'follows')),
      ]);

      await Promise.all([
        ...commentSnap.docs
          .filter((d) => {
            const value = d.data() as { tattooId?: string; userId?: string };
            return legacyTattooIds.has(String(value.tattooId || '')) ||
              legacyUserIds.has(String(value.userId || ''));
          })
          .map((d) => deleteDoc(d.ref)),
        ...likeSnap.docs
          .filter((d) => {
            const value = d.data() as { tattooId?: string; uid?: string };
            return legacyTattooIds.has(String(value.tattooId || '')) ||
              legacyUserIds.has(String(value.uid || ''));
          })
          .map((d) => deleteDoc(d.ref)),
        ...followSnap.docs
          .filter((d) => {
            const value = d.data() as { uid?: string; handle?: string };
            return legacyUserIds.has(String(value.uid || '')) ||
              legacyHandles.has(String(value.handle || '').toLowerCase());
          })
          .map((d) => deleteDoc(d.ref)),
      ]);

      await setDoc(doc(db, 'system', 'interaction_reset_v2'), {
        completedAt: new Date().toISOString(),
        version: 3,
        scope: 'legacy-demo-only',
      });
      localStorage.setItem(TattooStoreService.INTERACTION_RESET_KEY, 'done');
    } catch (err) {
      console.warn('Legacy interaction cleanup skipped:', err);
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

      const legacyIds = new Set(['tattoo_1','tattoo_2','tattoo_3','tattoo_4','tattoo_5','tattoo_6','tattoo_7']);
      const legacyCreators = new Set(['artist_inkedlife','artist_luna','artist_darksoul','@inkedlife','@lunatattoos','@darksoul','@tattoartist','@blackink']);
      const remoteTattoos = tattooSnap.docs
        .map((d) => {
          const raw = d.data() as Partial<Tattoo>;
          const safeHandle = String(raw.creatorHandle || '@unknown').startsWith('@')
            ? String(raw.creatorHandle || '@unknown')
            : '@' + String(raw.creatorHandle || 'unknown');

          return {
            ...raw,
            id: String(raw.id || d.id),
            title: String(raw.title || 'Untitled Tattoo'),
            category: String(raw.category || 'all'),
            categoryName: String(raw.categoryName || 'Tattoo'),
            description: String(raw.description || ''),
            image: String(raw.image || ''),
            additionalImages: Array.isArray(raw.additionalImages) ? raw.additionalImages.filter((v) => typeof v === 'string') : [],
            creatorId: String(raw.creatorId || ''),
            creatorName: String(raw.creatorName || 'Tattoo Artist'),
            creatorHandle: safeHandle,
            creatorPhoto: String(raw.creatorPhoto || './images/users/avatar_inkedlife.jpg'),
            creatorRole: String(raw.creatorRole || 'Koleksiyoner'),
            creatorVerified: Boolean(raw.creatorVerified),
            creatorProfilePublic: raw.creatorProfilePublic !== false,
            createdAt: String(raw.createdAt || new Date().toISOString()),
            likesCount: Number.isFinite(Number(raw.likesCount)) ? Math.max(0, Number(raw.likesCount)) : 0,
            commentsCount: Number.isFinite(Number(raw.commentsCount)) ? Math.max(0, Number(raw.commentsCount)) : 0,
            tags: Array.isArray(raw.tags)
              ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean)
              : [],
          } as Tattoo;
        })
        .filter((t) => !legacyIds.has(t.id) && !legacyCreators.has(t.creatorId) && !legacyCreators.has(t.creatorHandle));
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
        this.followingCountsByUid = {};
        const myFollows = new Set<string>();
        followSnap.docs.forEach((d) => {
          const value = d.data() as { uid?: string; handle?: string };
          if (!value.handle) return;
          const key = value.handle.trim().toLowerCase();
          this.followerCounts[key] = (this.followerCounts[key] || 0) + 1;
          if (value.uid) {
            this.followingCountsByUid[value.uid] = (this.followingCountsByUid[value.uid] || 0) + 1;
          }
          if (value.uid === this.currentUser.uid) myFollows.add(key);
        });
        this.follows = myFollows;
        this.currentUser.followingCount = this.follows.size;
        this.saveFollows();
        this.saveUser();
      }

      window.dispatchEvent(new Event('tattoos-world-community-updated'));
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
        savedTattooIds: [],
        customLinks: Array.isArray(manualUser.customLinks) ? manualUser.customLinks : [],
      };

      this.currentUser = user;
      this.saveUser();
      this.setSessionActive(true);
      const synced = await this.syncUserToFirestore(user);
      this.syncNotificationsFromFirestore().catch(() => {});
      return synced;
    }

    try {
      // Upgrade the current anonymous account in-place when possible.
      // This preserves the Firebase UID, so messages and other data stay synced
      // across devices after the user signs into the same Google account.
      if (auth.currentUser?.isAnonymous) {
        try {
          const result = await linkWithPopup(auth.currentUser, googleProvider);
          const fbUser = result.user;
          const isAdmin = isUserAdmin(fbUser.email);

          const userProfile: UserProfile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || this.currentUser.displayName || 'Google User',
            handle: this.currentUser.handle || '@google_user',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || this.currentUser.photoURL || './images/users/avatar_inkedlife.jpg',
            bio: this.currentUser.bio || (isAdmin ? 'Tatto\'s World Master Admin' : 'Tattoo lover and collector.'),
            instagram: this.currentUser.instagram || '',
            tiktok: this.currentUser.tiktok || '',
            discord: this.currentUser.discord || '',
            website: this.currentUser.website || '',
            isArtist: isAdmin || Boolean(this.currentUser.isArtist),
            verified: isAdmin || Boolean(this.currentUser.verified),
            role: isAdmin ? 'admin' : (this.currentUser.role || 'user'),
            isAdmin,
            followersCount: this.currentUser.followersCount || 0,
            followingCount: this.currentUser.followingCount || 0,
            createdAt: this.currentUser.createdAt || new Date().toISOString().split('T')[0],
            savedTattooIds: Array.isArray(this.currentUser.savedTattooIds) ? this.currentUser.savedTattooIds : [],
            customLinks: Array.isArray(this.currentUser.customLinks) ? this.currentUser.customLinks : [],
          };

          this.currentUser = userProfile;
          this.saveUser();
          this.setSessionActive(true);
          const synced = await this.syncUserToFirestore(userProfile);
          this.syncNotificationsFromFirestore().catch(() => {});
          return synced;
        } catch (linkError: any) {
          const linkCode = String(linkError?.code || '');
          if (linkCode !== 'auth/credential-already-in-use' && linkCode !== 'auth/provider-already-linked') {
            const redirectEligible = [
              'auth/popup-blocked',
              'auth/popup-timeout',
              'auth/operation-not-supported-in-this-environment',
            ].includes(linkCode);

            if (redirectEligible) {
              localStorage.setItem('tattos_world_has_entered', 'true');
              this.setSessionActive(true);
              try {
                await linkWithRedirect(auth.currentUser!, googleProvider);
                return this.currentUser;
              } catch (redirectError) {
                console.warn('Firebase anonymous Google link redirect failed:', redirectError);
              }
            } else {
              console.warn('Firebase anonymous Google link failed:', linkError);
            }
          }
          // If the Google credential already belongs to a permanent account,
          // fall through to the normal sign-in path below.
        }
      }

      // Normal Google sign-in for an existing permanent account.
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
        savedTattooIds: [],
        customLinks: [],
      };

      this.currentUser = userProfile;
      this.saveUser();
      this.setSessionActive(true);
      const synced = await this.syncUserToFirestore(userProfile);
      this.syncNotificationsFromFirestore().catch(() => {});
      return synced;
    } catch (popupError: any) {
      console.warn('Firebase signInWithPopup failed:', popupError);

      const redirectEligible = [
        'auth/popup-blocked',
        'auth/popup-timeout',
        'auth/operation-not-supported-in-this-environment',
      ].includes(String(popupError?.code || ''));

      if (redirectEligible) {
        try {
          localStorage.setItem('tattos_world_has_entered', 'true');
          this.setSessionActive(true);
          await signInWithRedirect(auth, googleProvider);
          return this.currentUser;
        } catch (redirectError) {
          console.warn('Firebase signInWithRedirect failed:', redirectError);
        }
      }

      throw popupError;
    }
  }

  public async loginAsGuest(): Promise<UserProfile> {
    let firebaseUid = auth.currentUser?.uid || '';
    if (!auth.currentUser) {
      try {
        const result = await signInAnonymously(auth);
        firebaseUid = result.user.uid;
      } catch (err) {
        console.warn('Anonymous auth unavailable; using local guest mode:', err);
      }
    }

    const guestUser: UserProfile = {
      uid: firebaseUid || ('guest_' + Math.floor(Math.random() * 10000)),
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

    // Firestore deletion + cleanup of orphaned comments/likes.
    try {
      deleteDoc(doc(db, 'tattoos', tattooId)).catch(() => {});

      Promise.all([
        getDocs(query(collection(db, 'comments'), where('tattooId', '==', tattooId))),
        getDocs(query(collection(db, 'likes'), where('tattooId', '==', tattooId))),
      ]).then(([commentSnap, likeSnap]) => {
        return Promise.all([
          ...commentSnap.docs.map((item) => deleteDoc(item.ref)),
          ...likeSnap.docs.map((item) => deleteDoc(item.ref)),
        ]);
      }).catch(() => {});
    } catch (e) {}

    window.dispatchEvent(new Event('tattoos-world-community-updated'));
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
    const previousHandle = this.currentUser.handle;
    const nextHandle = updates.handle || previousHandle;
    const handleChanged = Boolean(nextHandle && previousHandle && nextHandle.toLowerCase() !== previousHandle.toLowerCase());
    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };
    this.saveUser();

    // Keep existing posts in sync with the owner's updated profile.
    const ownTattoos = this.tattoos.filter(
      (tattoo) =>
        tattoo.creatorId === this.currentUser.uid ||
        tattoo.creatorHandle.toLowerCase() === this.currentUser.handle.toLowerCase()
    );

    ownTattoos.forEach((tattoo) => {
      tattoo.creatorName = this.currentUser.displayName;
      tattoo.creatorHandle = this.currentUser.handle;
      tattoo.creatorPhoto = this.currentUser.photoURL;
      tattoo.creatorVerified = this.currentUser.verified || this.isCurrentUserAdmin();
      tattoo.creatorRole = this.isCurrentUserAdmin()
        ? 'Master Admin'
        : (this.currentUser.isArtist ? 'Sanatçı' : 'Koleksiyoner');
      tattoo.creatorProfilePublic = this.currentUser.profilePublic !== false;

      updateDoc(doc(db, 'tattoos', tattoo.id), {
        creatorName: tattoo.creatorName,
        creatorHandle: tattoo.creatorHandle,
        creatorPhoto: tattoo.creatorPhoto,
        creatorVerified: tattoo.creatorVerified,
        creatorRole: tattoo.creatorRole,
        creatorProfilePublic: tattoo.creatorProfilePublic,
      }).catch(() => {});
    });
    this.saveTattoos();

    // Keep incoming follower records attached when a user changes their @handle.
    // Follow documents store the target handle, so old records must be migrated.
    if (handleChanged && auth.currentUser) {
      const oldKey = previousHandle.trim().toLowerCase();
      const newKey = nextHandle.trim().toLowerCase();
      const oldCount = this.followerCounts[oldKey] || 0;
      this.followerCounts[newKey] = oldCount;
      delete this.followerCounts[oldKey];
      getDocs(query(collection(db, 'follows'), where('handle', '==', oldKey)))
        .then((snap) => Promise.all(snap.docs.map((item) => updateDoc(item.ref, { handle: newKey }))))
        .catch(() => {});
    }

    // Sync in Firestore
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      setDoc(userRef, this.currentUser, { merge: true }).catch(() => {});
    } catch (e) {}

    window.dispatchEvent(new Event('tattoos-world-user-updated'));
    window.dispatchEvent(new Event('tattoos-world-community-updated'));
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
    updateDoc(doc(db, 'tattoos', tattooId), { isFeatured: tattoo.isFeatured }).catch(() => {});
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
    if (!this.isCurrentUserAdmin() || !uid) return false;

    if (this.currentUser.uid === uid) {
      this.currentUser = { ...this.currentUser, ...updates };
      this.saveUser();
    }

    this.tattoos
      .filter((tattoo) => tattoo.creatorId === uid)
      .forEach((tattoo) => {
        if (updates.displayName) tattoo.creatorName = updates.displayName;
        if (updates.handle) tattoo.creatorHandle = updates.handle;
        if (updates.photoURL) tattoo.creatorPhoto = updates.photoURL;
        if (typeof updates.verified === 'boolean') tattoo.creatorVerified = updates.verified;
        if (typeof updates.isArtist === 'boolean') tattoo.creatorRole = updates.isArtist ? 'Sanatçı' : 'Koleksiyoner';

        updateDoc(doc(db, 'tattoos', tattoo.id), {
          ...(updates.displayName ? { creatorName: tattoo.creatorName } : {}),
          ...(updates.handle ? { creatorHandle: tattoo.creatorHandle } : {}),
          ...(updates.photoURL ? { creatorPhoto: tattoo.creatorPhoto } : {}),
          ...(typeof updates.verified === 'boolean' ? { creatorVerified: tattoo.creatorVerified } : {}),
          ...(typeof updates.isArtist === 'boolean' ? { creatorRole: tattoo.creatorRole } : {}),
        }).catch(() => {});
      });
    this.saveTattoos();

    setDoc(doc(db, 'users', uid), updates, { merge: true }).catch((err) => {
      console.warn('Admin user update failed:', err);
    });

    window.dispatchEvent(new Event('tattoos-world-community-updated'));
    return true;
  }

  public async getReports(): Promise<Array<{
    id: string;
    type: string;
    targetId: string;
    reporterUid: string;
    reporterName: string;
    reason: string;
    createdAt: string;
    status: 'open' | 'reviewed' | 'resolved';
  }>> {
    if (!this.isCurrentUserAdmin()) return [];
    try {
      const snap = await getDocs(collection(db, 'reports'));
      return snap.docs
        .map((item) => item.data() as any)
        .filter((report) => Boolean(report?.id))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    } catch (err) {
      console.warn('Admin reports could not be loaded:', err);
      return [];
    }
  }

  public async updateReportStatus(reportId: string, status: 'open' | 'reviewed' | 'resolved'): Promise<boolean> {
    if (!this.isCurrentUserAdmin() || !reportId) return false;
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: this.currentUser.uid,
      });
      return true;
    } catch (err) {
      console.warn('Admin report status update failed:', err);
      return false;
    }
  }

  public async getAllUsers(): Promise<UserProfile[]> {
    if (!this.isCurrentUserAdmin()) return [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs
        .map((item) => item.data() as UserProfile)
        .filter((user) => Boolean(user?.uid))
        .sort((a, b) => String(a.displayName || '').localeCompare(String(b.displayName || '')));
    } catch (err) {
      console.warn('Admin user list could not be loaded:', err);
      return [];
    }
  }

  // ================= NOTIFICATIONS =================
  public getNotifications(): Notification[] {
    return [...this.notifications]
      .filter((notification) => this.isNotificationVisible(notification.type))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter(
      (notification) => !notification.read && this.isNotificationVisible(notification.type)
    ).length;
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

  public async markNotificationRead(notificationId: string): Promise<void> {
    const target = this.notifications.find((n) => n.id === notificationId);
    if (!target || target.read) return;

    this.notifications = this.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications();
    this.emitNotificationUpdate();

    if (auth.currentUser) {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true }).catch(() => {});
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

  private isNotificationVisible(type: Notification['type']): boolean {
    try {
      const settings = JSON.parse(localStorage.getItem('tattos_world_settings_v1') || '{}');
      if (type === 'like') return settings.notifyLikes !== false;
      if (type === 'comment') return settings.notifyComments !== false;
      if (type === 'follow' || type === 'new_post') return settings.notifyArtists !== false;
      if (type === 'message') return settings.notifyMessages !== false;
      return true;
    } catch {
      return true;
    }
  }

  public notifyMessage(recipientUid: string, text: string) {
    this.createNotification(recipientUid, 'message', text);
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
      senderName: String(this.currentUser.displayName || 'Kullanıcı'),
      senderHandle: String(this.currentUser.handle || '@kullanici'),
      senderAvatar: String(this.currentUser.photoURL || ''),
      type,
      text,
      createdAt: new Date().toISOString(),
      read: false,
      ...(tattoo?.id ? { tattooId: tattoo.id } : {}),
      ...(tattoo?.title ? { tattooTitle: tattoo.title } : {}),
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

    if (tattoo) {
      updateDoc(doc(db, 'tattoos', tattooId), {
        likesCount: tattoo.likesCount,
      }).catch(() => {});
    }

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

    if (auth.currentUser) {
      setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { savedTattooIds: this.currentUser.savedTattooIds },
        { merge: true }
      ).catch(() => {});
    }

    return isSavedNow;
  }

  public getSavedCollections(): import('../types').SavedCollection[] {
    const raw = this.currentUser.settings?.savedCollections;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item: any) => item && item.id && item.name)
      .map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
        tattooIds: Array.isArray(item.tattooIds) ? item.tattooIds.map(String) : [],
        createdAt: String(item.createdAt || ''),
      }));
  }

  private persistSavedCollections(collections: import('../types').SavedCollection[]): void {
    this.currentUser.settings = {
      ...(this.currentUser.settings || {}),
      savedCollections: collections,
    };
    this.saveUser();

    if (auth.currentUser) {
      setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { settings: this.currentUser.settings },
        { merge: true }
      ).catch(() => {});
    }

    window.dispatchEvent(new Event('tattoos-world-user-updated'));
  }

  public createSavedCollection(name: string): import('../types').SavedCollection | null {
    const cleanName = String(name || '').trim().slice(0, 40);
    if (!cleanName) return null;

    const collections = this.getSavedCollections();
    if (collections.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
      return null;
    }

    const collection: import('../types').SavedCollection = {
      id: 'saved_collection_' + Date.now(),
      name: cleanName,
      tattooIds: [],
      createdAt: new Date().toISOString(),
    };

    this.persistSavedCollections([...collections, collection]);
    return collection;
  }

  public deleteSavedCollection(collectionId: string): boolean {
    const collections = this.getSavedCollections();
    const next = collections.filter((item) => item.id !== collectionId);
    if (next.length === collections.length) return false;
    this.persistSavedCollections(next);
    return true;
  }

  public addTattooToSavedCollection(collectionId: string, tattooId: string): boolean {
    if (!collectionId || !tattooId) return false;
    const collections = this.getSavedCollections();
    let changed = false;
    const next = collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      if (collection.tattooIds.includes(tattooId)) return collection;
      changed = true;
      return { ...collection, tattooIds: [...collection.tattooIds, tattooId] };
    });
    if (!changed) return true;

    // Being inside a collection also means the tattoo is saved globally.
    if (!this.isSaved(tattooId)) {
      this.currentUser.savedTattooIds = Array.from(new Set([...(this.currentUser.savedTattooIds || []), tattooId]));
      this.saveUser();
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          savedTattooIds: this.currentUser.savedTattooIds,
        }, { merge: true }).catch(() => {});
      }
    }

    this.persistSavedCollections(next);
    return true;
  }

  public removeTattooFromSavedCollection(collectionId: string, tattooId: string): boolean {
    const collections = this.getSavedCollections();
    let changed = false;
    const next = collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      if (!collection.tattooIds.includes(tattooId)) return collection;
      changed = true;
      return { ...collection, tattooIds: collection.tattooIds.filter((id) => id !== tattooId) };
    });
    if (!changed) return false;
    this.persistSavedCollections(next);
    return true;
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
      createdAt: new Date().toISOString(),
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
      creatorProfilePublic: this.currentUser.profilePublic !== false,
      createdAt: new Date().toISOString(),
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

      // Notify followers when the creator publishes a new tattoo, respecting their
      // "Takip Edilen Sanatçılar" notification preference.
      getDocs(query(collection(db, 'follows'), where('handle', '==', this.currentUser.handle)))
        .then((snap) => {
          snap.docs.forEach((item) => {
            const followerUid = String(item.data().uid || '');
            if (followerUid && followerUid !== this.currentUser.uid) {
              this.createNotification(
                followerUid,
                'new_post',
                `${this.currentUser.handle} yeni bir dövme paylaştı.`,
                newTattoo
              );
            }
          });
        })
        .catch(() => {});
    } catch (e) {}

    return newTattoo;
  }

  public isFollowing(handle: string): boolean {
    return this.follows.has(handle.trim().toLowerCase());
  }

  public toggleFollow(handle: string): boolean {
    const key = handle.trim().toLowerCase();
    let nowFollowing = false;
    if (this.follows.has(key)) {
      this.follows.delete(key);
      nowFollowing = false;
    } else {
      this.follows.add(key);
      nowFollowing = true;
    }

    this.currentUser.followingCount = Math.max(0, this.follows.size);
    this.followerCounts[key] = Math.max(
      0,
      (this.followerCounts[key] || 0) + (nowFollowing ? 1 : -1)
    );
    this.saveFollows();
    this.saveUser();

    const followId = `${this.currentUser.uid}_${encodeURIComponent(key)}`;
    const followRef = doc(db, 'follows', followId);
    if (nowFollowing) {
      setDoc(followRef, {
        uid: this.currentUser.uid,
        handle: key,
        followerName: this.currentUser.displayName,
        followerPhoto: this.currentUser.photoURL,
        followerVerified: this.currentUser.verified,
        followerRole: this.currentUser.role,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
      this.followingCountsByUid[this.currentUser.uid] = this.follows.size;
    } else {
      deleteDoc(followRef).catch(() => {});
      this.followingCountsByUid[this.currentUser.uid] = this.follows.size;
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
    return this.followerCounts[handle.trim().toLowerCase()] || 0;
  }

  public getFollowingCount(): number {
    return this.follows.size;
  }

  public getProfileFollowingCount(handle: string): number {
    const key = String(handle || '').trim().toLowerCase();
    if (!key) return 0;

    // Do not call getArtistProfile() here: getArtistProfile() itself uses this
    // method to build cached/public profiles. Doing so creates an infinite loop
    // and produces "Maximum call stack size exceeded" on public user profiles.
    if (key === String(this.currentUser.handle || '').trim().toLowerCase()) {
      return this.follows.size;
    }

    const cachedPublic = this.publicUserProfiles[key];
    if (cachedPublic?.uid) {
      return this.followingCountsByUid[cachedPublic.uid] || 0;
    }

    const starterProfile = INITIAL_ARTISTS.find(
      (artist) => String(artist.handle || '').trim().toLowerCase() === key
    );
    if (starterProfile?.uid) {
      return this.followingCountsByUid[starterProfile.uid] || 0;
    }

    const userTattoo = this.tattoos.find(
      (tattoo) => String(tattoo.creatorHandle || '').trim().toLowerCase() === key
    );
    if (userTattoo?.creatorId) {
      if (userTattoo.creatorId === this.currentUser.uid) return this.follows.size;
      return this.followingCountsByUid[userTattoo.creatorId] || 0;
    }

    return 0;
  }

  /**
   * Search real public users, including users who have never published a tattoo.
   * Results are cached so App can open the profile synchronously after a result is clicked.
   */
  public async searchPublicUsers(searchTerm: string): Promise<UserProfile[]> {
    const queryText = String(searchTerm || '').trim().toLowerCase().replace(/^@/, '');
    if (!queryText || !auth.currentUser) return [];

    try {
      const snap = await getDocs(collection(db, 'users'));
      const results: UserProfile[] = [];

      snap.docs.forEach((item) => {
        const raw = item.data() as Partial<UserProfile>;
        if (raw.profilePublic === false) return;

        const uid = String(raw.uid || item.id);
        const handle = String(raw.handle || '').trim();
        const name = String(raw.displayName || '').trim();
        if (!handle && !name) return;

        const handleMatch = handle.toLowerCase().replace(/^@/, '').includes(queryText);
        const nameMatch = name.toLowerCase().includes(queryText);
        if (!handleMatch && !nameMatch) return;

        const safeHandle = handle || '@user_' + uid.slice(0, 10);
        const profile: UserProfile = {
          ...INITIAL_USER,
          ...raw,
          uid,
          displayName: name || safeHandle,
          handle: safeHandle,
          email: String(raw.email || ''),
          photoURL: String(raw.photoURL || './images/users/avatar_inkedlife.jpg'),
          bio: String(raw.bio || ''),
          instagram: String(raw.instagram || ''),
          tiktok: String(raw.tiktok || ''),
          discord: String(raw.discord || ''),
          website: String(raw.website || ''),
          customLinks: Array.isArray(raw.customLinks) ? raw.customLinks : [],
          savedTattooIds: Array.isArray(raw.savedTattooIds) ? raw.savedTattooIds : [],
          isArtist: Boolean(raw.isArtist),
          verified: Boolean(raw.verified),
          role: String(raw.role || (raw.isArtist ? 'artist' : 'user')),
          isAdmin: false,
          followersCount: this.getFollowerCount(safeHandle),
          followingCount: this.followingCountsByUid[uid] || 0,
        };

        this.publicUserProfiles[safeHandle.toLowerCase()] = profile;
        results.push(profile);
      });

      return results
        .filter((profile) => profile.uid !== this.currentUser.uid)
        .sort((a, b) => {
          const ah = a.handle.toLowerCase().replace(/^@/, '');
          const bh = b.handle.toLowerCase().replace(/^@/, '');
          return ah.localeCompare(bh);
        })
        .slice(0, 20);
    } catch (err) {
      console.warn('Public user search skipped:', err);
      return [];
    }
  }

  public async getFollowerProfiles(handle: string): Promise<UserProfile[]> {
    const key = handle.trim().toLowerCase();
    if (!key || !auth.currentUser) return [];
    try {
      const snap = await getDocs(query(collection(db, 'follows'), where('handle', '==', key)));
      const profiles = await Promise.all(
        snap.docs.map(async (item) => {
          const value = item.data() as {
            uid?: string;
            followerName?: string;
            followerPhoto?: string;
            followerVerified?: boolean;
            followerRole?: string;
          };
          const uid = String(value.uid || '');
          if (!uid) return null;

          // Prefer the real users/{uid} profile so a follower without tattoos
          // still has the correct @handle, name and links.
          try {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              const user = userSnap.data() as Partial<UserProfile>;
              const safeHandle = String(user.handle || '@' + uid.slice(0, 12));
              return {
                ...INITIAL_USER,
                ...user,
                uid,
                displayName: String(user.displayName || value.followerName || '@user'),
                handle: safeHandle,
                email: String(user.email || ''),
                photoURL: String(user.photoURL || value.followerPhoto || './images/users/avatar_inkedlife.jpg'),
                customLinks: Array.isArray(user.customLinks) ? user.customLinks : [],
                savedTattooIds: Array.isArray(user.savedTattooIds) ? user.savedTattooIds : [],
                followersCount: this.getFollowerCount(safeHandle),
                followingCount: this.followingCountsByUid[uid] || 0,
              } as UserProfile;
            }
          } catch {
            // Fall back to the follow snapshot below.
          }

          const fromTattoo = this.tattoos.find((tattoo) => tattoo.creatorId === uid);
          return {
            uid,
            displayName: value.followerName || fromTattoo?.creatorName || '@user',
            handle: fromTattoo?.creatorHandle || '@' + uid.slice(0, 12),
            email: '',
            photoURL: value.followerPhoto || fromTattoo?.creatorPhoto || './images/users/avatar_inkedlife.jpg',
            bio: '',
            instagram: fromTattoo?.socialLinks?.instagram || '',
            tiktok: fromTattoo?.socialLinks?.tiktok || '',
            discord: fromTattoo?.socialLinks?.discord || '',
            website: fromTattoo?.socialLinks?.website || '',
            customLinks: [],
            isArtist: value.followerRole === 'artist' || fromTattoo?.creatorRole === 'artist',
            verified: Boolean(value.followerVerified || fromTattoo?.creatorVerified),
            role: value.followerRole || fromTattoo?.creatorRole || 'user',
            isAdmin: false,
            followersCount: fromTattoo ? this.getFollowerCount(fromTattoo.creatorHandle) : 0,
            followingCount: this.followingCountsByUid[uid] || 0,
            createdAt: '',
            savedTattooIds: [],
          } as UserProfile;
        })
      );

      const seen = new Set<string>();
      return profiles
        .filter((profile): profile is UserProfile => Boolean(profile))
        .filter((profile) => {
          const key = profile.uid || profile.handle.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
    } catch {
      return [];
    }
  }

  public async getFollowingProfiles(uid: string): Promise<UserProfile[]> {
    if (!auth.currentUser) return [];
    try {
      const snap = await getDocs(query(collection(db, 'follows'), where('uid', '==', uid)));
      const profiles = await Promise.all(
        snap.docs.map(async (item) => {
          const value = item.data() as { handle?: string };
          const handle = String(value.handle || '').trim();
          if (!handle) return null;

          const local = this.getArtistProfile(handle);
          if (local) return local;

          // A user may follow someone who has never posted a tattoo.
          // Resolve that target from the real users collection instead of
          // dropping them from the list.
          try {
            const userSnap = await getDocs(
              query(collection(db, 'users'), where('handle', '==', handle))
            );
            const userDoc = userSnap.docs[0];
            if (!userDoc) return null;
            const user = userDoc.data() as Partial<UserProfile>;
            const resolvedUid = String(user.uid || userDoc.id);
            const safeHandle = String(user.handle || handle);
            return {
              ...INITIAL_USER,
              ...user,
              uid: resolvedUid,
              displayName: String(user.displayName || safeHandle),
              handle: safeHandle,
              email: String(user.email || ''),
              photoURL: String(user.photoURL || './images/users/avatar_inkedlife.jpg'),
              customLinks: Array.isArray(user.customLinks) ? user.customLinks : [],
              savedTattooIds: Array.isArray(user.savedTattooIds) ? user.savedTattooIds : [],
              followersCount: this.getFollowerCount(safeHandle),
              followingCount: this.followingCountsByUid[resolvedUid] || 0,
            } as UserProfile;
          } catch {
            return null;
          }
        })
      );

      const seen = new Set<string>();
      return profiles
        .filter((profile): profile is UserProfile => Boolean(profile))
        .filter((profile) => {
          const key = profile.uid || profile.handle.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
    } catch {
      return [];
    }
  }

  /** Resolve any searchable public user from Firestore, including users without tattoos. */
  public async resolvePublicProfile(handle: string): Promise<UserProfile | undefined> {
    const cleanHandle = String(handle || '').trim();
    if (!cleanHandle || !auth.currentUser) return this.getArtistProfile(cleanHandle);

    const local = this.getArtistProfile(cleanHandle);
    if (local) return local;

    try {
      const normalized = cleanHandle.replace(/^@/, '').toLowerCase();
      const snap = await getDocs(collection(db, 'users'));
      const docSnap = snap.docs.find((item) => {
        const data = item.data() as Partial<UserProfile>;
        const value = String(data.handle || '').replace(/^@/, '').toLowerCase();
        return value === normalized;
      });
      if (!docSnap) return undefined;

      const raw = docSnap.data() as Partial<UserProfile>;
      if (raw.profilePublic === false) return undefined;
      const uid = String(raw.uid || docSnap.id);
      const safeHandle = String(raw.handle || cleanHandle);
      const profile: UserProfile = {
        ...INITIAL_USER,
        ...raw,
        uid,
        displayName: String(raw.displayName || safeHandle),
        handle: safeHandle,
        email: String(raw.email || ''),
        photoURL: String(raw.photoURL || './images/users/avatar_inkedlife.jpg'),
        bio: String(raw.bio || ''),
        instagram: String(raw.instagram || ''),
        tiktok: String(raw.tiktok || ''),
        discord: String(raw.discord || ''),
        website: String(raw.website || ''),
        customLinks: Array.isArray(raw.customLinks) ? raw.customLinks : [],
        savedTattooIds: Array.isArray(raw.savedTattooIds) ? raw.savedTattooIds : [],
        isArtist: Boolean(raw.isArtist),
        verified: Boolean(raw.verified),
        role: String(raw.role || (raw.isArtist ? 'artist' : 'user')),
        isAdmin: false,
        followersCount: this.getFollowerCount(safeHandle),
        followingCount: this.followingCountsByUid[uid] || 0,
      };
      this.publicUserProfiles[safeHandle.toLowerCase()] = profile;
      return profile;
    } catch (err) {
      console.warn('Public profile resolve skipped:', err);
      return undefined;
    }
  }

  public isProfilePublic(handle: string): boolean {
    if (!handle) return true;
    if (handle.toLowerCase() === this.currentUser.handle.toLowerCase()) {
      return true;
    }

    const cachedPublic = this.publicUserProfiles[handle.toLowerCase()];
    if (cachedPublic) {
      return cachedPublic.profilePublic !== false;
    }

    const tattoo = this.tattoos.find(
      (t) => t.creatorHandle.toLowerCase() === handle.toLowerCase()
    );
    return tattoo?.creatorProfilePublic !== false;
  }

  public setProfilePublic(isPublic: boolean): UserProfile {
    this.currentUser.profilePublic = isPublic;
    this.saveUser();

    const ownTattoos = this.tattoos.filter(
      (t) => t.creatorId === this.currentUser.uid ||
        t.creatorHandle.toLowerCase() === this.currentUser.handle.toLowerCase()
    );

    ownTattoos.forEach((tattoo) => {
      tattoo.creatorProfilePublic = isPublic;
      updateDoc(doc(db, 'tattoos', tattoo.id), {
        creatorProfilePublic: isPublic,
      }).catch(() => {});
    });

    this.saveTattoos();
    window.dispatchEvent(new Event('tattoos-world-user-updated'));
    window.dispatchEvent(new Event('tattoos-world-community-updated'));
    return this.currentUser;
  }

  public getArtistProfile(handle: string): UserProfile | undefined {
    if (handle && handle.toLowerCase() === this.currentUser.handle.toLowerCase()) {
      return { ...this.currentUser, followersCount: this.getFollowerCount(handle), followingCount: this.getFollowingCount() };
    }
    const found = INITIAL_ARTISTS.find(a => a.handle.toLowerCase() === handle.toLowerCase());
    if (found) {
      return { ...found, followersCount: this.getFollowerCount(found.handle), followingCount: this.getProfileFollowingCount(found.handle) };
    }

    const cachedPublic = this.publicUserProfiles[handle.toLowerCase()];
    if (cachedPublic) {
      return {
        ...cachedPublic,
        followersCount: this.getFollowerCount(cachedPublic.handle),
        followingCount: this.getProfileFollowingCount(cachedPublic.handle),
      };
    }

    // Community users who are not in the starter artist list still get a real profile
    // built from their published tattoo data instead of being shown as a generic artist.
    const userTattoo = this.tattoos.find(
      (t) => t.creatorHandle.toLowerCase() === handle.toLowerCase()
    );
    if (userTattoo) {
      if (userTattoo.creatorProfilePublic === false) return undefined;

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

    return undefined;;
  }
}

export const tattooStore = new TattooStoreService();
