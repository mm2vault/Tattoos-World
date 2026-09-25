import React, { useState, useEffect } from 'react';
import { Tattoo, CategoryId, SupportedLanguage, UserProfile } from './types';
import { tattooStore } from './services/tattooStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { TattooDetailModal } from './components/TattooDetailModal';
import { ProfileView } from './components/ProfileView';
import { CreateTattooModal } from './components/CreateTattooModal';
import { MessagesView } from './components/MessagesView';
import { SettingsView } from './components/SettingsView';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { ShowcaseBoard } from './components/ShowcaseBoard';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CommunityView } from './components/CommunityView';
import { AboutView } from './components/AboutView';
import { FooterBar } from './components/FooterBar';
import { Toast } from './components/Toast';
import { 
  X, Home, Compass, Users, User, PlusCircle, Heart, MessageSquare, Info, Settings, ShieldCheck, LogOut 
} from 'lucide-react';

export default function App() {
  // Authentication: check persistent session or previous entry so user stays in the app
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tattos_world_has_entered') === 'true' || tattooStore.hasActiveSession();
  });

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('tattos_world_lang_v1') as SupportedLanguage) || 'tr';
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [showcaseMode, setShowcaseMode] = useState<boolean>(false);
  const [mobileFrameOpen, setMobileFrameOpen] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Active Modals & Selections
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [selectedCreatorHandle, setSelectedCreatorHandle] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data
  const [tattoos, setTattoos] = useState<Tattoo[]>(() => tattooStore.getTattoos());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => tattooStore.getCurrentUser());

  // Micro feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync current user state on mount if session is active
  useEffect(() => {
    if (tattooStore.hasActiveSession()) {
      setCurrentUser(tattooStore.getCurrentUser());
    }
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('tattos_world_lang_v1', lang);
  };

  const handleEnterApp = () => {
    localStorage.setItem('tattos_world_has_entered', 'true');
    tattooStore.setSessionActive(true);
    setIsAuthenticated(true);
  };

  const handleLoginWithGoogle = async () => {
    try {
      const user = await tattooStore.loginWithGoogle();
      localStorage.setItem('tattos_world_has_entered', 'true');
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (tattooStore.isCurrentUserAdmin()) {
        setToastMessage(`👑 Yönetici (${user.email}) yetkisiyle giriş yapıldı.`);
      } else {
        setToastMessage(`Giriş yapıldı: ${user.displayName}`);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setToastMessage('Giriş penceresi kapatıldı.');
        return;
      }
      console.warn('Google login note:', err);
      // Fallback to guest so user is not blocked
      setToastMessage('Google ile giriş yapılamadı. Lütfen tekrar deneyin veya misafir olarak devam edin.');
    }
  };

  const handleLoginAsGuest = () => {
    const guest = tattooStore.loginAsGuest();
    localStorage.setItem('tattos_world_has_entered', 'true');
    setCurrentUser(guest);
    setIsAuthenticated(true);
    setToastMessage('Giriş yapıldı.');
  };

  const handleLogout = async () => {
    await tattooStore.logout();
    const guest = tattooStore.loginAsGuest();
    setCurrentUser(guest);
    setToastMessage('Çıkış yapıldı. Konuk olarak devam ediyorsunuz.');
  };

  const handleCreateTattoo = (data: {
    title: string;
    category: CategoryId;
    categoryName: string;
    description: string;
    image: string;
    additionalImages?: string[];
    socialLinks?: {
      instagram?: string;
      tiktok?: string;
      discord?: string;
      website?: string;
    };
  }) => {
    const newTattoo = tattooStore.createTattoo(data);
    setTattoos(tattooStore.getTattoos());
    setToastMessage('Dövme başarıyla paylaşıldı.');
    setSelectedTattoo(newTattoo);
  };

  const handleSelectCreator = (handle: string) => {
    setSelectedCreatorHandle(handle);
    setCurrentTab('profile');
  };

  const handleOpenMessagesWithCreator = (handle: string, prefill?: string) => {
    setSelectedCreatorHandle(handle);
    setCurrentTab('messages');
    if (prefill) sessionStorage.setItem('tattos_world_message_prefill', prefill);
  };

  const handleTattooUpdated = () => {
    setTattoos(tattooStore.getTattoos());
    if (selectedTattoo) {
      const refreshed = tattooStore.getTattooById(selectedTattoo.id);
      if (refreshed) {
        setSelectedTattoo(refreshed);
      } else {
        setSelectedTattoo(null);
      }
    }
  };

  const profileToDisplay = selectedCreatorHandle
    ? tattooStore.getArtistProfile(selectedCreatorHandle) || currentUser
    : currentUser;

  const isUserAdminActive = tattooStore.isCurrentUserAdmin();

  // 1. WELCOME SCREEN (When not logged in and never entered before)
  if (!isAuthenticated && !showcaseMode) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col justify-between selection:bg-white selection:text-black">
        <WelcomeScreen
          onLoginWithGoogle={handleLoginWithGoogle}
          onLoginAsGuest={handleLoginAsGuest}
          onExploreDirectly={handleEnterApp}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
        <FooterBar
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
        <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
      </div>
    );
  }

  // 2. MAIN APPLICATION DASHBOARD (Sidebar + TopHeader + Main Content)
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] flex flex-col selection:bg-white selection:text-black">
      
      <div className="flex-1 flex w-full">
        {/* Left Desktop Sidebar matching image */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setShowcaseMode(false);
            setCurrentTab(tab);
            if (tab !== 'profile') setSelectedCreatorHandle(null);
          }}
          onOpenCreate={() => setCreateModalOpen(true)}
          onLogout={handleLogout}
          isAdmin={isUserAdminActive}
          onOpenAdmin={() => setAdminPanelOpen(true)}
          adminEmail={currentUser.email}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header with Search, Switcher & Icons */}
          <TopHeader
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            currentUser={currentUser}
            onProfileClick={() => {
              setShowcaseMode(false);
              setSelectedCreatorHandle(null);
              setCurrentTab('profile');
            }}
            onLoginWithGoogle={handleLoginWithGoogle}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            onOpenMobileFrame={() => setMobileFrameOpen(true)}
            showcaseMode={showcaseMode}
            onToggleShowcaseMode={() => setShowcaseMode(!showcaseMode)}
          />

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
            
            {/* If Showcase Mode is Active: Show all 6 screen surfaces together matching the image! */}
            {showcaseMode ? (
              <ShowcaseBoard
                tattoos={tattoos}
                currentUser={currentUser}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onSelectTattoo={(t) => setSelectedTattoo(t)}
                onSelectCreator={handleSelectCreator}
                onOpenCreate={() => setCreateModalOpen(true)}
                onOpenMobileFrame={() => setMobileFrameOpen(true)}
                onSwitchToLive={() => setShowcaseMode(false)}
              />
            ) : (
              <>
                {/* Explore Tab: Hero + Popular 5 cards + Categories + Grid */}
                {currentTab === 'explore' && (
                  <div>
                    {!searchQuery && (
                      <Hero
                        onExplore={() => {
                          const el = document.getElementById('gallery-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        onShare={() => setCreateModalOpen(true)}
                      />
                    )}

                    <div id="gallery-section">
                      <Gallery
                        tattoos={tattoos}
                        onSelectTattoo={(t) => setSelectedTattoo(t)}
                        onSelectCreator={handleSelectCreator}
                        onOpenCreate={() => setCreateModalOpen(true)}
                        searchQuery={searchQuery}
                        selectedCategory={selectedCategory}
                        onSelectCategory={(cat) => setSelectedCategory(cat)}
                        currentUser={currentUser}
                        onToast={(msg) => setToastMessage(msg)}
                        onTattooUpdated={handleTattooUpdated}
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Tab */}
                {currentTab === 'gallery' && (
                  <Gallery
                    tattoos={tattoos}
                    onSelectTattoo={(t) => setSelectedTattoo(t)}
                    onSelectCreator={handleSelectCreator}
                    onOpenCreate={() => setCreateModalOpen(true)}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => setSelectedCategory(cat)}
                    currentUser={currentUser}
                    onToast={(msg) => setToastMessage(msg)}
                    onTattooUpdated={handleTattooUpdated}
                  />
                )}

                {/* Profile or Favorites Tab */}
                {(currentTab === 'profile' || currentTab === 'favorites') && (
                  <ProfileView
                    profileUser={profileToDisplay}
                    currentUser={currentUser}
                    tattoos={tattoos}
                    onSelectTattoo={(t) => setSelectedTattoo(t)}
                    onOpenCreate={() => setCreateModalOpen(true)}
                    onOpenMessages={handleOpenMessagesWithCreator}
                    currentLanguage={currentLanguage}
                    onToast={(msg) => setToastMessage(msg)}
                    onUserUpdated={(u) => setCurrentUser(u)}
                    onTattooUpdated={handleTattooUpdated}
                    initialTab={currentTab === 'favorites' ? 'favorites' : 'creations'}
                  />
                )}

                {/* Community Collective Tab */}
                {currentTab === 'community' && (
                  <CommunityView
                    tattoos={tattoos}
                    onSelectTattoo={(t) => setSelectedTattoo(t)}
                    onSelectCreator={handleSelectCreator}
                    currentLanguage={currentLanguage}
                    currentUser={currentUser}
                    onToast={(msg) => setToastMessage(msg)}
                  />
                )}

                {/* About & Manifesto Tab */}
                {currentTab === 'about' && (
                  <AboutView
                    currentLanguage={currentLanguage}
                    onExplore={() => setCurrentTab('gallery')}
                    onShare={() => setCreateModalOpen(true)}
                  />
                )}

                {/* Interactive Messages Tab */}
                {currentTab === 'messages' && (
                  <MessagesView
                    currentUser={currentUser}
                    onSelectCreator={handleSelectCreator}
                    initialCreatorHandle={selectedCreatorHandle}
                    initialMessage={sessionStorage.getItem('tattos_world_message_prefill') || ''}
                    onPrefillConsumed={() => sessionStorage.removeItem('tattos_world_message_prefill')}
                  />
                )}

                {/* Interactive Settings Tab */}
                {currentTab === 'settings' && (
                  <SettingsView
                    currentUser={currentUser}
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                    onLogout={handleLogout}
                    onToast={(msg) => setToastMessage(msg)}
                  />
                )}
              </>
            )}

          </main>

          {/* Footer Bar Across Bottom */}
          <FooterBar
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setShowcaseMode(false);
          setCurrentTab(tab);
          if (tab !== 'profile') setSelectedCreatorHandle(null);
        }}
        onOpenCreate={() => setCreateModalOpen(true)}
        currentLanguage={currentLanguage}
      />

      {/* Admin Panel Modal */}
      {adminPanelOpen && (
        <AdminPanelModal
          onClose={() => setAdminPanelOpen(false)}
          tattoos={tattoos}
          currentUser={currentUser}
          onTattooUpdated={handleTattooUpdated}
          onToast={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Tattoo Detail Modal matching bottom left of image */}
      {selectedTattoo && (
        <TattooDetailModal
          tattoo={selectedTattoo}
          onClose={() => setSelectedTattoo(null)}
          onSelectCreator={handleSelectCreator}
          currentLanguage={currentLanguage}
          currentUser={currentUser}
          onToast={(msg) => setToastMessage(msg)}
          onTattooUpdated={handleTattooUpdated}
          onOpenMessages={handleOpenMessagesWithCreator}
        />
      )}

      {/* Create Tattoo Modal matching center right of image */}
      {createModalOpen && (
        <CreateTattooModal
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTattoo}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Interactive Mobile Device Simulator Modal matching bottom right of image */}
      {mobileFrameOpen && (
        <MobileDeviceFrame
          onClose={() => setMobileFrameOpen(false)}
          tattoos={tattoos}
          currentUser={currentUser}
          onSelectTattoo={(t) => {
            setSelectedTattoo(t);
            setMobileFrameOpen(false);
          }}
          onOpenCreate={() => {
            setMobileFrameOpen(false);
            setCreateModalOpen(true);
          }}
        />
      )}

      {/* Mobile Drawer Navigation when hamburger clicked */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0d0d0d] border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-brush text-xl text-white uppercase tracking-wider">
                  TATTOO'S WORLD
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[#888888] hover:text-white cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'explore', label: 'Ana Sayfa', icon: Home },
                  { id: 'gallery', label: 'Galeri', icon: Compass },
                  { id: 'community', label: 'Topluluk', icon: Users },
                  { id: 'profile', label: 'Profilim', icon: User },
                  { id: 'create', label: 'Dövme Ekle', icon: PlusCircle, isAction: true },
                  { id: 'favorites', label: 'Favorilerim', icon: Heart },
                  { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
                  { id: 'about', label: 'Hakkımızda', icon: Info },
                  { id: 'settings', label: 'Ayarlar', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (item.isAction) {
                          setCreateModalOpen(true);
                        } else {
                          setCurrentTab(item.id);
                          if (item.id !== 'profile') setSelectedCreatorHandle(null);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? 'bg-white/15 text-white' : 'text-[#888888] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {isUserAdminActive && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAdminPanelOpen(true);
                    }}
                    className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Paneli</span>
                  </button>
                )}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />

    </div>
  );
}
