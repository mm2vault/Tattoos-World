import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, Info, Search, Send, X, Smile, Trash2, Reply, Pencil, Copy } from 'lucide-react';
import { UserProfile } from '../types';
import { tattooStore } from '../services/tattooStore';
import { db, auth } from '../services/firebase';
import {
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

interface MessagesViewProps {
  currentUser: UserProfile;
  onSelectCreator: (handle: string) => void;
  initialCreatorHandle?: string | null;
  initialMessage?: string;
  onPrefillConsumed?: () => void;
  onRequestLogin?: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  text: string;
  createdAt: string;
  isMine: boolean;
  readBy: string[];
  reactions?: Record<string, string>;
  replyTo?: {
    id: string;
    senderHandle: string;
    text: string;
  };
  editedAt?: string;
  sharedTattoo?: {
    id: string;
    title: string;
    image: string;
    creatorName: string;
    creatorHandle: string;
    categoryName: string;
  };
}

interface ChatPartner {
  uid: string;
  name: string;
  handle: string;
  photo: string;
  verified: boolean;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  conversationId: string;
  unreadCount: number;
  lastSeenAt?: string;
}

const buildConversationId = (a: string, b: string) => [a, b].sort().join('__');

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isRecentlyOnline = (value?: string) => {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp < 90000;
};

const formatLastSeen = (value?: string) => {
  if (!value) return 'son görülme bilgisi yok';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'son görülme bilgisi yok';
  if (isRecentlyOnline(value)) return 'çevrimiçi';

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  return sameDay
    ? 'son görülme ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'son görülme ' + date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const avatarFallback = './images/users/avatar_inkedlife.jpg';

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  onSelectCreator,
  initialCreatorHandle,
  initialMessage = '',
  onPrefillConsumed,
  onRequestLogin,
}) => {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedPartnerUid, setSelectedPartnerUid] = useState('');
  const [search, setSearch] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<ChatPartner[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [reactionOpenId, setReactionOpenId] = useState('');
  const [composerEmojiOpen, setComposerEmojiOpen] = useState(false);
  const [typingPartnerName, setTypingPartnerName] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [partnerPresence, setPartnerPresence] = useState('');
  const [pendingSharedTattoo, setPendingSharedTattoo] = useState<ChatMessage['sharedTattoo']>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firebaseUid = auth.currentUser?.uid || currentUser.uid;
  const isGuestAuth = Boolean(auth.currentUser?.isAnonymous);

  const tattooPartners = useMemo(() => {
    const map = new Map<string, ChatPartner>();
    tattooStore.getTattoos().forEach((tattoo) => {
      if (!tattoo.creatorId || tattoo.creatorId === currentUser.uid || map.has(tattoo.creatorId)) return;
      map.set(tattoo.creatorId, {
        uid: tattoo.creatorId,
        name: tattoo.creatorName || tattoo.creatorHandle,
        handle: tattoo.creatorHandle,
        photo: tattoo.creatorPhoto || '',
        verified: Boolean(tattoo.creatorVerified),
        role: tattoo.creatorRole || 'Topluluk üyesi',
        lastMessage: 'Yeni sohbet',
        lastMessageAt: '',
        conversationId: buildConversationId(firebaseUid, tattoo.creatorId),
        unreadCount: 0,
      });
    });
    return map;
  }, [currentUser.uid, firebaseUid]);

  const selfPartner: ChatPartner = useMemo(() => ({
    uid: firebaseUid,
    name: 'Notlarım',
    handle: currentUser.handle,
    photo: currentUser.photoURL || '',
    verified: Boolean(currentUser.verified),
    role: 'Kişisel',
    lastMessage: 'Kendine not gönder',
    lastMessageAt: '',
    conversationId: buildConversationId(firebaseUid, firebaseUid),
    unreadCount: 0,
  }), [firebaseUid, currentUser.handle, currentUser.photoURL, currentUser.verified]);

  useEffect(() => {
    setPartners((prev) => {
      const map = new Map(prev.map((item) => [item.uid, item]));
      tattooPartners.forEach((item, uid) => {
        if (!map.has(uid)) map.set(uid, item);
      });
      if (!map.has(selfPartner.uid) || selfPartner.uid === firebaseUid) {
        map.set(selfPartner.uid, selfPartner);
      }
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
      );
    });
  }, [tattooPartners, selfPartner, firebaseUid]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const messageQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    return onSnapshot(
      messageQuery,
      (snap) => {
        const grouped: Record<string, ChatMessage[]> = {};
        const remotePartners = new Map<string, ChatPartner>();

        snap.docs.forEach((item) => {
          const data = item.data() as {
            conversationId?: string;
            senderId?: string;
            senderHandle?: string;
            senderName?: string;
            senderPhoto?: string;
            senderVerified?: boolean;
            senderRole?: string;
            recipientId?: string;
            recipientHandle?: string;
            recipientName?: string;
            recipientPhoto?: string;
            recipientVerified?: boolean;
            recipientRole?: string;
            text?: string;
            createdAt?: string;
            participants?: string[];
            readBy?: string[];
            reactions?: Record<string, string>;
            replyTo?: { id?: string; senderHandle?: string; text?: string };
            editedAt?: string;
            sharedTattoo?: {
              id?: string;
              title?: string;
              image?: string;
              creatorName?: string;
              creatorHandle?: string;
              categoryName?: string;
            };
          };

          const uid = auth.currentUser!.uid;
          const participants = Array.isArray(data.participants) ? data.participants : [];
          const partnerUid =
            participants.find((participant) => participant !== uid) ||
            (data.senderId && data.senderId !== uid ? data.senderId : data.recipientId) ||
            '';

          if (!partnerUid) return;

          const conversationId =
            data.conversationId || buildConversationId(uid, partnerUid);

          const message: ChatMessage = {
            id: item.id,
            senderId: String(data.senderId || ''),
            senderHandle: String(data.senderHandle || ''),
            text: String(data.text || ''),
            createdAt: String(data.createdAt || ''),
            isMine: data.senderId === uid,
            readBy: Array.isArray(data.readBy) ? data.readBy : [],
            reactions: data.reactions && typeof data.reactions === 'object' ? data.reactions : {},
            replyTo: data.replyTo?.id
              ? {
                  id: String(data.replyTo.id),
                  senderHandle: String(data.replyTo.senderHandle || ''),
                  text: String(data.replyTo.text || ''),
                }
              : undefined,
            editedAt: data.editedAt ? String(data.editedAt) : undefined,
            sharedTattoo: data.sharedTattoo?.id
              ? {
                  id: String(data.sharedTattoo.id),
                  title: String(data.sharedTattoo.title || 'Paylaşılan dövme'),
                  image: String(data.sharedTattoo.image || ''),
                  creatorName: String(data.sharedTattoo.creatorName || ''),
                  creatorHandle: String(data.sharedTattoo.creatorHandle || ''),
                  categoryName: String(data.sharedTattoo.categoryName || 'Dövme'),
                }
              : undefined,
          };

          if (!grouped[conversationId]) grouped[conversationId] = [];
          grouped[conversationId].push(message);

          const partnerIsSender = data.senderId !== uid;
          const partner: ChatPartner = {
            uid: partnerUid,
            name: partnerIsSender
              ? String(data.senderName || data.senderHandle || 'Kullanıcı')
              : String(data.recipientName || data.recipientHandle || 'Kullanıcı'),
            handle: partnerIsSender
              ? String(data.senderHandle || '')
              : String(data.recipientHandle || ''),
            photo: partnerIsSender
              ? String(data.senderPhoto || '')
              : String(data.recipientPhoto || ''),
            verified: Boolean(partnerIsSender ? data.senderVerified : data.recipientVerified),
            role: String(partnerIsSender ? data.senderRole : data.recipientRole || 'Kullanıcı'),
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            conversationId,
            unreadCount: 0,
          };

          if (partner.handle) remotePartners.set(partnerUid, partner);
        });

        Object.entries(grouped).forEach(([conversationId, list]) => {
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const last = list[list.length - 1];
          const partnerUid = conversationId
            .split('__')
            .find((value) => value !== auth.currentUser!.uid) || '';

          if (!partnerUid) return;

          const existing = remotePartners.get(partnerUid) || tattooPartners.get(partnerUid);
          if (!existing) return;

          existing.lastMessage = last?.text || existing.lastMessage;
          existing.lastMessageAt = last?.createdAt || existing.lastMessageAt;
          existing.conversationId = conversationId;
          existing.unreadCount = list.filter(
            (item) => !item.isMine && !item.readBy.includes(auth.currentUser!.uid)
          ).length;
          remotePartners.set(partnerUid, existing);
        });

        const merged = new Map<string, ChatPartner>();
        tattooPartners.forEach((value, key) => merged.set(key, value));
        merged.set(selfPartner.uid, {
          ...selfPartner,
          lastMessage: grouped[selfPartner.conversationId]?.slice(-1)[0]?.text || selfPartner.lastMessage,
          lastMessageAt: grouped[selfPartner.conversationId]?.slice(-1)[0]?.createdAt || selfPartner.lastMessageAt,
          unreadCount: 0,
        });
        remotePartners.forEach((value, key) => merged.set(key, value));

        const sorted = Array.from(merged.values()).sort(
          (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );

        setPartners(sorted);
        setMessages(grouped);
        setSelectedPartnerUid((current) => current || '');
      },
      (error) => {
        console.warn('Realtime messages could not be loaded:', error);
        setSendError('Mesajlar Firestore tarafından okunamadı. Firebase Rules kısmını kontrol et.');
      }
    );
  }, [currentUser.uid, tattooPartners, selfPartner]);

  useEffect(() => {
    if (!initialCreatorHandle) return;
    const normalized = initialCreatorHandle.trim().toLowerCase();
    const existing = partners.find((partner) => partner.handle.toLowerCase() === normalized);
    if (existing) {
      setSelectedPartnerUid(existing.uid);
      return;
    }

    let cancelled = false;
    const resolveUser = async () => {
      try {
        const targetHandle = initialCreatorHandle.startsWith('@')
          ? initialCreatorHandle
          : '@' + initialCreatorHandle;

        const snap = await getDocs(
          query(collection(db, 'users'), where('handle', '==', targetHandle))
        );
        const profileDoc = snap.docs[0];
        if (!profileDoc || cancelled) return;

        const profile = profileDoc.data() as Partial<UserProfile>;
        const uid = String(profile.uid || profileDoc.id);
        if (!uid || uid === currentUser.uid) return;

        const partner: ChatPartner = {
          uid,
          name: String(profile.displayName || targetHandle),
          handle: String(profile.handle || targetHandle),
          photo: String(profile.photoURL || ''),
          verified: Boolean(profile.verified),
          role: String(profile.role || (profile.isArtist ? 'Sanatçı' : 'Kullanıcı')),
          lastMessage: 'Yeni sohbet',
          lastMessageAt: '',
          conversationId: buildConversationId(firebaseUid, uid),
          unreadCount: 0,
          lastSeenAt: String(profile.lastSeenAt || ''),
        };

        setPartners((prev) => [partner, ...prev.filter((item) => item.uid !== uid)]);
        setSelectedPartnerUid(uid);
      } catch (error) {
        console.warn('Message profile lookup failed:', error);
      }
    };

    resolveUser();
    return () => {
      cancelled = true;
    };
  }, [initialCreatorHandle, partners, firebaseUid]);

  return (
    <div className="w-full h-full min-h-0 bg-[#050505] text-white flex overflow-hidden">
      <aside
        className={"w-full md:w-[340px] lg:w-[380px] shrink-0 border-r border-white/[0.08] bg-[#080808] flex-col " + (selectedPartnerUid ? 'hidden md:flex' : 'flex')}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[24px] leading-none font-semibold tracking-[-0.02em]">Mesajlar</h1>
              <p className="text-[11px] text-[#6f6f6f] mt-1.5">Sohbetlerin</p>
            </div>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="w-9 h-9 rounded-full text-[#8a8a8a] hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Aramayı temizle"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5f]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ara"
              className="w-full h-10 rounded-lg bg-[#171717] border border-white/[0.04] pl-9 pr-9 text-[13px] text-white placeholder:text-[#676767] outline-none focus:border-white/10 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white cursor-pointer"
                aria-label="Aramayı temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isGuestAuth && (
          <div className="mx-4 mb-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
            <p className="text-[11px] font-semibold text-white">Misafir hesap</p>
            <p className="text-[10px] leading-relaxed text-[#707070] mt-1">
              Cihazlar arasında mesajlarını korumak için Google ile giriş yap.
            </p>
            <button
              type="button"
              onClick={onRequestLogin}
              className="mt-2 text-[10px] font-semibold text-white underline underline-offset-2 cursor-pointer"
            >
              Google ile giriş yap
            </button>
          </div>
        )}

        {loadingUsers && search.trim().length >= 2 && (
          <div className="px-5 py-2 text-[10px] text-[#676767]">Kullanıcılar aranıyor...</div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {visiblePartners.length === 0 ? (
            <div className="h-full min-h-[260px] flex items-center justify-center px-8 text-center">
              <div>
                <div className="w-14 h-14 rounded-full border border-white/[0.08] flex items-center justify-center mx-auto">
                  <Send className="w-5 h-5 text-[#555]" />
                </div>
                <p className="text-sm font-medium mt-4">Henüz mesaj yok</p>
                <p className="text-[11px] text-[#666] leading-relaxed mt-1.5 max-w-[220px]">
                  Yukarıdaki aramadan bir kullanıcı bul ve sohbete başla.
                </p>
              </div>
            </div>
          ) : (
            visiblePartners.map((partner) => {
              const active = partner.uid === selectedPartnerUid;
              const last = messages[partner.conversationId]?.slice(-1)[0];
              const online = isRecentlyOnline(partner.lastSeenAt);

              return (
                <button
                  key={partner.uid}
                  type="button"
                  onClick={() => handleSelectPartner(partner)}
                  className={"w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left cursor-pointer transition-colors " + (active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]')}
                >
                  <div className="relative shrink-0">
                    <img
                      src={partner.photo || avatarFallback}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border border-white/[0.08]"
                    />
                    {online && (
                      <span className="absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[#080808]" />
                    )}
                    {partner.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                        {partner.unreadCount > 9 ? '9+' : partner.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold truncate flex items-center gap-1.5">
                        {partner.name}
                        {partner.verified && <span className="text-[9px] text-sky-300">✓</span>}
                      </span>
                      <span className="text-[9px] text-[#555] shrink-0">{formatTime(last?.createdAt || partner.lastMessageAt)}</span>
                    </div>
                    <div className={"text-[11px] mt-1 truncate " + (partner.unreadCount > 0 ? 'text-white font-medium' : 'text-[#777]')}>
                      {last?.text || partner.lastMessage}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className={"flex-1 min-w-0 min-h-0 bg-[#000] flex-col " + (selectedPartnerUid ? 'flex' : 'hidden md:flex')}>
        {activePartner ? (
          <>
            <header className="h-[70px] shrink-0 px-3 sm:px-5 border-b border-white/[0.08] bg-black flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerUid('')}
                  className="md:hidden w-9 h-9 rounded-full text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                  aria-label="Mesaj listesine dön"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCreator(activePartner.handle)}
                  className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={activePartner.photo || avatarFallback}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/[0.08]"
                    />
                    {isRecentlyOnline(partnerPresence || activePartner.lastSeenAt) && activePartner.uid !== firebaseUid && (
                      <span className="absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate flex items-center gap-1.5">
                      {activePartner.name}
                      {activePartner.verified && <span className="text-[9px] text-sky-300">✓</span>}
                    </div>
                    <div className={"text-[10px] truncate mt-0.5 " + (typingPartnerName || isRecentlyOnline(partnerPresence || activePartner.lastSeenAt) ? 'text-white' : 'text-[#666]')}>
                      {typingPartnerName
                        ? typingPartnerName + ' yazıyor...'
                        : activePartner.uid === firebaseUid
                          ? 'Notların'
                          : formatLastSeen(partnerPresence || activePartner.lastSeenAt)}
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSelectCreator(activePartner.handle)}
                className="w-9 h-9 rounded-full text-[#777] hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                aria-label="Profili aç"
              >
                <Info className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5">
              <div className="max-w-[680px] mx-auto min-h-full flex flex-col justify-end py-5 sm:py-7">
                {activeMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-end pb-10 text-center">
                    <img
                      src={activePartner.photo || avatarFallback}
                      alt=""
                      className="w-[88px] h-[88px] rounded-full object-cover border border-white/[0.08]"
                    />
                    <p className="text-[16px] font-semibold mt-3">{activePartner.name}</p>
                    <p className="text-[12px] text-[#6b6b6b] mt-1">{activePartner.handle}</p>
                    <p className="text-[11px] text-[#555] mt-3">Sohbeti başlat.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-center py-3">
                      <span className="text-[9px] text-[#4f4f4f]">
                        {activeMessages[0]?.createdAt ? new Date(activeMessages[0].createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    {activeMessages.map((message, index) => {
                      const previous = activeMessages[index - 1];
                      const sameSender = previous && previous.senderId === message.senderId;

                      return (
                        <div
                          key={message.id}
                          className={"flex " + (message.isMine ? 'justify-end' : 'justify-start') + (sameSender ? ' mt-0.5' : 'mt-2.5')}
                        >
                          <div className={"max-w-[78%] sm:max-w-[66%] flex flex-col " + (message.isMine ? 'items-end' : 'items-start')}>
                            <div className="relative group">
                              {message.replyTo && (
                                <div className={"mb-1 max-w-full rounded-xl px-3 py-2 border text-[9px] " + (message.isMine ? 'bg-white/[0.07] border-white/[0.08] text-[#888]' : 'bg-[#111] border-white/[0.06] text-[#777]')}>
                                  <div className="font-semibold truncate">@{message.replyTo.senderHandle.replace(/^@/, '')}</div>
                                  <div className="truncate mt-0.5">{message.replyTo.text}</div>
                                </div>
                              )}

                              <div className={"relative " + (message.isMine ? 'items-end' : 'items-start')}>
                                {message.sharedTattoo && (
                                  <div className={"mb-1.5 overflow-hidden rounded-[18px] border " + (message.isMine ? 'border-white/[0.09] bg-[#111]' : 'border-white/[0.08] bg-[#111]')}>
                                    {message.sharedTattoo.image && (
                                      <img
                                        src={message.sharedTattoo.image}
                                        alt={message.sharedTattoo.title}
                                        className="w-full max-h-64 object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <div className="px-3 py-2.5">
                                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#666]">Paylaşılan dövme</p>
                                      <p className="text-[12px] font-semibold text-white mt-1">{message.sharedTattoo.title}</p>
                                      <p className="text-[10px] text-[#777] mt-0.5">{message.sharedTattoo.creatorHandle}</p>
                                    </div>
                                  </div>
                                )}

                                <div className={"px-3.5 py-2.5 text-[13px] leading-[1.35] whitespace-pre-wrap " + (message.isMine
                                  ? 'bg-white text-black rounded-[20px] rounded-br-[6px]'
                                  : 'bg-[#1a1a1a] text-white border border-white/[0.05] rounded-[20px] rounded-bl-[6px]')}>
                                  {message.text}
                                </div>
                              </div>

                              <div className={"absolute -top-9 " + (message.isMine ? 'right-0' : 'left-0') + " flex items-center gap-0.5 rounded-full bg-[#151515] border border-white/[0.08] px-1 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"}>
                                <button
                                  type="button"
                                  onClick={() => setReactionOpenId((id) => id === message.id ? '' : message.id)}
                                  className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-white cursor-pointer"
                                  aria-label="Reaksiyon ekle"
                                >
                                  <Smile className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReplyMessage(message)}
                                  className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-white cursor-pointer"
                                  aria-label="Yanıtla"
                                >
                                  <Reply className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(message)}
                                  className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-white cursor-pointer"
                                  aria-label="Kopyala"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {message.isMine && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleEditMessage(message)}
                                      className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-[#aaa] hover:text-white cursor-pointer"
                                      aria-label="Düzenle"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(message)}
                                      className="w-7 h-7 rounded-full hover:bg-red-500/10 text-[#777] hover:text-red-300 flex items-center justify-center cursor-pointer"
                                      aria-label="Mesajı sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>

                              {reactionOpenId === message.id && (
                                <div className={"absolute -top-[76px] " + (message.isMine ? 'right-0' : 'left-0') + " flex items-center gap-0.5 rounded-full bg-[#131313] border border-white/[0.08] px-2 py-1 shadow-2xl z-30"}>
                                  {['❤️', '😂', '😍', '🔥', '👏', '😮'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleReaction(message, emoji)}
                                      className="w-8 h-8 rounded-full hover:bg-white/[0.07] text-sm flex items-center justify-center cursor-pointer"
                                      aria-label={emoji}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-[#505050]">
                              <span>{formatTime(message.createdAt)}</span>
                              {message.editedAt && <span>· düzenlendi</span>}
                              {message.isMine && (
                                message.readBy.length > 1
                                  ? <CheckCheck className="w-3 h-3 text-sky-300" />
                                  : <Check className="w-3 h-3" />
                              )}
                            </div>

                            {message.reactions && Object.keys(message.reactions).length > 0 && (
                              <div className="self-end -mt-0.5 mr-1 flex items-center gap-1 rounded-full bg-[#151515] border border-white/[0.06] px-2 py-1">
                                {Array.from(new Set(Object.values(message.reactions))).slice(0, 3).map((emoji) => (
                                  <span key={emoji} className="text-[11px] leading-none">{emoji}</span>
                                ))}
                                {Object.keys(message.reactions).length > 3 && (
                                  <span className="text-[9px] text-[#777]">{Object.keys(message.reactions).length}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sendError && (
                  <div className="mx-auto max-w-md mt-4 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-[10px] text-red-200 text-center">
                    {sendError}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="shrink-0 px-3 sm:px-5 pt-2.5 pb-[max(0.7rem,env(safe-area-inset-bottom))] bg-black"
            >
              <div className="max-w-[680px] mx-auto">
                {pendingSharedTattoo && (
                  <div className="mb-2.5 rounded-2xl border border-white/[0.08] bg-[#111] px-3 py-2 flex items-center gap-3">
                    <img src={pendingSharedTattoo.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-white">Dövme paylaşımı hazır</p>
                      <p className="text-[10px] text-[#777] truncate mt-0.5">{pendingSharedTattoo.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingSharedTattoo(undefined)}
                      className="w-7 h-7 rounded-full text-[#777] hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                      aria-label="Paylaşımı kaldır"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(replyingTo || editingMessageId) && (
                  <div className="mb-2.5 rounded-2xl border border-white/[0.08] bg-[#111] px-3 py-2 flex items-center gap-3">
                    <div className="w-1 self-stretch rounded-full bg-white/50" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-white">
                        {editingMessageId ? 'Mesajı düzenliyorsun' : 'Yanıtlıyorsun'}
                      </p>
                      <p className="text-[10px] text-[#777] truncate mt-0.5">
                        {editingMessageId ? editingText : replyingTo?.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelComposerMode}
                      className="w-7 h-7 rounded-full text-[#777] hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                      aria-label="İptal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {composerEmojiOpen && (
                  <div className="mb-2 flex items-center gap-1 rounded-2xl bg-[#111] border border-white/[0.08] px-2 py-2 shadow-2xl w-fit">
                    {['❤️', '😂', '😍', '🔥', '👏', '😮', '🥹', '🖤'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addComposerEmoji(emoji)}
                        className="w-8 h-8 rounded-xl hover:bg-white/[0.06] text-sm flex items-center justify-center cursor-pointer"
                        aria-label={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposerEmojiOpen((open) => !open)}
                    className="w-9 h-9 shrink-0 rounded-full text-[#8b8b8b] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Emoji ekle"
                  >
                    <Smile className="w-[19px] h-[19px]" />
                  </button>

                  <div className="flex-1 min-w-0 rounded-[22px] bg-[#111] border border-white/[0.08] focus-within:border-white/[0.14] transition-colors flex items-center">
                    <textarea
                      rows={1}
                      value={newMessageText}
                      onChange={(event) => setNewMessageText(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Mesaj..."
                      className="flex-1 min-w-0 max-h-28 min-h-10 bg-transparent resize-none px-4 py-2.5 text-[13px] leading-5 text-white placeholder:text-[#5e5e5e] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={(!newMessageText.trim() && !pendingSharedTattoo) || sending}
                    className="w-10 h-10 shrink-0 rounded-full text-white flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/[0.06] transition-colors"
                    aria-label="Mesajı gönder"
                  >
                    <Send className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center px-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-full border border-white/[0.08] flex items-center justify-center mx-auto">
                <Send className="w-6 h-6 text-[#555]" />
              </div>
              <p className="text-[16px] font-semibold mt-4">Mesajların</p>
              <p className="text-[12px] text-[#666] mt-1.5 max-w-sm">
                Bir sohbet seç veya yeni bir kullanıcı ara.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
