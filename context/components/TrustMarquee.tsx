const row1Items = [
  { text: "Premium Hijabs & Scarves", style: "", symbol: "symbol-star" },
  { text: "Sophisticated Craftsmanship", style: "text-theme", symbol: "symbol-diamond" },
  { text: "Nationwide & Global Delivery", style: "text-stroke", symbol: "symbol-line" },
  { text: "Easy Size & Fit Consultation", style: "text-faded", symbol: "symbol-star" },
  { text: "Effortless Elegance", style: "text-theme-soft", symbol: "symbol-diamond" },
  { text: "Made With Luxury & Modesty", style: "text-stroke", symbol: "symbol-line" },
];

const row2Items = [
  { text: "Effortless Elegance", style: "text-theme", symbol: "symbol-star" },
  { text: "Made With Luxury & Modesty", style: "", symbol: "symbol-diamond" },
  { text: "Nationwide & Global Delivery", style: "text-stroke", symbol: "symbol-line" },
  { text: "Easy Size & Fit Consultation", style: "text-faded", symbol: "symbol-star" },
  { text: "Sophisticated Craftsmanship", style: "text-theme-soft", symbol: "symbol-diamond" },
  { text: "Premium Hijabs & Scarves", style: "text-stroke", symbol: "symbol-line" },
];

export default function TrustMarquee() {
  const loopRow1 = [...row1Items, ...row1Items, ...row1Items, ...row1Items];
  const loopRow2 = [...row2Items, ...row2Items, ...row2Items, ...row2Items];

  const renderSymbol = (symbolClass: string) => {
    if (symbolClass === "symbol-star") return <span className="symbol-star">✦</span>;
    if (symbolClass === "symbol-diamond") return <span className="symbol-diamond">◆</span>;
    return <span className="symbol-line"></span>;
  };

  return (
    <div className="custom-marquee-section">
      {/* Left & Right Edge Gradients for fading effect */}
      <div className="marquee-fade-left"></div>
      <div className="marquee-fade-right"></div>

      <div className="marquee-wrapper">
        {/* Row 1: Left to Right */}
        <div className="marquee-row marquee-row-left">
          <div className="marquee-track">
            {loopRow1.map((item, i) => (
              <span key={`r1-${i}`} className={item.style}>
                {item.text}
                {renderSymbol(item.symbol)}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2: Right to Left */}
        <div className="marquee-row marquee-row-right">
          <div className="marquee-track">
            {loopRow2.map((item, i) => (
              <span key={`r2-${i}`} className={item.style}>
                {item.text}
                {renderSymbol(item.symbol)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
