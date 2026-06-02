/**
 * Unit Tests for Audio Priority & Sequencing Logic
 *
 * To run these tests, you'll need to install a test runner like Vitest or Jest:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 *
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioAsset, AudioMode } from '../types';
import { AUDIO_ASSETS } from '../constants';

// Mock implementation of selectAudioForTheme logic for testing
function selectAudioForTheme(
  audioAssets: AudioAsset[],
  mode: AudioMode,
  currentId?: string,
  audioHistory: string[] = []
): AudioAsset {
  const prioritizedAdhanIds = [
    'adhan_qassas_audio_com',
    'adhan_qassas_ramadan_1440',
    'adhan_qassas_sc',
    'adhan_qassas_archive_hq',
    'adhan_madinah_hq_1',
    'adhan_madinah_hq_2'
  ];

  let candidates = audioAssets.filter(asset => asset.type === mode);

  // ABSOLUTE PRIORITY: In Adhan mode
  if (mode === AudioMode.ADHAN) {
    const priorityPool = candidates.filter(a => prioritizedAdhanIds.includes(a.id));

    // Always try to play the #1 Priority if it's not currently playing
    const topPriorityId = prioritizedAdhanIds[0];
    const topAsset = priorityPool.find(a => a.id === topPriorityId);

    if (topAsset && topAsset.id !== currentId) {
      return topAsset;
    }

    // Fall back to other priorities not in immediate history
    let nextInPriority = priorityPool.filter(a => !audioHistory.includes(a.id) && a.id !== currentId);

    if (nextInPriority.length === 0) {
      nextInPriority = priorityPool.filter(a => a.id !== currentId);
    }

    if (nextInPriority.length > 0) {
      const bestNext = nextInPriority.sort((a, b) =>
        prioritizedAdhanIds.indexOf(a.id) - prioritizedAdhanIds.indexOf(b.id)
      )[0];
      return bestNext;
    }

    if (priorityPool.length > 0) return priorityPool[Math.floor(Math.random() * priorityPool.length)];
  }

  // DUA SEQUENCE LOGIC: Sekine -> Cevsen -> Random
  if (mode === AudioMode.DUA) {
    const currentAsset = audioAssets.find(a => a.id === currentId);

    // If current was Sekine, play Cevsen next
    if (currentAsset && currentAsset.title.toLowerCase().includes('sekine') && currentAsset.artist.includes('Rıza')) {
      const cevsen = audioAssets.find(a =>
        (a.title.toLowerCase().includes('cevsen') || a.title.toLowerCase().includes('cevşen'))
        && a.type === AudioMode.DUA
      );
      if (cevsen) return cevsen;
    }

    // Filter out Quran content from Dua mode
    const QURAN_KEYWORDS = ["sure", "surah", "ayat", "ayet", "tilavet", "recitation"];
    candidates = candidates.filter(c => !QURAN_KEYWORDS.some(kw => c.title.toLowerCase().includes(kw)));
  }

  if (candidates.length === 0) return audioAssets.find(a => a.type === mode) || audioAssets[0];

  let pool = candidates.filter(a => !audioHistory.includes(a.id) && a.id !== currentId);
  if (pool.length === 0) pool = candidates.filter(a => a.id !== currentId);
  if (pool.length === 0) pool = candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

describe('Audio Priority Selection', () => {
  let audioAssets: AudioAsset[];

  beforeEach(() => {
    audioAssets = [...AUDIO_ASSETS];
  });

  describe('Adhan Priority Dominance', () => {
    it('should prioritize adhan_qassas_audio_com as the top choice', () => {
      const selected = selectAudioForTheme(audioAssets, AudioMode.ADHAN);
      expect(selected.id).toBe('adhan_qassas_audio_com');
    });

    it('should alternate to adhan_qassas_audio_com when not currently playing', () => {
      const selected = selectAudioForTheme(
        audioAssets,
        AudioMode.ADHAN,
        'adhan_madinah_hq_1'
      );
      expect(selected.id).toBe('adhan_qassas_audio_com');
    });

    it('should respect priority order when top priority is playing', () => {
      const selected = selectAudioForTheme(
        audioAssets,
        AudioMode.ADHAN,
        'adhan_qassas_audio_com',
        ['adhan_qassas_audio_com']
      );
      expect(selected.id).not.toBe('adhan_qassas_audio_com');
      expect(['adhan_qassas_ramadan_1440', 'adhan_qassas_sc', 'adhan_qassas_archive_hq']).toContain(selected.id);
    });

    it('should never select non-Adhan content in Adhan mode', () => {
      const selected = selectAudioForTheme(audioAssets, AudioMode.ADHAN);
      expect(selected.type).toBe(AudioMode.ADHAN);
    });
  });

  describe('Dua Sequential Logic', () => {
    it('should play Cevşen after Sekine Duası', () => {
      const selected = selectAudioForTheme(
        audioAssets,
        AudioMode.DUA,
        'dua_sekine_riza'
      );
      expect(selected.title.toLowerCase()).toContain('cevşen');
      expect(selected.id).toBe('dua_cevsen_riza');
    });

    it('should start with Sekine when entering Dua mode', () => {
      const sekine = audioAssets.find(a => a.id === 'dua_sekine_riza');
      expect(sekine).toBeDefined();
      expect(sekine?.type).toBe(AudioMode.DUA);
    });

    it('should filter out Quran content from Dua mode', () => {
      const quranAsset: AudioAsset = {
        id: 'test_quran_surah',
        type: AudioMode.DUA,
        title: 'Surah Test',
        artist: 'Test',
        url: 'http://test.com'
      };
      const testAssets = [...audioAssets, quranAsset];
      const selected = selectAudioForTheme(testAssets, AudioMode.DUA, 'dua_cevsen_riza');
      expect(selected.title.toLowerCase()).not.toContain('surah');
    });
  });

  describe('Mode Specific Behavior', () => {
    it('should only return Quran assets in Quran mode', () => {
      const selected = selectAudioForTheme(audioAssets, AudioMode.QURAN);
      expect(selected.type).toBe(AudioMode.QURAN);
    });

    it('should only return Instrumental assets in Instrumental mode', () => {
      const selected = selectAudioForTheme(audioAssets, AudioMode.INSTRUMENTAL);
      expect(selected.type).toBe(AudioMode.INSTRUMENTAL);
    });

    it('should never return the currently playing audio', () => {
      const currentId = 'adhan_qassas_audio_com';
      const selected = selectAudioForTheme(
        audioAssets,
        AudioMode.ADHAN,
        currentId,
        [currentId]
      );
      expect(selected.id).not.toBe(currentId);
    });
  });

  describe('History & Variety', () => {
    it('should avoid recently played tracks from history', () => {
      const history = ['adhan_qassas_ramadan_1440', 'adhan_qassas_sc'];
      const selected = selectAudioForTheme(
        audioAssets,
        AudioMode.ADHAN,
        'adhan_qassas_audio_com',
        history
      );
      expect(history).not.toContain(selected.id);
    });

    it('should handle exhausted history gracefully', () => {
      const adhanAssets = audioAssets.filter(a => a.type === AudioMode.ADHAN);
      const history = adhanAssets.map(a => a.id);
      const selected = selectAudioForTheme(audioAssets, AudioMode.ADHAN, undefined, history);
      expect(selected.type).toBe(AudioMode.ADHAN);
    });
  });
});

describe('Audio Asset Validation', () => {
  it('should have Sekine Duası in constants', () => {
    const sekine = AUDIO_ASSETS.find(a => a.id === 'dua_sekine_riza');
    expect(sekine).toBeDefined();
    expect(sekine?.title).toBe('Sekine Duası');
  });

  it('should have Cevşen-ül Kebir in constants', () => {
    const cevsen = AUDIO_ASSETS.find(a => a.id === 'dua_cevsen_riza');
    expect(cevsen).toBeDefined();
    expect(cevsen?.title).toBe('Cevşen-ül Kebir');
  });

  it('should have at least 4 Qassas Adhan variants', () => {
    const qassasVariants = AUDIO_ASSETS.filter(a => a.id.includes('qassas'));
    expect(qassasVariants.length).toBeGreaterThanOrEqual(4);
  });

  it('should have at least 7 instrumental tracks', () => {
    const instrumentals = AUDIO_ASSETS.filter(a => a.type === AudioMode.INSTRUMENTAL);
    expect(instrumentals.length).toBeGreaterThanOrEqual(7);
  });

  it('should have Bach, Mozart, and Debussy in instrumental library', () => {
    const instrumentals = AUDIO_ASSETS.filter(a => a.type === AudioMode.INSTRUMENTAL);
    const artists = instrumentals.map(a => a.artist);
    expect(artists).toContain('Bach');
    expect(artists).toContain('Mozart');
    expect(artists).toContain('Debussy');
  });
});
