import Reveal from "./Reveal";
import BotanicalDivider from "./BotanicalDivider";
import { IconFabric, IconNeedle, IconTulip, IconWing } from "./Icons";
import { usps } from "@/lib/data";

const icons = [IconFabric, IconNeedle, IconTulip, IconWing];

const cardColors = [
  {
    iconBg: "bg-gold/15 group-hover:bg-gold/25",
    iconColor: "text-gold",
    borderColor: "group-hover:border-gold/50",
    shadowColor: "hover:shadow-[0_20px_40px_rgba(196,138,83,0.15)]"
  },
  {
    iconBg: "bg-rose/15 group-hover:bg-rose/25",
    iconColor: "text-rose",
    borderColor: "group-hover:border-rose/50",
    shadowColor: "hover:shadow-[0_20px_40px_rgba(192,110,97,0.15)]"
  },
  {
    iconBg: "bg-emerald/15 group-hover:bg-emerald/25",
    iconColor: "text-emerald",
    borderColor: "group-hover:border-emerald/50",
    shadowColor: "hover:shadow-[0_20px_40px_rgba(156,82,71,0.15)]"
  },
  {
    iconBg: "bg-orange-400/15 group-hover:bg-orange-400/25",
    iconColor: "text-orange-400",
    borderColor: "group-hover:border-orange-400/50",
    shadowColor: "hover:shadow-[0_20px_40px_rgba(196,138,83,0.15)]"
  }
];

export default function WhyUs() {
  return (
    <section className="relative py-6 md:py-10 bg-gradient-to-br from-cream via-cream-deep to-[#F5ECE0] overflow-hidden border-y border-cream-line">
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-emerald/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-0 w-[360px] h-[360px] rounded-full bg-gold/10 blur-3xl" />

      <div className="max-w-wrap mx-auto px-5 md:px-8 relative">
        <Reveal className="text-center max-w-xl mx-auto">
          <div className="eyebrow justify-center inline-flex items-center gap-2">
            <span className="h-px w-6 bg-cream-line" />
            Why Hijabista
            <span className="h-px w-6 bg-cream-line" />
          </div>
          <h2 className="section-heading mt-4 text-ink">
            Crafted with the same care, every time.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {usps.map((item, i) => {
            const Icon = icons[i % icons.length];
            const colors = cardColors[i % cardColors.length];
            return (
              <Reveal key={item.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className={`h-full bg-white border border-cream-line rounded-2xl md:rounded-[24px] p-5 md:p-7 shadow-soft transition-all duration-300 hover:bg-cream/40 hover:-translate-y-2 group ${colors.borderColor} ${colors.shadowColor}`}>
                  <div className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colors.iconBg}`}>
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${colors.iconColor}`} />
                  </div>
                  <h3 className="font-display font-semibold text-ink text-base md:text-lg mt-5 transition-colors group-hover:text-emerald">
                    {item.title}
                  </h3>
                  <p className="text-ink/70 text-[13px] md:text-sm mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      <div className="relative mt-12">
        <BotanicalDivider tone="gold" />
      </div>
    </section>
  );
}
