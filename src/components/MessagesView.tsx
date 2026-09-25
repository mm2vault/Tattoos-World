import React, { useEffect, useMemo, useState } from 'react';
import { Send, CheckCircle2, Info, Search } from 'lucide-react';
import { UserProfile } from '../types';
import { tattooStore } from '../services/tattooStore';
import { db, auth } from '../services/firebase';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';

interface MessagesViewProps {
  currentUser: UserProfile;
  onSelectCreator: (handle: string) => void;
  initialCreatorHandle?: string | null;
  initialMessage?: string;
  onPrefillConsumed?: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  text: string;
  createdAt: string;
  isMine: boolean;
}

interface ChatPartner {
  uid: string;
  name: string;
  handle: string;
  photo: string;
  verified: boolean;
  role: string;
  lastMessage: string;
  time: string;
  conversationId: string;
}

const buildConversationId = (a: string, b: string) => [a, b].sort().join('__');

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  onSelectCreator,
  initialCreatorHandle,
  initialMessage = '',
  onPrefillConsumed,
}) => {
  const tattooCreators = useMemo(() => {
    const map = new Map<string, ChatPartner>();
    tattooStore.getTattoos().forEach((tattoo) => {
      if (!tattoo.creatorId || !tattoo.creatorHandle || tattoo.creatorId === currentUser.uid) return;
      if (map.has(tattoo.creatorId)) return;
      map.set(tattoo.creatorId, {
        uid: tattoo.creatorId,
        name: tattoo.creatorName,
        handle: tattoo.creatorHandle,
        photo: tattoo.creatorPhoto || '',
        verified: Boolean(tattoo.creatorVerified),
        role: tattoo.creatorRole || 'Topluluk üyesi',
        lastMessage: 'Yeni bir sohbet başlat',
        time: '',
        conversationId: buildConversationId(currentUser.uid, tattoo.creatorId),
      });
    });
    return map;
  }, [currentUser.uid]);

  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [selectedPartnerUid, setSelectedPartnerUid] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [newMessageText, setNewMessageText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPartners(Array.from(tattooCreators.values()));
  }, [tattooCreators]);

  useEffect(() => {
    if (!initialCreatorHandle) return;
    const match = Array.from(tattooCreators.values()).find(
      (p) => p.handle.toLowerCase() === initialCreatorHandle.toLowerCase()
    );
    if (match) setSelectedPartnerUid(match.uid);
  }, [initialCreatorHandle, tattooCreators]);

  useEffect(() => {
    if (initialMessage) {
      setNewMessageText(initialMessage);
      onPrefillConsumed?.();
    }
  }, [initialMessage, onPrefillConsumed]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const messageQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      messageQuery,
      (snap) => {
        const byConversation: Record<string, ChatMessage[]> = {};
        const partnerMeta = new Map<string, ChatPartner>();

        snap.docs.forEach((item) => {
          const data = item.data() as {
            conversationId?: string;
            senderId: string;
            senderHandle: string;
            text: string;
            createdAt?: string;
            participants?: string[];
            recipientId?: string;
            recipientHandle?: string;
            recipientName?: string;
            recipientPhoto?: string;
            recipientVerified?: boolean;
            recipientRole?: string;
          };

          const participants = data.participants || [];
          const partnerUid =
            participants.find((uid) => uid !== auth.currentUser!.uid) ||
            data.recipientId ||
            '';
          const conversationId =
            data.conversationId ||
            (partnerUid ? buildConversationId(auth.currentUser!.uid, partnerUid) : item.id);

          const createdAt = data.createdAt || '';
          const message: ChatMessage = {
            id: item.id,
            senderId: data.senderId,
            senderHandle: data.senderHandle,
            text: data.text,
            createdAt,
            isMine: data.senderId === auth.currentUser!.uid,
          };

          if (!byConversation[conversationId]) byConversation[conversationId] = [];
          byConversation[conversationId].push(message);

          if (partnerUid && data.recipientHandle) {
            partnerMeta.set(partnerUid, {
              uid: partnerUid,
              name: data.recipientName || data.recipientHandle,
              handle: data.recipientHandle,
              photo: data.recipientPhoto || '',
              verified: Boolean(data.recipientVerified),
              role: data.recipientRole || 'Topluluk üyesi',
              lastMessage: data.text,
              time: createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              conversationId,
            });
          }
        });

        Object.entries(byConversation).forEach(([conversationId, list]) => {
          list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          const last = list[list.length - 1];
          const partnerUid = conversationId.split('__').find((uid) => uid !== auth.currentUser!.uid) || '';
          if (partnerUid && !partnerMeta.has(partnerUid)) {
            const fallback = tattooCreators.get(partnerUid);
            if (fallback) {
              partnerMeta.set(partnerUid, {
                ...fallback,
                lastMessage: last?.text || fallback.lastMessage,
                time: last?.createdAt
                  ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : fallback.time,
              });
            }
          }
        });

        const mergedPartners = new Map<string, ChatPartner>(tattooCreators);
        partnerMeta.forEach((value, key) => mergedPartners.set(key, value));
        const sortedPartners = Array.from(mergedPartners.values()).sort((a, b) =>
          String(b.time).localeCompare(String(a.time))
        );

        setPartners(sortedPartners);
        setMessages(byConversation);
        setSelectedPartnerUid((current) => current || sortedPartners[0]?.uid || '');
      },
      (error) => console.warn('Realtime messages could not be loaded:', error)
    );

    return unsubscribe;
  }, [currentUser.uid, tattooCreators]);

  const filteredPartners = partners.filter((partner) => {
    const q = search.trim().toLowerCase();
    return !q || partner.name.toLowerCase().includes(q) || partner.handle.toLowerCase().includes(q);
  });

  const activePartner = partners.find((partner) => partner.uid === selectedPartnerUid) || null;
  const activeConversationId = activePartner ? buildConversationId(currentUser.uid, activePartner.uid) : '';
  const activeMessages = messages[activeConversationId] || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !activePartner || !newMessageText.trim()) return;

    const text = newMessageText.trim();
    const createdAt = new Date().toISOString();
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    try {
      await setDoc(doc(db, 'messages', messageId), {
        id: messageId,
        conversationId: activeConversationId,
        senderId: auth.currentUser.uid,
        senderHandle: currentUser.handle,
        recipientId: activePartner.uid,
        recipientHandle: activePartner.handle,
        recipientName: activePartner.name,
        recipientPhoto: activePartner.photo,
        recipientVerified: activePartner.verified,
        recipientRole: activePartner.role,
        text,
        participants: [auth.currentUser.uid, activePartner.uid],
        createdAt,
      });
      setNewMessageText('');
    } catch (error) {
      console.warn('Message was not saved:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-2xl flex flex-col md:flex-row h-[calc(100dvh-7rem)] md:h-[72vh] min-h-[520px]">
      <div className="w-full md:w-64 lg:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="p-4 border-b border-white/10 space-y-3">
          <div>
            <h2 className="text-base font-bold text-white font-display">Mesajlar</h2>
            <p className="text-[11px] text-[#777777]">Gerçek topluluk sohbetleri</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sanatçı veya kullanıcı ara..." className="w-full bg-[#151515] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-[11px] text-white placeholder-[#666666] focus:outline-none focus:border-white/25" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredPartners.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-[#777777] leading-relaxed">
                Henüz mesajlaşabileceğin bir topluluk üyesi yok.
                <br />
                Bir sanatçının dövmesine girip <span className="text-white">Randevu Mesajı</span> butonuna bas.
              </p>
            </div>
          ) : filteredPartners.map((partner) => {
            const selected = partner.uid === selectedPartnerUid;
            const conversation = messages[partner.conversationId] || [];
            const last = conversation[conversation.length - 1];
            return (
              <button
                key={partner.uid}
                onClick={() => setSelectedPartnerUid(partner.uid)}
                className={"w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer " + (selected ? 'bg-white/10' : 'hover:bg-white/5')}
              >
                <div className="relative shrink-0">
                  {partner.photo ? <img src={partner.photo} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-white/15" /> : <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold">{partner.name.charAt(0).toUpperCase()}</div>}
                  {partner.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 bg-black rounded-full absolute -bottom-0.5 -right-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{partner.name}</h4>
                    <span className="text-[10px] text-[#777777] shrink-0">{last?.createdAt ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : partner.time}</span>
                  </div>
                  <p className="text-[11px] text-[#888888] font-mono truncate">{partner.handle}</p>
                  <p className="text-[11px] text-[#AAAAAA] truncate mt-0.5">{last?.text || partner.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between bg-[#0e0e0e] min-w-0">
        {activePartner ? (
          <>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
              <button onClick={() => onSelectCreator(activePartner.handle)} className="flex items-center gap-3 cursor-pointer group min-w-0 text-left">
                {activePartner.photo ? <img src={activePartner.photo} alt={activePartner.name} className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0" /> : <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">{activePartner.name.charAt(0).toUpperCase()}</div>}
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white group-hover:underline truncate flex items-center gap-1.5">{activePartner.name}{activePartner.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}</h3>
                  <p className="text-[10px] text-[#888888] truncate">{activePartner.role}</p>
                </div>
              </button>
              <button onClick={() => onSelectCreator(activePartner.handle)} className="p-2 rounded-full text-[#888888] hover:bg-white/5 hover:text-white transition-colors" title="Profili Aç" aria-label="Profili Aç"><Info className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
              {activeMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center px-6">
                  <p className="text-xs text-[#666666] leading-relaxed">{activePartner.name} ile yeni bir sohbet başlat.</p>
                </div>
              ) : activeMessages.map((msg) => (
                <div key={msg.id} className={"flex flex-col " + (msg.isMine ? 'items-end' : 'items-start')}>
                  <div className={"max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed " + (msg.isMine ? 'bg-white text-black font-medium rounded-br-none' : 'bg-[#1a1a1a] text-[#E0E0E0] border border-white/10 rounded-bl-none')}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#666666] mt-1 px-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3.5 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={'@' + activePartner.handle.replace(/^@/, '') + ' kullanıcısına mesaj yaz...'}
                className="flex-1 bg-[#161616] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30"
              />
              <button type="submit" disabled={!newMessageText.trim()} className="p-2.5 rounded-full bg-white text-black hover:bg-[#EAEAEA] disabled:opacity-40 transition-all cursor-pointer shrink-0" aria-label="Gönder"><Send className="w-4 h-4" /></button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <Info className="w-8 h-8 mx-auto mb-3 text-[#555555]" />
              <p className="text-sm text-white">Henüz bir sohbet seçilmedi.</p>
              <p className="text-xs text-[#666666] mt-1">Bir sanatçının profilinden mesaj başlatabilirsin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
