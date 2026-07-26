"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updatePromoPopupSettings } from "@/actions/admin/homeBanner";
import { PromoPopupConfig } from "@/lib/promo";
import { Sparkles, Eye, Save, Loader2, Image as ImageIcon, CheckCircle, Clock, Gift, RefreshCw } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import PromoPopup from "@/components/PromoPopup";

interface PromoPopupManagerProps {
  initialSettings: PromoPopupConfig;
}

export function PromoPopupManager({ initialSettings }: PromoPopupManagerProps) {
  const [settings, setSettings] = useState<PromoPopupConfig>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updatePromoPopupSettings(settings);
      if (res.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      } else {
        alert(res.error || "Failed to update promo popup settings.");
      }
    });
  };

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result.info.secure_url;
    setSettings((prev) => ({ ...prev, image_url: imageUrl }));
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Modal inside Admin */}
      <PromoPopup
        settings={settings}
        isPreview={true}
        isOpenOverride={showPreview}
        onCloseOverride={() => setShowPreview(false)}
      />

      {/* Header & Main Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl shrink-0 mt-0.5">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">Homepage Promo & Coupon Popup</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                Refresh Modal
              </span>
            </div>
        <p className="text-sm text-stone-500 mt-1 max-w-xl">
  Customize your homepage discount popup.
</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors shrink-0"
          >
            <Eye className="w-4 h-4 text-stone-600" />
            Live Preview
          </button>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              disabled={isPending}
            />
            <div className="w-12 h-7 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      </div>

      {/* Display Frequency & Show Count Setting */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Display Frequency & View Limits</h3>
              <p className="text-xs text-stone-500">Choose how often visitors see the discount popup.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: "always",
              title: "Every Page Refresh",
              desc: "Shows every time homepage is opened.",
              badge: "Recommended",
            },
            {
              id: "once_session",
              title: "Once Per Session",
              desc: "Reappears only after restarting browser.",
            },
            {
              id: "once_day",
              title: "Once Daily (24h)",
              desc: "Shows max once per day per visitor.",
            },
            {
              id: "once_ever",
              title: "Only Once Ever",
              desc: "Shows once per visitor, then hides forever.",
            },
            {
              id: "custom_times",
              title: "Custom Limit",
              desc: "Set exact maximum number of views.",
            },
          ].map((item) => {
            const isSelected = settings.frequency === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSettings({ ...settings, frequency: item.id as any })}
                className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-orange-500 bg-gradient-to-br from-orange-50/80 to-amber-50/40 shadow-sm"
                    : "border-stone-200/80 hover:border-stone-300 bg-stone-50/40 hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`font-bold text-sm transition-colors ${isSelected ? "text-orange-950" : "text-stone-800"}`}>
                      {item.title}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-orange-600 bg-orange-600 shadow-sm" : "border-stone-300 group-hover:border-stone-400 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-fadeIn" />}
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-normal">{item.desc}</p>
                </div>

                {item.badge && (
                  <div className="mt-3 flex items-center">
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100/90 border border-orange-200/60 px-2 py-0.5 rounded-md shadow-xs">
                      ★ {item.badge}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* If Custom number of times selected */}
        {settings.frequency === "custom_times" && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Maximum Views per Visitor</span>
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Popup automatically stops appearing after reaching this view limit.
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs font-semibold text-stone-600">Show max:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.max_views}
                onChange={(e) => setSettings({ ...settings, max_views: parseInt(e.target.value) || 1 })}
                className="w-14 px-2 py-1 font-bold text-sm text-center text-orange-600 bg-orange-50/60 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-stone-600">times</span>
            </div>
          </div>
        )}
      </div>

      {/* Content & Copy Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
          <Sparkles className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-bold text-stone-900">Popup Content & Coupon Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Top Subtitle</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              placeholder="e.g. BEFORE YOU GO!"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Main Headline</label>
            <input
              type="text"
              value={settings.headline}
              onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
              placeholder="e.g. Here's 15% Off Just For You"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-serif"
            />
            <p className="text-[11px] text-stone-400">
              Note: Words like &quot;15% Off&quot; will automatically be highlighted in warm rust accent color.
            </p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Description Copy</label>
            <textarea
              rows={2}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Use the code below at checkout and get 15% OFF on your first order."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <label className="text-xs font-bold text-orange-700 uppercase tracking-wider">Coupon Code (To Copy)</label>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-stone-600 font-medium">
                  {settings.code || "No active coupon found"}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
                  AUTO SYNCED
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                The coupon code is automatically fetched from your active <strong>Checkout Coupons</strong>. To change this, please manage your coupons in the settings.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Countdown Duration (Hours)</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="number"
                min={1}
                max={720}
                value={settings.timer_hours}
                onChange={(e) => setSettings({ ...settings, timer_hours: parseInt(e.target.value) || 48 })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Timer ticks down live in days/hours/minutes. Resets after duration passes.
            </p>
          </div>
        </div>
      </div>

      {/* Button & Image Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
          <ImageIcon className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-bold text-stone-900">Right-Side Image & Button Destination</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Image preview and uploader */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Right-Side Product / Collection Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-28 aspect-[4/5] rounded-xl overflow-hidden relative border border-stone-200 bg-stone-100 shadow-sm shrink-0">
                <Image
                  src={settings.image_url || "/hijab-medina.jpg"}
                  alt="Popup preview"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <CldUploadWidget
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  }}
                  onSuccess={handleUploadSuccess}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      disabled={isPending}
                      type="button"
                      className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload New Photo
                    </button>
                  )}
                </CldUploadWidget>

                <div>
                  <input
                    type="text"
                    value={settings.image_url}
                    onChange={(e) => setSettings({ ...settings, image_url: e.target.value })}
                    placeholder="/hijab-medina.jpg or https://..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 bg-stone-50 text-stone-600 focus:outline-none focus:ring-1 focus:ring-orange-400 truncate"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Tip: A tall or square hijab photo works best with the curved right side divider.
                </p>
              </div>
            </div>
          </div>

          {/* Button settings */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Button Text</label>
              <input
                type="text"
                value={settings.button_text}
                onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                placeholder="e.g. SHOP NOW"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Button Destination Link</label>
              <input
                type="text"
                value={settings.button_link}
                onChange={(e) => setSettings({ ...settings, button_link: e.target.value })}
                placeholder="e.g. /shop or /shop/hijabs"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-[11px] text-stone-400">
                When customer clicks SHOP NOW, they are taken here after closing the popup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedMessage && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3.5 py-2 rounded-xl text-sm font-semibold border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Promo Popup Settings Saved!
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Promo Popup Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
