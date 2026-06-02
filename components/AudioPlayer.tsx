
import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { AudioAsset, AudioMode } from '../types';

interface AudioPlayerProps {
  asset: AudioAsset;
  mode: AudioMode;
  isPlaying: boolean;
  volume: number; // 0 to 1
  onError?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ asset, mode, isPlaying, volume, onError }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use native HTML5 Audio for specific providers (like Audio.com) that might have CORS issues 
  // or opaque response types that ReactPlayer's XHR/Fetch logic struggles with.
  // HTML5 <audio> tags are allowed to play cross-origin resources without CORS headers.
  const useNativePlayer = asset.url.includes('audio.com');

  useEffect(() => {
    if (useNativePlayer && audioRef.current) {
        audioRef.current.volume = volume;

        if (isPlaying) {
            if (audioRef.current.paused) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.warn("Native Audio play failed:", error.message || error);
                    });
                }
            }
        } else {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
            }
        }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [isPlaying, volume, useNativePlayer, asset.url]);

  if (useNativePlayer) {
      return (
          <audio 
            ref={audioRef}
            src={asset.url}
            loop
            preload="auto"
            onError={(e) => {
                // Avoid logging the circular event object 'e'
                const errorMsg = e.currentTarget.error 
                    ? `Code: ${e.currentTarget.error.code}, Message: ${e.currentTarget.error.message}`
                    : 'Unknown error';
                console.warn(`Native Audio Error for ${asset.url}:`, errorMsg);
                if (onError) onError();
            }}
            style={{ display: 'none' }}
          />
      );
  }

  // Cast ReactPlayer to any to avoid TS errors with 'url' prop not existing on inferred types in some environments
  const Player = ReactPlayer as unknown as React.ComponentType<any>;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: '-10000px', 
        left: '-10000px', 
        width: '1px', 
        height: '1px', 
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0 
      }}
    >
      <Player
        url={asset.url}
        playing={isPlaying}
        loop={true}
        volume={volume}
        width="100%"
        height="100%"
        playsinline={true}
        onError={(e: any) => {
           // Avoid logging 'e' directly as it might be an Event object with circular refs
          console.warn(`Audio Playback Error: ${asset.url}`);
          if (onError) onError();
        }}
        // Provider specific configs
        config={{
          soundcloud: {
            options: { auto_play: true }
          },
          file: { 
            forceAudio: true,
            attributes: {
              controls: false,
              preload: 'auto'
            }
          }
        }}
      />
    </div>
  );
};
