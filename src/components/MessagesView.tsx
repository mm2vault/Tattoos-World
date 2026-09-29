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
}

const buildConversationId = (a: string, b: string) => [a, b].sort().join('__');

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        };

        setPartners((prev) => [partner, ...prev.filter((item) => item.uid !== uid)]);
        setSelectedPartnerUid(uid);
      } catch (error) {
        console.warn('Message profile lookup failed:', error);
      }
    };

    resolveUser();
    return () => { cancelled = true; };
  }, [initialCreatorHandle, partners, firebaseUid]);

  useEffect(() => {
    if (!initialMessage) return;
    setNewMessageText(initialMessage);
    onPrefillConsumed?.();
  }, [initialMessage, onPrefillConsumed]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || !auth.currentUser) {
      setUserSearchResults([]);
      setLoadingUsers(false);
      return;
    }

    let cancelled = false;
    setLoadingUsers(true);

    const timer = window.setTimeout(async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const needle = q.toLowerCase().replace(/^@/, '');
        const results = snap.docs
          .map((item) => item.data() as Partial<UserProfile>)
          .filter((profile) => profile.uid && profile.uid !== currentUser.uid && profile.profilePublic !== false)
          .filter((profile) =>
            String(profile.displayName || '').toLowerCase().includes(needle) ||
            String(profile.handle || '').toLowerCase().replace(/^@/, '').includes(needle)
          )
          .slice(0, 12)
          .map((profile) => ({
            uid: String(profile.uid),
            name: String(profile.displayName || profile.handle || 'Kullanıcı'),
            handle: String(profile.handle || '@kullanici'),
            photo: String(profile.photoURL || ''),
            verified: Boolean(profile.verified),
            role: String(profile.role || (profile.isArtist ? 'Sanatçı' : 'Kullanıcı')),
            lastMessage: 'Yeni sohbet',
            lastMessageAt: '',
            conversationId: buildConversationId(firebaseUid, String(profile.uid)),
            unreadCount: 0,
          }));

        if (!cancelled) setUserSearchResults(results);
      } catch (error) {
        console.warn('Message user search failed:', error);
        if (!cancelled) setUserSearchResults([]);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, firebaseUid]);

  const visiblePartners = useMemo(() => {
    const map = new Map<string, ChatPartner>();
    partners.forEach((partner) => map.set(partner.uid, partner));
    userSearchResults.forEach((partner) => map.set(partner.uid, partner));
    const q = search.trim().toLowerCase();

    return Array.from(map.values()).filter((partner) => {
      if (!q) return true;
      return (
        partner.name.toLowerCase().includes(q) ||
        partner.handle.toLowerCase().includes(q)
      );
    });
  }, [partners, userSearchResults, search]);

  const activePartner = partners.find((partner) => partner.uid === selectedPartnerUid)
    || userSearchResults.find((partner) => partner.uid === selectedPartnerUid)
    || (selectedPartnerUid === selfPartner.uid ? selfPartner : null);

  const activeConversationId = activePartner
    ? buildConversationId(firebaseUid, activePartner.uid)
    : '';

  const activeMessages = messages[activeConversationId] || [];

  useEffect(() => {
    if (!activeConversationId || !auth.currentUser || activeMessages.length === 0) return;

    const unread = activeMessages.filter(
      (message) => !message.isMine && !message.readBy.includes(auth.currentUser!.uid)
    );

    unread.forEach((message) => {
      updateDoc(doc(db, 'messages', message.id), {
        readBy: arrayUnion(auth.currentUser!.uid),
      }).catch(() => {});
    });
  }, [activeConversationId, activeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: activeMessages.length > 1 ? 'smooth' : 'auto' });
  }, [activeConversationId, activeMessages.length]);

  useEffect(() => {
    if (!activeConversationId || !activePartner?.uid || !auth.currentUser) {
      setTypingPartnerName('');
      return;
    }

    const typingRef = doc(
      db,
      'typing',
      activeConversationId + '__' + activePartner.uid
    );

    let clearTimer: number | null = null;

    return onSnapshot(typingRef, (snap) => {
      if (clearTimer) window.clearTimeout(clearTimer);

      if (!snap.exists()) {
        setTypingPartnerName('');
        return;
      }

      const data = snap.data() as {
        uid?: string;
        displayName?: string;
        updatedAt?: number;
      };
      const updatedAt = Number(data.updatedAt || 0);
      const remaining = 4000 - (Date.now() - updatedAt);

      if (
        data.uid !== auth.currentUser!.uid &&
        data.displayName &&
        remaining > 0
      ) {
        setTypingPartnerName(data.displayName);
        clearTimer = window.setTimeout(() => setTypingPartnerName(''), remaining);
      } else {
        setTypingPartnerName('');
      }
    }, () => setTypingPartnerName(''));
  }, [activeConversationId, activePartner?.uid]);

  useEffect(() => {
    if (!activeConversationId || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const typingId = activeConversationId + '__' + uid;

    return () => {
      deleteDoc(doc(db, 'typing', typingId)).catch(() => {});
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !auth.currentUser) return;

    const text = newMessageText.trim();
    const uid = auth.currentUser.uid;
    const typingId = activeConversationId + '__' + uid;
    const typingRef = doc(db, 'typing', typingId);

    if (!text) {
      deleteDoc(typingRef).catch(() => {});
      return;
    }

    const timer = window.setTimeout(() => {
      setDoc(typingRef, {
        uid,
        displayName: currentUser.displayName || currentUser.handle,
        conversationId: activeConversationId,
        participants: [uid, activePartner?.uid].filter(Boolean),
        updatedAt: Date.now(),
      }, { merge: true }).catch(() => {});
    }, 250);

    return () => window.clearTimeout(timer);
  }, [newMessageText, activeConversationId, activePartner?.uid, currentUser.displayName, currentUser.handle]);

  const handleSelectPartner = (partner: ChatPartner) => {
    setSendError('');
    setReactionOpenId('');
    setComposerEmojiOpen(false);
    setReplyingTo(null);
    setEditingMessageId('');
    setEditingText('');
    setSelectedPartnerUid(partner.uid);
    setUserSearchResults([]);
    setSearch('');
  };

  const handleReaction = async (message: ChatMessage, emoji: string) => {
    if (!auth.currentUser) return;
    const currentReaction = message.reactions?.[auth.currentUser.uid];
    setReactionOpenId('');
    try {
      await updateDoc(doc(db, 'messages', message.id), {
        ['reactions.' + auth.currentUser.uid]: currentReaction === emoji ? deleteField() : emoji,
      });
    } catch (error) {
      console.warn('Message reaction failed:', error);
      setSendError('Mesaj reaksiyonu kaydedilemedi. Firebase Rules bölümünü güncelle.');
    }
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!message.isMine) return;
    try {
      await deleteDoc(doc(db, 'messages', message.id));
    } catch (error) {
      console.warn('Message delete failed:', error);
      setSendError('Mesaj silinemedi. Firebase Rules bölümünü kontrol et.');
    }
  };

  const handleReplyMessage = (message: ChatMessage) => {
    setEditingMessageId('');
    setEditingText('');
    setReplyingTo(message);
  };

  const handleEditMessage = (message: ChatMessage) => {
    if (!message.isMine) return;
    setReplyingTo(null);
    setEditingMessageId(message.id);
    setEditingText(message.text);
    setNewMessageText(message.text);
    setActionOpenId('');
  };

  const handleCopyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setSendError('');
    } catch (error) {
      console.warn('Message copy failed:', error);
      setSendError('Mesaj kopyalanamadı.');
    }
    setActionOpenId('');
  };

  const handleCancelComposerMode = () => {
    setReplyingTo(null);
    setEditingMessageId('');
    setEditingText('');
    setNewMessageText('');
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const addComposerEmoji = (emoji: string) => {
    setNewMessageText((value) => value + emoji);
    setComposerEmojiOpen(false);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = newMessageText.trim();
    if (!auth.currentUser || !activePartner || !text || sending) return;

    if (editingMessageId) {
      setSending(true);
      setSendError('');

      try {
        await updateDoc(doc(db, 'messages', editingMessageId), {
          text,
          editedAt: new Date().toISOString(),
        });
        setEditingMessageId('');
        setEditingText('');
        setNewMessageText('');
      } catch (error: any) {
        console.warn('Message edit failed:', error);
        setSendError(
          error?.code === 'permission-denied'
            ? 'Mesaj düzenleme izni reddedildi. Firebase Rules güncel değil olabilir.'
            : 'Mesaj düzenlenemedi. Tekrar deneyebilirsin.'
        );
      } finally {
        setSending(false);
      }
      return;
    }

    const createdAt = new Date().toISOString();
    const senderUid = String(auth.currentUser.uid || firebaseUid || '');
    const recipientUid = String(activePartner.uid || '');
    const senderHandle = String(currentUser.handle || '@kullanici');
    const senderName = String(currentUser.displayName || currentUser.handle || 'Kullanıcı');
    const senderPhoto = String(currentUser.photoURL || '');
    const senderRole = currentUser.isArtist ? 'Sanatçı' : String(currentUser.role || 'Kullanıcı');
    const recipientHandle = String(activePartner.handle || '@kullanici');
    const recipientName = String(activePartner.name || activePartner.handle || 'Kullanıcı');
    const recipientPhoto = String(activePartner.photo || '');
    const recipientRole = String(activePartner.role || 'Kullanıcı');
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const conversationId = buildConversationId(senderUid, recipientUid);
    const participants = [senderUid, recipientUid].filter(Boolean);

    if (!senderUid || !recipientUid || !conversationId) return;

    setSending(true);
    setSendError('');

    const outgoing: ChatMessage = {
      id: messageId,
      senderId: senderUid,
      senderHandle,
      text,
      createdAt,
      isMine: true,
      readBy: [senderUid],
      reactions: {},
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderHandle: replyingTo.senderHandle,
            text: replyingTo.text,
          }
        : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), outgoing],
    }));

    try {
      const messagePayload = {
        id: messageId,
        conversationId,
        senderId: senderUid,
        senderHandle,
        senderName,
        senderPhoto,
        senderVerified: Boolean(currentUser.verified),
        senderRole,
        recipientId: recipientUid,
        recipientHandle,
        recipientName,
        recipientPhoto,
        recipientVerified: Boolean(activePartner.verified),
        recipientRole,
        text,
        readBy: [senderUid],
        reactions: {},
        ...(replyingTo ? {
          replyTo: {
            id: replyingTo.id,
            senderHandle: replyingTo.senderHandle,
            text: replyingTo.text,
          }
        } : {}),
        participants,
        createdAt,
      };

      await setDoc(doc(db, 'messages', messageId), messagePayload);
      setNewMessageText('');
      setReplyingTo(null);

      // Bildirim ayrı çalışır; bildirimdeki bir problem mesajın gönderilmesini bozmaz.
      if (recipientUid !== senderUid) {
        try {
          tattooStore.notifyMessage(
            recipientUid,
            senderHandle + ' sana bir mesaj gönderdi.'
          );
        } catch (notificationError) {
          console.warn('Message notification failed:', notificationError);
        }
      }
    } catch (error: any) {
      console.warn('Message send failed:', error);
      const errorCode = String(error?.code || '');
      const errorMessage =
        errorCode === 'permission-denied'
          ? 'Mesaj gönderme izni reddedildi. Firebase Rules güncel değil olabilir.'
          : errorCode === 'unauthenticated'
            ? 'Oturum doğrulanamadı. Sayfayı yenileyip tekrar giriş yap.'
            : errorCode === 'invalid-argument'
              ? 'Firebase mesaj verilerinde geçersiz bir değer aldı. Bu sürümde gönderim verisi güvenli hale getirildi; sayfayı yenileyip tekrar dene.'
              : 'Mesaj gönderilemedi. Tekrar deneyebilirsin.';
      setSendError(errorCode ? errorMessage + ' (' + errorCode.replace('firestore/', '') + ')' : errorMessage);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(
          (item) => item.id !== messageId
        ),
      }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0a0a0a] md:rounded-2xl md:border md:border-white/[0.08] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.35)] flex flex-col md:flex-row h-full min-h-0 md:h-[76vh] md:min-h-[560px]">
      <aside className={"w-full md:w-[330px] lg:w-[360px] shrink-0 border-r border-white/[0.08] bg-[#0b0b0b] flex-col " + (selectedPartnerUid ? 'hidden md:flex' : 'flex')}>
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[17px] font-bold text-white">Mesajlar</p>
              <p className="text-[10px] text-[#666] mt-0.5">Özel sohbetlerin</p>
            </div>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="w-8 h-8 rounded-full border border-white/10 text-[#777] hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer"
              aria-label="Aramayı temizle"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Kullanıcı ara..."
              className="w-full h-10 rounded-xl bg-[#151515] border border-white/[0.06] pl-10 pr-9 text-xs text-white placeholder:text-[#555] outline-none focus:border-white/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#666] hover:text-white cursor-pointer"
                aria-label="Aramayı temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isGuestAuth && (
            <div className="mx-4 mt-3 mb-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 text-xs font-bold">!</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white">Misafir hesap</p>
                  <p className="text-[10px] text-[#777] leading-relaxed mt-0.5">
                    Telefon ve bilgisayar arasında mesajların aynı hesapta görünmesi için Google ile giriş yap.
                  </p>
                  <button
                    type="button"
                    onClick={onRequestLogin}
                    className="mt-2 text-[10px] font-semibold text-white underline underline-offset-2 cursor-pointer"
                  >
                    Google ile giriş yap
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingUsers && search.trim().length >= 2 && (
            <div className="px-4 py-3 text-[10px] text-[#666]">Kullanıcılar aranıyor...</div>
          )}

          {visiblePartners.length === 0 ? (
            <div className="h-full flex items-center justify-center px-8 text-center">
              <div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-5 h-5 text-[#666]" />
                </div>
                <p className="text-sm font-semibold text-white">Henüz sohbet yok</p>
                <p className="text-[11px] text-[#666] mt-1 leading-relaxed">
                  Yukarıdaki aramadan bir kullanıcı bulup direkt mesaj gönderebilirsin.
                </p>
              </div>
            </div>
          ) : visiblePartners.map((partner) => {
            const active = partner.uid === selectedPartnerUid;
            const last = messages[partner.conversationId]?.slice(-1)[0];
            return (
              <button
                key={partner.uid}
                type="button"
                onClick={() => handleSelectPartner(partner)}
                className={"w-full px-4 py-3.5 flex items-center gap-3 text-left border-b border-white/[0.035] transition-colors cursor-pointer " + (active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]')}
              >
                <div className="relative shrink-0">
                  <img
                    src={partner.photo || avatarFallback}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  {partner.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-white text-black text-[8px] font-bold flex items-center justify-center px-1">
                      {partner.unreadCount > 9 ? '9+' : partner.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      {partner.name}
                      {partner.verified && <span className="text-[9px] text-sky-300">✓</span>}
                    </span>
                    <span className="text-[9px] text-[#555] shrink-0">{formatTime(last?.createdAt || partner.lastMessageAt)}</span>
                  </div>
                  <div className="text-[10px] text-[#666] mt-0.5 truncate">{partner.handle}</div>
                  <div className={"text-[10px] mt-0.5 truncate " + (partner.unreadCount > 0 ? 'text-white font-semibold' : 'text-[#777]')}>
                    {last?.text || partner.lastMessage}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className={"flex-1 min-w-0 min-h-0 bg-[#0d0d0d] flex-col " + (selectedPartnerUid ? 'flex' : 'hidden md:flex')}>
        {activePartner ? (
          <>
            <header className="h-[68px] shrink-0 px-4 border-b border-white/[0.08] bg-[#0d0d0d] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerUid('')}
                  className="md:hidden w-9 h-9 rounded-full text-white hover:bg-white/5 flex items-center justify-center cursor-pointer"
                  aria-label="Mesaj listesine dön"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCreator(activePartner.handle)}
                  className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                >
                  <img
                    src={activePartner.photo || avatarFallback}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      {activePartner.name}
                      {activePartner.verified && <span className="text-[9px] text-sky-300">✓</span>}
                    </div>
                    <div className={"text-[10px] truncate " + (typingPartnerName ? "text-white" : "text-[#666]")}>
                      {typingPartnerName ? typingPartnerName + " yazıyor..." : activePartner.handle}
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSelectCreator(activePartner.handle)}
                className="w-9 h-9 rounded-full text-[#777] hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer"
                aria-label="Profili aç"
              >
                <Info className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4">
              <div className="max-w-2xl mx-auto space-y-2 pb-3">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 sm:py-16 min-h-[260px]">
                    <img
                      src={activePartner.photo || avatarFallback}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border border-white/10 mb-3"
                    />
                    <p className="text-sm text-white font-medium">{activePartner.name}</p>
                    <p className="text-[10px] text-[#666] mt-1 max-w-[220px]">
                      {activePartner.handle} ile sohbeti başlat.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((message, index) => {
                    const previous = activeMessages[index - 1];
                    const sameSender = previous && previous.senderId === message.senderId;
                    return (
                      <div key={message.id} className={"flex " + (message.isMine ? 'justify-end' : 'justify-start') + (sameSender ? ' mt-0.5' : 'mt-3')}>
                        <div className={"max-w-[80%] sm:max-w-[68%] " + (message.isMine ? 'items-end' : 'items-start') + " flex flex-col"}>
                          <div className="relative group">
                            {message.replyTo && (
                              <div className={"mb-1 max-w-full rounded-xl border border-white/10 px-3 py-1.5 text-[9px] " + (message.isMine ? "bg-white/10 text-black/70" : "bg-white/[0.04] text-[#aaa]")}>
                                <div className="font-semibold truncate">@{message.replyTo.senderHandle.replace(/^@/, '')}</div>
                                <div className="truncate">{message.replyTo.text}</div>
                              </div>
                            )}
                            <div className={"px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap " + (message.isMine
                              ? 'bg-white text-black rounded-[20px] rounded-br-[6px]'
                              : 'bg-[#1b1b1b] text-[#f0f0f0] border border-white/[0.06] rounded-[20px] rounded-bl-[6px]')}>
                              {message.text}
                            </div>
                            <div className={"absolute -top-8 " + (message.isMine ? 'right-0' : 'left-0') + " flex items-center gap-1 rounded-full bg-[#1a1a1a] border border-white/10 px-1 py-1 shadow-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"}>
                              <button
                                type="button"
                                onClick={() => setReactionOpenId((id) => id === message.id ? '' : message.id)}
                                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
                                aria-label="Reaksiyon ekle"
                              >
                                <Smile className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReplyMessage(message)}
                                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
                                aria-label="Yanıtla"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(message)}
                                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
                                aria-label="Kopyala"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {message.isMine && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleEditMessage(message)}
                                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-[#aaa] hover:text-white cursor-pointer"
                                    aria-label="Düzenle"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(message)}
                                    className="w-7 h-7 rounded-full hover:bg-red-500/15 text-[#888] hover:text-red-300 flex items-center justify-center cursor-pointer"
                                    aria-label="Mesajı sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                            {reactionOpenId === message.id && (
                              <div className={"absolute -top-14 " + (message.isMine ? 'right-0' : 'left-0') + " flex items-center gap-1 rounded-full bg-[#111] border border-white/10 px-2 py-1 shadow-2xl z-30"}>
                                {['❤️', '😂', '😍', '🔥', '👏', '😮'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleReaction(message, emoji)}
                                    className="w-8 h-8 rounded-full hover:bg-white/10 text-sm flex items-center justify-center cursor-pointer"
                                    aria-label={emoji}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                            {message.reactions && Object.keys(message.reactions).length > 0 && (
                              <div className={"absolute -bottom-3 " + (message.isMine ? 'right-2' : 'left-2') + " flex items-center gap-1 rounded-full bg-[#171717] border border-white/10 px-2 py-0.5 shadow-lg"}>
                                {Array.from(new Set(Object.values(message.reactions))).slice(0, 3).map((emoji) => (
                                  <span key={emoji} className="text-[11px] leading-none">{emoji}</span>
                                ))}
                                {Object.keys(message.reactions).length > 3 && (
                                  <span className="text-[9px] text-[#aaa]">{Object.keys(message.reactions).length}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-[#555]">
                            <span>{formatTime(message.createdAt)}</span>
                            {message.editedAt && <span>· düzenlendi</span>}
                            {message.isMine && (
                              message.readBy.length > 1
                                ? <CheckCheck className="w-3 h-3 text-sky-300" />
                                : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {sendError && (
                  <div className="mx-auto max-w-lg mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 py-2 text-[10px] text-red-200 text-center">
                    {sendError}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="shrink-0 sticky bottom-0 z-20 px-3 sm:px-5 py-2.5 sm:py-3 border-t border-white/[0.08] bg-[#0b0b0b]/95 backdrop-blur-md pb-[max(0.65rem,env(safe-area-inset-bottom))]"
            >
              <div className="max-w-2xl mx-auto relative">
                {(replyingTo || editingMessageId) && (
                  <div className="mb-2 rounded-2xl border border-white/10 bg-[#151515] px-3 py-2 flex items-center gap-3">
                    <div className="w-1 self-stretch rounded-full bg-white/50" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-white">
                        {editingMessageId ? 'Mesajı düzenliyorsun' : 'Yanıtlıyorsun'}
                      </p>
                      <p className="text-[10px] text-[#777] truncate">
                        {editingMessageId ? editingText : replyingTo?.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelComposerMode}
                      className="w-7 h-7 rounded-full text-[#777] hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer"
                      aria-label="İptal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {composerEmojiOpen && (
                  <div className="absolute bottom-14 left-0 flex items-center gap-1 rounded-2xl bg-[#151515] border border-white/10 px-2 py-2 shadow-2xl z-30">
                    {['❤️', '😂', '😍', '🔥', '👏', '😮', '🥹', '🖤'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addComposerEmoji(emoji)}
                        className="w-9 h-9 rounded-xl hover:bg-white/10 text-base flex items-center justify-center cursor-pointer"
                        aria-label={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setComposerEmojiOpen((open) => !open)}
                    className="w-11 h-11 rounded-full text-[#888] hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Emoji ekle"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <textarea
                    rows={1}
                    value={newMessageText}
                    onChange={(event) => setNewMessageText(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Mesaj yaz..."
                    className="flex-1 min-w-0 max-h-28 min-h-11 resize-none rounded-[22px] bg-[#151515] border border-white/[0.08] px-4 py-2.5 text-[13px] leading-5 text-white placeholder:text-[#666] outline-none focus:border-white/20 transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || sending}
                    className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed hover:bg-[#ededed] transition-colors shrink-0"
                    aria-label="Mesajı gönder"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center px-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6 text-[#666]" />
              </div>
              <p className="text-base font-semibold text-white mt-4">Mesajların</p>
              <p className="text-xs text-[#666] mt-1 max-w-sm">
                Sol taraftan bir sohbet seç veya bir kullanıcı ara.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
