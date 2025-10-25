'use client';

import { api } from '@/lib/api';

export default function VideoFeed() {
  const videoUrl = api.getVideoFeedUrl();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-3xl overflow-hidden">
      <img
        src={videoUrl}
        alt="Live emotion detection feed"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
