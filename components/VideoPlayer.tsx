
import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { VideoAsset } from '../types';

interface VideoPlayerProps {
  asset: VideoAsset;
  isPaused: boolean;
  onError?: () => void;
}

interface VideoBufferState {
  url: string;
  isReady: boolean;
}

const isYouTube = (url: string): boolean =>
  url.includes('youtube.com') || url.includes('youtu.be');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ asset, isPaused, onError }) => {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const [activeRef, setActiveRef] = useState<'A' | 'B'>('A');
  const [videoA, setVideoA] = useState<VideoBufferState>({ url: asset.url, isReady: true });
  const [videoB, setVideoB] = useState<VideoBufferState>({ url: '', isReady: false });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(isYouTube(asset.url) ? asset.url : null);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [showYoutube, setShowYoutube] = useState(isYouTube(asset.url));

  useEffect(() => {
    if (isYouTube(asset.url)) {
      setShowYoutube(false);
      setYoutubeReady(false);
      setYoutubeUrl(asset.url);
    } else {
      setShowYoutube(false);
      setYoutubeUrl(null);
      setYoutubeReady(false);

      const currentUrl = activeRef === 'A' ? videoA.url : videoB.url;
      if (asset.url !== currentUrl) {
        if (activeRef === 'A') {
          setVideoB({ url: asset.url, isReady: false });
        } else {
          setVideoA({ url: asset.url, isReady: false });
        }
      }
    }
  }, [asset.url]);

  useEffect(() => {
    if (youtubeReady && youtubeUrl) {
      setShowYoutube(true);
    }
  }, [youtubeReady, youtubeUrl]);

  useEffect(() => {
    if (showYoutube) return;
    const activeElement = activeRef === 'A' ? videoRefA.current : videoRefB.current;
    if (activeElement) {
      if (isPaused) {
        activeElement.pause();
      } else {
        activeElement.play().catch(() => {});
      }
    }
  }, [isPaused, activeRef, showYoutube]);

  const handleCanPlayThrough = (target: 'A' | 'B') => {
    if ((target === 'A' && activeRef === 'B') || (target === 'B' && activeRef === 'A')) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveRef(target);
        setTimeout(() => {
          setIsTransitioning(false);
          if (target === 'A' && videoRefB.current) {
            videoRefB.current.pause();
          } else if (target === 'B' && videoRefA.current) {
            videoRefA.current.pause();
          }
        }, 1000);
      }, 50);
    }
  };

  const handleError = (target: 'A' | 'B') => {
    console.warn(`Video buffering error on Ref ${target}. Triggering failover.`);
    if (onError) onError();
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0 overflow-hidden">
      {/* YouTube Player */}
      {youtubeUrl && (
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${showYoutube ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <ReactPlayer
            url={youtubeUrl}
            playing={showYoutube && !isPaused}
            muted
            loop
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%' }}
            onReady={() => setYoutubeReady(true)}
            onError={() => {
              console.warn('YouTube playback error:', youtubeUrl);
              if (onError) onError();
            }}
            config={{
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                disablekb: 1,
                fs: 0,
                cc_load_policy: 0,
                playsinline: 1
              }
            }}
          />
        </div>
      )}

      {/* MP4 Video A */}
      <video
        ref={videoRefA}
        src={!isYouTube(videoA.url) ? videoA.url : undefined}
        className={`absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full max-w-none transform -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-in-out ${!showYoutube && activeRef === 'A' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        autoPlay
        loop
        muted
        playsInline
        onCanPlayThrough={() => handleCanPlayThrough('A')}
        onError={() => handleError('A')}
      />

      {/* MP4 Video B */}
      <video
        ref={videoRefB}
        src={!isYouTube(videoB.url) ? videoB.url : undefined}
        className={`absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full max-w-none transform -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-in-out ${!showYoutube && activeRef === 'B' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        autoPlay
        loop
        muted
        playsInline
        onCanPlayThrough={() => handleCanPlayThrough('B')}
        onError={() => handleError('B')}
      />

      {/* Cinematic Scrims for Readability */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none mix-blend-multiply z-20" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none mix-blend-multiply z-20" />
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-20" />
    </div>
  );
};
