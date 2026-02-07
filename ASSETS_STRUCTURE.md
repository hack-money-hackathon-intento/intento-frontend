# 📁 INTENTO - Assets Structure (Professional Organization)

## 🗂️ Directory Structure

```
frontend/public/images/
├── mascot/
│   └── arbiter.gif          (5.2MB) - The Arbiter (self-animated)
├── chains/
│   ├── ethereum.png         (157KB) - Ethereum logo
│   ├── bnb.png              (102KB) - BNB Chain logo
│   ├── optimism.png          (72KB) - Optimism logo
│   └── tron.png             (102KB) - Tron logo
├── tokens/
│   ├── usdc.png             (118KB) - USDC token logo
│   └── pepe.png             (187KB) - PEPE token logo
└── [legacy]
    ├── octoenter.gif        (35KB) - Old smaller version
    ├── enter-mascot.gif
    ├── enter-mascot.png
    └── mars-planet.png
```

## 🎨 Usage in Components

### The Arbiter Mascot
```tsx
// Path: /images/mascot/arbiter.gif
// Component: components/landing/hero-section.tsx
// Note: GIF has built-in animation (no CSS float needed)
<img src="/images/mascot/arbiter.gif" alt="The Arbiter" />
```

### Chain Logos
```tsx
// Ethereum
<img src="/images/chains/ethereum.png" alt="Ethereum" />

// BNB Chain  
<img src="/images/chains/bnb.png" alt="BNB Chain" />

// Optimism
<img src="/images/chains/optimism.png" alt="Optimism" />

// Tron
<img src="/images/chains/tron.png" alt="Tron" />
```

### Token Logos
```tsx
// USDC
<img src="/images/tokens/usdc.png" alt="USDC" />

// PEPE
<img src="/images/tokens/pepe.png" alt="PEPE" />
```

## 🔄 Migration Notes

**OLD (deprecated)**:
- ❌ `/images/octoenter.gif` (35KB, too small)
- ❌ SVG monochromatic chain logos (not professional)

**NEW (current)**:
- ✅ `/images/mascot/arbiter.gif` (5.2MB, high quality)
- ✅ PNG chain logos with original branding colors
- ✅ Professional directory organization

## 📦 File Sizes

| Asset | Size | Dimensions | Format |
|-------|------|------------|--------|
| arbiter.gif | 5.2MB | 400x400 | GIF (animated) |
| ethereum.png | 157KB | 3258x3258 | PNG (RGBA) |
| bnb.png | 102KB | 2000x2000 | PNG (RGBA) |
| optimism.png | 72KB | 2000x2000 | PNG (RGBA) |
| tron.png | 102KB | 2000x2000 | PNG (RGBA) |
| usdc.png | 118KB | 2000x2000 | PNG (RGBA) |
| pepe.png | 187KB | 2000x2000 | PNG (RGBA) |

## 🎯 Best Practices

1. **Always use `/images/mascot/arbiter.gif`** for The Arbiter
2. **Chain logos** go in `/images/chains/`
3. **Token logos** go in `/images/tokens/`
4. **Use semantic naming**: ethereum.png, not ethereum-eth-logo.png
5. **Preserve aspect ratio**: Use `object-contain` in CSS

---

Last Updated: 2026-02-02
