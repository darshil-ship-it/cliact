'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Content, text } from '@/types/cms';
import { contentMediaUrl, mediaUrl } from '@/lib/validators';
import { ProductPreview } from './product-preview';

type Playback = { loop?: boolean; muted?: boolean; controls?: boolean; playsInline?: boolean };
export function embedUrl(raw: string, type: string, autoplay: boolean, options: Playback = {}) {
  try {
    const url = new URL(raw);
    const loop = options.loop !== false ? 1 : 0;
    const muted = options.muted !== false ? 1 : 0;
    const controls = options.controls === true ? 1 : 0;
    if (type === 'youtube' && ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop() || '';
      return /^[\w-]+$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&mute=${muted}&loop=${loop}&playlist=${id}&controls=${controls}&playsinline=${options.playsInline !== false ? 1 : 0}` : '';
    }
    if (type === 'vimeo' && ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').pop() || '';
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=${autoplay ? 1 : 0}&muted=${muted}&loop=${loop}&controls=${controls}` : '';
    }
    if (type === 'loom' && ['loom.com', 'www.loom.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').pop() || '';
      return /^[a-zA-Z0-9]+$/.test(id) ? `https://www.loom.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&hide_owner=true&hide_share=true` : '';
    }
  } catch { /* Invalid provider URLs never become iframe sources. */ }
  return '';
}

export function Media({ data, mode = 'Write progress notes', priority = false }: { data: Content; mode?: string; priority?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(priority);
  const [loaded, setLoaded] = useState(priority);
  const [failedUrl, setFailedUrl] = useState('');
  const url = contentMediaUrl(data);
  const type = text(data, 'media_type', 'image');
  const autoplay = data.autoplay !== false && !reduced;
  const fit = data.fit === 'contain' ? 'contain' : 'cover';
  const alt = text(data, 'alt', mode);
  const controls = data.controls === true || Boolean(reduced);
  const embed = embedUrl(url, type, autoplay, { loop: data.loop !== false, muted: data.muted !== false, controls, playsInline: data.playsInline !== false });

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
      if (!video.current) return;
      if (entry.isIntersecting && autoplay) void video.current.play().catch(() => {});
      else video.current.pause();
    }, { rootMargin: '150px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoplay, url]);

  if (!url) return <ProductPreview mode={mode} />;
  const imageProps = { width: 1200, height: 850, loading: priority ? 'eager' as const : 'lazy' as const, onError: () => setFailedUrl(url), style: { objectFit: fit as 'contain' | 'cover', objectPosition: text(data, 'position', 'center') } };
  return (
    <div className="media-frame" ref={holder} style={{ borderRadius: typeof data.radius === 'number' ? data.radius : undefined }}>
      {failedUrl === url ? <div className="empty-state">This media couldn’t load. Please check its URL.</div>
        : ['youtube', 'vimeo', 'loom'].includes(type) ? embed ? visible ? <iframe src={embed} title={alt} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen /> : <div className="media-placeholder" /> : <div className="empty-state">Enter a valid {type} video URL.</div>
        : ['video', 'mp4'].includes(type) ? <video ref={video} src={loaded ? url : undefined} poster={mediaUrl(text(data, 'poster_url')) || undefined} autoPlay={autoplay} loop={data.loop !== false} muted={data.muted !== false} playsInline={data.playsInline !== false} controls={controls} preload="none" onError={() => setFailedUrl(url)} style={{ objectFit: fit }} aria-label={alt} />
        : type === 'gif' && reduced ? mediaUrl(text(data, 'poster_url')) ? <img src={mediaUrl(text(data, 'poster_url'))} {...imageProps} alt={alt} /> : <div className="empty-state">Animated media paused for your reduced-motion preference.</div>
        : url.startsWith('/') || url.startsWith('https://images.unsplash.com/') ? <Image src={url} {...imageProps} alt={alt} sizes="(max-width: 700px) 100vw, 60vw" />
        : <img src={url} {...imageProps} alt={alt} decoding="async" />}
    </div>
  );
}
