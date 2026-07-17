'use client'

import { useEffect, useState } from 'react'
import { AnnouncementBannerConfig } from '@/actions/admin/announcements'
import { getAnnouncementBannerSettings } from '@/actions/admin/announcements'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AnnouncementBanner() {
  const [config, setConfig] = useState<AnnouncementBannerConfig | null>(null)
  
  useEffect(() => {
    getAnnouncementBannerSettings().then(setConfig).catch(console.error)
    
    // Listen for cross-tab or same-window updates
    const handleUpdate = () => {
      getAnnouncementBannerSettings().then(setConfig).catch(console.error)
    }
    window.addEventListener('announcement-updated', handleUpdate)
    return () => window.removeEventListener('announcement-updated', handleUpdate)
  }, [])

  if (!config || !config.enabled || !config.messages || config.messages.length === 0) {
    return null
  }

  const activeMessages = config.messages.filter(m => m.isActive)
  if (activeMessages.length === 0) return null

  const renderSeparator = () => {
    switch (config.separator) {
      case 'sparkle':
        return <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 mx-4 md:mx-6 opacity-75" />
      case 'line':
        return <span className="mx-4 md:mx-6 opacity-50 font-light">|</span>
      case 'dot':
        return <span className="mx-4 md:mx-6 opacity-75">•</span>
      default:
        return <span className="mx-4 md:mx-6"></span>
    }
  }

  const renderMessageContent = (msg: any) => {
    const content = (
      <span className="flex items-center gap-2 whitespace-nowrap font-medium tracking-wide">
        {msg.icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5" />}
        {/* Replace special text with bold / highlight styles if needed, but for now simple text */}
        {msg.text.includes('HIJAB15') ? (
          <span dangerouslySetInnerHTML={{ __html: msg.text.replace('HIJAB15', '<span class="bg-black/20 px-2 py-0.5 rounded-full text-[0.9em]">HIJAB15</span>') }} />
        ) : (
          msg.text
        )}
      </span>
    )
    if (msg.link) {
      return <Link href={msg.link} className="hover:opacity-80 transition-opacity">{content}</Link>
    }
    return content
  }

  return (
    <div 
      className="relative w-full overflow-hidden flex items-center z-[100000] shadow-sm transition-all duration-300"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        height: config.height,
        fontSize: config.fontSize,
      }}
    >
      <div 
        className={`flex whitespace-nowrap w-max animate-marquee ${config.pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${config.speed}s` }}
      >
        {[...Array(6)].map((_, blockIdx) => (
          <div key={blockIdx} className="flex items-center shrink-0 pr-4 md:pr-6">
            {activeMessages.map((msg, idx) => (
              <div key={`${msg.id}-${blockIdx}`} className="flex items-center">
                {renderMessageContent(msg)}
                {/* Always render separator */}
                {renderSeparator()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
