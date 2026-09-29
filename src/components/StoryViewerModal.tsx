import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { Story, UserProfile } from '../types';
import { tattooStore } from '../services/tattooStore';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryId: string;
  currentUser: UserProfile;
  onClose: () => void;
  onChanged: () => void;
  onToast: (msg: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryId,
  currentUser,
  onClose,
  onChanged,
  onToast,
}) => {
  const activeStories = useMemo(
    () => stories
      .filter((story) => new Date(story.expiresAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [stories]
  );
  const initialIndex = Math.max(0, activeStories.findIndex((story) => story.id === initialStoryId));
  const [index, setIndex] = useState(initialIndex);
  const story = activeStories[index];

  useEffect(() => {
    if (!story) {
      onClose();
      return;
    }
    tattooStore.viewStory(story.id);
    onChanged();
  }, [story?.id]);

  useEffect(() => {
    if (!story) return;
    const timer = window.setTimeout(() => {
      if (index >= activeStories.length - 1) onClose();
      else setIndex((value) => value + 1);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [story?.id, index, activeStories.length, onClose]);

  if (!story) return null;

  const creatorStories = activeStories.filter((item) => item.creatorId === story.creatorId);
  const creatorPosition = Math.max(0, creatorStories.findIndex((item) => item.id === story.id));

  const jumpPrevious = () => setIndex((value) => Math.max(0, value - 1));
  const jumpNext = () => {
    if (index >= activeStories.length - 1) onClose();
    else setIndex((value) => value + 1);
  };

  const handleDelete = async () => {
    const ok = await tattooStore.deleteStory(story.id);
    if (!ok) {
      onToast('Bu hikâyeyi silemezsin.');
      return;
    }
    onChanged();
    onToast('Hikâye silindi.');
    const nextLength = activeStories.length - 1;
    if (nextLength <= 0) {
      onClose();
      return;
    }
    setIndex((value) => Math.min(value, nextLength - 1));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div
        className="relative h-full w-full sm:h-[92vh] sm:max-w-[480px] sm:rounded-3xl overflow-hidden bg-[#090909] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={story.mediaUrl}
          alt={story.creatorHandle + ' hikâyesi'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 z-10">
          <div className="flex gap-1 mb-3">
            {creatorStories.map((item, itemIndex) => (
              <div key={item.id} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className={"h-full rounded-full " + (itemIndex <= creatorPosition ? 'bg-white' : 'bg-white/15')}
                  style={{ width: itemIndex <= creatorPosition ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <img src={story.creatorPhoto || './images/users/avatar_inkedlife.jpg'} alt="" className="w-9 h-9 rounded-full object-cover border border-white/30" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{story.creatorHandle}</p>
                <p className="text-[9px] text-white/60">
                  {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 24 saat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {story.creatorId === currentUser.uid && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                  aria-label="Hikâyeyi sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-black/40 text-white hover:bg-white/10 cursor-pointer" aria-label="Kapat">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {story.text && (
          <div className="absolute inset-x-8 bottom-16 z-10">
            <div className="rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 px-4 py-3 text-center text-base sm:text-lg font-semibold text-white whitespace-pre-wrap break-words">
              {story.text}
            </div>
          </div>
        )}

        <button type="button" onClick={jumpPrevious} className="absolute left-0 top-16 bottom-0 w-1/3 cursor-pointer" aria-label="Önceki hikâye" />
        <button type="button" onClick={jumpNext} className="absolute right-0 top-16 bottom-0 w-1/3 cursor-pointer" aria-label="Sonraki hikâye" />

        <ChevronLeft className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 text-white/70" />
        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 text-white/70" />
      </div>
    </div>
  );
};
