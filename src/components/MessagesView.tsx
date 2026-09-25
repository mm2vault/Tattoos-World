import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2, Phone, Video, Info } from 'lucide-react';
import { UserProfile } from '../types';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';

interface MessagesViewProps {
  currentUser: UserProfile;
  onSelectCreator: (handle: string) => void;
  initialCreatorHandle?: string | null;
}

interface MessageItem {
  id: string;
  senderHandle: string;
  text: string;
  time: string;
  isMine: boolean;
  senderId?: string;
  createdAt?: string;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  onSelectCreator,
  initialCreatorHandle,
}) => {
  const conversations = [
    {
      id: 'c1',
      artistUid: 'artist_inkedlife',
      artistName: 'Marco Vance',
      artistHandle: '@inkedlife',
      artistPhoto: './images/users/avatar_inkedlife.jpg',
      verified: true,
      role: 'Tattoo Artist',
      lastMessage: 'Kol kaplama tasarımınız için randevu oluşturdum!',
      time: '14:20',
      unread: 1,
      initialMessages: [
        {
          id: 'm1',
          senderHandle: '@inkedlife',
          text: 'Merhaba! Lion & Clock dövme tasarımını beğendiğiniz için teşekkürler.',
          time: '12:30',
          isMine: false,
        },
        {
          id: 'm2',
          senderHandle: currentUser.handle,
          text: 'Merhaba Marco! Gerçekten harika bir işçilik. Ben de benzer bir kol sleeve dövmesi yaptırmak istiyorum, randevu durumunuz nedir?',
          time: '13:15',
          isMine: true,
        },
        {
          id: 'm3',
          senderHandle: '@inkedlife',
          text: 'Önümüzdeki ayın ilk haftasında boş yerim var. Stüdyomuz Kadıköy\'de. Kol kaplama tasarımınız için randevu oluşturdum!',
          time: '14:20',
          isMine: false,
        },
      ],
    },
    {
      id: 'c2',
      artistUid: 'artist_luna',
      artistName: 'Luna Valery',
      artistHandle: '@lunatattoos',
      artistPhoto: './images/users/avatar_luna.jpg',
      verified: true,
      role: 'Fine Line Specialist',
      lastMessage: 'Minimal kelebek çizimi hazır! Önümüzdeki hafta uygun musunuz?',
      time: 'Dün',
      unread: 0,
      initialMessages: [
        {
          id: 'm21',
          senderHandle: '@lunatattoos',
          text: 'Minimal kelebek çizimi hazır! Önümüzdeki hafta uygun musunuz?',
          time: 'Dün 18:45',
          isMine: false,
        },
      ],
    },
    {
      id: 'c3',
      artistUid: 'artist_darksoul',
      artistName: 'Damian Black',
      artistHandle: '@darksoul',
      artistPhoto: './images/users/avatar_inkedlife.jpg',
      verified: true,
      role: 'Dark / Blackwork',
      lastMessage: 'Yeni serpent eskizlerini profilimde paylaştım, göz atabilirsiniz.',
      time: '2 gün önce',
      unread: 0,
      initialMessages: [
        {
          id: 'm31',
          senderHandle: '@darksoul',
          text: 'Yeni serpent eskizlerini profilimde paylaştım, göz atabilirsiniz.',
          time: '2 gün önce',
          isMine: false,
        },
      ],
    },
  ];

  const [selectedConvId, setSelectedConvId] = useState(conversations[0].id);
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>({
    c1: conversations[0].initialMessages,
    c2: conversations[1].initialMessages,
    c3: conversations[2].initialMessages,
  });
  const [newMessageText, setNewMessageText] = useState('');

  useEffect(() => {
    if (!initialCreatorHandle) return;
    const target = conversations.find(
      (conv) => conv.artistHandle.toLowerCase() === initialCreatorHandle.toLowerCase()
    );
    if (target) setSelectedConvId(target.id);
  }, [initialCreatorHandle]);

  useEffect(() => {
    if (!auth.currentUser) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'messages'), where('participants', 'array-contains', auth.currentUser!.uid))
        );

        const remoteByConv: Record<string, MessageItem[]> = {};
        snap.docs.forEach((item) => {
          const data = item.data() as {
            conversationId: string;
            senderId: string;
            senderHandle: string;
            text: string;
            createdAt?: string;
          };
          const convId = data.conversationId;
          if (!remoteByConv[convId]) remoteByConv[convId] = [];
          remoteByConv[convId].push({
            id: item.id,
            senderHandle: data.senderHandle,
            text: data.text,
            time: data.createdAt
              ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            isMine: data.senderId === auth.currentUser!.uid,
            senderId: data.senderId,
            createdAt: data.createdAt,
          });
        });

        if (!cancelled) {
          setMessages((prev) => {
            const next = { ...prev };
            Object.entries(remoteByConv).forEach(([convId, remote]) => {
              const local = next[convId] || [];
              const byId = new Map(local.map((m) => [m.id, m]));
              remote.forEach((m) => byId.set(m.id, m));
              next[convId] = Array.from(byId.values()).sort(
                (a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')
              );
            });
            return next;
          });
        }
      } catch (err) {
        console.warn('Messages could not be loaded from Firestore:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser.uid]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const activeMessages = messages[selectedConvId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const text = newMessageText.trim();
    const messageId = 'msg_' + Date.now();
    const createdAt = new Date().toISOString();
    const newMsg: MessageItem = {
      id: messageId,
      senderHandle: currentUser.handle,
      text,
      time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      senderId: currentUser.uid,
      createdAt,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
    }));
    setNewMessageText('');

    if (auth.currentUser) {
      setDoc(doc(db, 'messages', messageId), {
        conversationId: selectedConvId,
        senderId: auth.currentUser.uid,
        senderHandle: currentUser.handle,
        text,
        participants: [auth.currentUser.uid, activeConv.artistUid],
        createdAt,
      }).catch((err) => {
        console.warn('Message was not saved to Firestore:', err);
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-2xl flex flex-col md:flex-row h-[72vh] min-h-[550px]">
      
      {/* Left Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white font-display">Mesajlar</h2>
          <p className="text-[11px] text-[#777777]">Sanatçılar ve Dövme Tutkunları</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {conversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.artistPhoto}
                    alt={conv.artistName}
                    className="w-10 h-10 rounded-full object-cover border border-white/15"
                  />
                  {conv.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 bg-black rounded-full absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">
                      {conv.artistName}
                    </h4>
                    <span className="text-[10px] text-[#777777]">{conv.time}</span>
                  </div>
                  <p className="text-[11px] text-[#888888] font-mono truncate">
                    {conv.artistHandle}
                  </p>
                  <p className="text-[11px] text-[#AAAAAA] truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Active Chat Pane */}
      <div className="flex-1 flex flex-col justify-between bg-[#0e0e0e]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
          <div
            onClick={() => onSelectCreator(activeConv.artistHandle)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={activeConv.artistPhoto}
              alt={activeConv.artistName}
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <div>
              <h3 className="text-xs font-bold text-white group-hover:underline flex items-center gap-1.5">
                {activeConv.artistName}
                {activeConv.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </h3>
              <p className="text-[10px] text-[#888888]">{activeConv.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#888888]">
            <button
              type="button"
              onClick={() => window.alert('Sesli arama özelliği henüz bağlı değil.')}
              className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors"
              title="Ara"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => window.alert('Görüntülü arama özelliği henüz bağlı değil.')}
              className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors"
              title="Video"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectCreator(activeConv.artistHandle)}
              className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors"
              title="Profil"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.isMine
                    ? 'bg-white text-black font-medium rounded-br-none shadow'
                    : 'bg-[#1a1a1a] text-[#E0E0E0] border border-white/10 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#666666] mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Send Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-[#161616] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={!newMessageText.trim()}
            className="p-2.5 rounded-full bg-white text-black hover:bg-[#EAEAEA] disabled:opacity-40 transition-all cursor-pointer"
            aria-label="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
