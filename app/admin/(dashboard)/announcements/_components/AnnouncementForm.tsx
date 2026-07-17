'use client'

import { useState, useTransition } from 'react'
import { AnnouncementBannerConfig, updateAnnouncementBannerSettings, AnnouncementMessage } from '@/actions/admin/announcements'
import { Check, Loader2, Sparkles, Plus, Trash2, Settings2, Type, Link as LinkIcon, MoveUp, MoveDown } from 'lucide-react'

function BannerPreview({ config }: { config: AnnouncementBannerConfig }) {
  if (!config.enabled) return (
    <div className="w-full p-4 bg-stone-100 text-stone-500 text-center text-sm rounded-xl border border-stone-200 border-dashed">
      Banner is currently disabled. Enable it to see the preview.
    </div>
  )

  const activeMessages = config.messages.filter(m => m.isActive)
  if (activeMessages.length === 0) return (
    <div className="w-full p-4 bg-stone-100 text-stone-500 text-center text-sm rounded-xl border border-stone-200 border-dashed">
      No active messages to display.
    </div>
  )

  const renderSeparator = () => {
    switch (config.separator) {
      case 'sparkle':
        return <Sparkles className="w-3 h-3 mx-4 opacity-75" />
      case 'line':
        return <span className="mx-4 opacity-50 font-light">|</span>
      case 'dot':
        return <span className="mx-4 opacity-75">•</span>
      default:
        return <span className="mx-4"></span>
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 shadow-sm relative">
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
      <div 
        className="w-full flex items-center relative"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          height: config.height,
          fontSize: config.fontSize,
        }}
      >
        <div className="flex whitespace-nowrap overflow-x-auto no-scrollbar px-6 w-full items-center justify-center">
          {activeMessages.map((msg, idx) => (
            <div key={msg.id} className="flex items-center">
              <span className="flex items-center gap-2 font-medium tracking-wide">
                {msg.icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5" />}
                {msg.text || "Empty Message"}
              </span>
              {idx < activeMessages.length - 1 && renderSeparator()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnnouncementForm({ initialConfig }: { initialConfig: AnnouncementBannerConfig }) {
  const [config, setConfig] = useState<AnnouncementBannerConfig>(initialConfig)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    setError(null)
    setSuccess(false)
    
    startTransition(async () => {
      const result = await updateAnnouncementBannerSettings(config)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        window.dispatchEvent(new Event('announcement-updated'))
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const updateMessage = (id: string, updates: Partial<AnnouncementMessage>) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    }))
  }

  const addMessage = () => {
    setConfig(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { id: `msg-${Date.now()}`, text: 'New Announcement', isActive: true, icon: 'none' }
      ]
    }))
  }

  const deleteMessage = (id: string) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== id)
    }))
  }

  const moveMessage = (index: number, direction: 'up' | 'down') => {
    setConfig(prev => {
      const msgs = [...prev.messages]
      if (direction === 'up' && index > 0) {
        [msgs[index - 1], msgs[index]] = [msgs[index], msgs[index - 1]]
      } else if (direction === 'down' && index < msgs.length - 1) {
        [msgs[index + 1], msgs[index]] = [msgs[index], msgs[index + 1]]
      }
      return { ...prev, messages: msgs }
    })
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Live Preview Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Live Preview</h2>
        <BannerPreview config={config} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Messages Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Messages</h3>
                <p className="text-sm text-stone-500">Manage the scrolling announcements.</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ml-3 text-sm font-medium text-stone-700">Enable Banner</span>
              </label>
            </div>

            <div className="space-y-4">
              {config.messages.map((msg, idx) => (
                <div key={msg.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveMessage(idx, 'up')} disabled={idx === 0} className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"><MoveUp className="w-4 h-4" /></button>
                      <button onClick={() => moveMessage(idx, 'down')} disabled={idx === config.messages.length - 1} className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"><MoveDown className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 relative">
                          <Type className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={msg.text}
                            onChange={(e) => updateMessage(msg.id, { text: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="Announcement text"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={msg.isActive}
                            onChange={(e) => updateMessage(msg.id, { isActive: e.target.checked })}
                            className="rounded text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-xs font-medium text-stone-600">Active</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={msg.link || ''}
                            onChange={(e) => updateMessage(msg.id, { link: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="Optional URL (e.g., /shop)"
                          />
                        </div>
                        <select
                          value={msg.icon || 'none'}
                          onChange={(e) => updateMessage(msg.id, { icon: e.target.value })}
                          className="bg-white border border-stone-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                          <option value="none">No Icon</option>
                          <option value="sparkles">Sparkles</option>
                        </select>
                        <button 
                          onClick={() => deleteMessage(msg.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMessage}
              className="mt-6 w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 font-medium hover:bg-stone-50 hover:border-stone-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Message
            </button>
          </div>
        </div>

        {/* Right Column: Design Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-stone-700" />
              <h3 className="font-bold text-stone-900 text-lg">Design</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Text Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Separator Style</label>
                <select
                  value={config.separator}
                  onChange={(e) => setConfig({ ...config, separator: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                >
                  <option value="none">None</option>
                  <option value="line">Line ( | )</option>
                  <option value="dot">Dot ( • )</option>
                  <option value="sparkle">Sparkle ( ✦ )</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Height</label>
                  <input
                    type="text"
                    value={config.height}
                    onChange={(e) => setConfig({ ...config, height: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., 40px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Font Size</label>
                  <input
                    type="text"
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., 13px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Scroll Speed (seconds)</label>
                <input
                  type="number"
                  value={config.speed}
                  onChange={(e) => setConfig({ ...config, speed: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-orange-500"
                  min="5" max="120"
                />
                <p className="text-xs text-stone-500 mt-1">Lower = faster, Higher = slower.</p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.pauseOnHover}
                    onChange={(e) => setConfig({ ...config, pauseOnHover: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-stone-700">Pause scrolling on hover</span>
                </label>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white border-t border-stone-200 p-4 px-6 md:px-10 flex items-center justify-end gap-4 z-50">
        {success && (
          <span className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Check className="w-4 h-4" />
            Changes saved & live!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-8 py-3 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center min-w-[160px]"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </div>

    </div>
  )
}
