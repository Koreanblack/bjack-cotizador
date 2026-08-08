import { useState, useEffect, useRef } from 'react'
import { MODELOS, Color, Model } from '../lib/models'
import { IMAGES } from '../lib/images'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const IVA = 0.21
const SEGURO = 0.0022965
const COSTO_PRENDA = 0.015

export interface CreditLine {
  id: string
  nombre: string
  tna: number
  uva: boolean
  plazos: number[]
  quebranto?: Record<number, number>
}

// Fuente: Santander Consumer · Tasas BYD · 7 de Agosto 2026
const CREDIT_LINES: CreditLine[] = [
  { id: 'tradicional', nombre: 'Línea Tradicional BYD', tna: 0.329, uva: false, plazos: [12, 18, 24, 36, 48, 60] },
  { id: 'uva', nombre: 'Línea UVA BYD', tna: 0.125, uva: true, plazos: [12, 18, 24, 36, 48] },
  { id: 'fija0', nombre: 'Promo Fija 0%', tna: 0, uva: false, plazos: [12, 18, 24, 36, 48], quebranto: { 12: 0.158, 18: 0.219, 24: 0.275, 36: 0.37, 48: 0.448 } },
  { id: 'uva0', nombre: 'Promo UVA 0%', tna: 0, uva: true, plazos: [12, 18, 24, 36, 48], quebranto: { 12: 0.065, 18: 0.093, 24: 0.12, 36: 0.17, 48: 0.216 } },
  { id: 'uva990', nombre: 'Promo UVA 9,90%', tna: 0.099, uva: true, plazos: [12, 18, 24, 36, 48], quebranto: { 12: 0.014, 18: 0.02, 24: 0.026, 36: 0.037, 48: 0.048 } },
]

function pct(n: number) { return (n * 100).toFixed(2).replace('.', ',') + '%' }
function fp(n: number) { return '$ ' + Math.round(n).toLocaleString('es-AR') }
function fu(n: number) { return 'USD ' + Math.round(n).toLocaleString('es-AR') }
function calcBase(capital: number, n: number, tna: number) {
  const tmm = tna / 12
  if (tmm === 0) return capital / n
  return capital * (tmm * Math.pow(1 + tmm, n)) / (Math.pow(1 + tmm, n) - 1)
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function BlueBar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="relative flex items-center gap-3 glass rounded-xl px-4 py-3 mb-5 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: 'linear-gradient(to bottom, #00d4e8, #00b4c8)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/60">💵 Dólar Blue — Venta</div>
        <div className="text-[11px] text-white/30 mt-0.5">Carga manual</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-white/30 font-mono text-sm">$</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          inputMode="numeric"
          className="w-24 h-9 px-2 text-right text-lg font-mono bg-[#1c2540] text-[#00d4e8] border border-white/10 rounded-lg"
        />
      </div>
    </div>
  )
}

function ModelSelector({ selected, onChange }: { selected: Model | null, onChange: (m: Model) => void }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white/60 mb-1.5">Modelo BYD</label>
      <select
        value={selected?.id || ''}
        onChange={e => {
          const m = MODELOS.find(x => x.id === e.target.value)
          if (m) onChange(m)
        }}
        className="w-full h-11 px-3 text-sm bg-[#1c2540] text-white border border-white/10 rounded-xl"
      >
        <option value="">— Elegir modelo —</option>
        <optgroup label="⚡ Eléctrico">
          {MODELOS.filter(m => m.tipo.includes('Eléctrico')).map(m => (
            <option key={m.id} value={m.id}>{m.nombre} — USD {m.precio_usd.toLocaleString()}</option>
          ))}
        </optgroup>
        <optgroup label="🔋 Híbrido enchufable">
          {MODELOS.filter(m => m.tipo.includes('Híbrido') || m.tipo.includes('Híbrida')).map(m => (
            <option key={m.id} value={m.id}>{m.nombre} — USD {m.precio_usd.toLocaleString()}</option>
          ))}
        </optgroup>
      </select>
    </div>
  )
}

function LineaSelector({ selected, onChange }: { selected: CreditLine, onChange: (l: CreditLine) => void }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white/60 mb-1.5">Línea de crédito</label>
      <div className="grid grid-cols-2 gap-2">
        {CREDIT_LINES.map(l => (
          <button
            key={l.id}
            onClick={() => onChange(l)}
            className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
              selected.id === l.id
                ? 'bg-[rgba(0,212,232,0.15)] border-[rgba(0,212,232,0.5)]'
                : 'bg-white/5 border-white/10 hover:border-[rgba(0,212,232,0.3)]'
            }`}
          >
            <div className={`text-[12px] font-semibold ${selected.id === l.id ? 'text-[#00d4e8]' : 'text-white/80'}`}>{l.nombre}</div>
            <div className="text-[10px] text-white/40 mt-0.5 font-mono">
              TNA {pct(l.tna)}{l.uva ? ' · UVA' : ''}{l.quebranto ? ' · c/ quebranto' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ImageGallery({ model, activeColor, onColorChange }: {
  model: Model,
  activeColor: Color | null,
  onColorChange: (c: Color) => void
}) {
  const imgKey = activeColor?.imgKey || model.defaultImg
  const imgSrc = imgKey ? (IMAGES[imgKey] || null) : null
  const [idx, setIdx] = useState(0)

  // Build gallery: colors that have images
  const gallery = model.colores.filter(c => c.imgKey)

  useEffect(() => {
    if (activeColor?.imgKey) {
      const i = gallery.findIndex(c => c.imgKey === activeColor.imgKey)
      if (i >= 0) setIdx(i)
    }
  }, [activeColor])

  const prev = () => {
    const newIdx = (idx - 1 + gallery.length) % gallery.length
    setIdx(newIdx)
    onColorChange(gallery[newIdx])
  }
  const next = () => {
    const newIdx = (idx + 1) % gallery.length
    setIdx(newIdx)
    onColorChange(gallery[newIdx])
  }

  return (
    <div className="mb-5">
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden bg-[#0e1830]" style={{ height: '200px' }}>
        {imgSrc ? (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={model.nombre}
            className="w-full h-full object-cover fade-up"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🚗</div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.5) 0%, transparent 60%)' }} />

        {/* Model name overlay */}
        <div className="absolute bottom-3 left-4">
          <div className="text-white font-semibold text-base leading-tight">{model.nombre}</div>
          <div className="text-[#00d4e8] text-xs mt-0.5">{model.tipo}</div>
        </div>

        {/* Illustrative image badge */}
        {model.imagenIlustrativa && (
          <div className="absolute top-2 right-2 text-[10px] text-white/70 bg-black/40 rounded-full px-2.5 py-1">
            Imagen ilustrativa
          </div>
        )}

        {/* Nav arrows */}
        {gallery.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all text-sm">‹</button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all text-sm">›</button>
          </>
        )}
      </div>

      {/* Dots */}
      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {gallery.map((_, i) => (
            <div key={i} className={`gallery-dot ${i === idx ? 'active' : ''}`} />
          ))}
        </div>
      )}

      {/* Color swatches */}
      <div className="flex flex-wrap gap-2 mt-3">
        {model.colores.map(c => (
          <button
            key={c.name}
            onClick={() => { onColorChange(c); if (c.imgKey) { const i = gallery.findIndex(x => x.imgKey === c.imgKey); if (i >= 0) setIdx(i) } }}
            title={c.name}
            className={`color-swatch w-7 h-7 rounded-full border-2 ${activeColor?.name === c.name ? 'active' : 'border-white/20'}`}
            style={{ background: c.hex }}
          />
        ))}
        <span className="text-xs text-white/40 self-center ml-1">{activeColor?.name || 'Seleccionar color'}</span>
      </div>
    </div>
  )
}

function CuotasGrid({ selected, onChange, opts }: { selected: number, onChange: (n: number) => void, opts: number[] }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Cantidad de cuotas</label>
      <div className="grid gap-1.5 mb-5" style={{ gridTemplateColumns: `repeat(${opts.length}, minmax(0, 1fr))` }}>
        {opts.map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`py-2.5 text-[13px] font-medium rounded-lg border transition-all ${
              selected === n
                ? 'bg-[rgba(0,212,232,0.15)] border-[rgba(0,212,232,0.5)] text-[#00d4e8]'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-[rgba(0,212,232,0.3)] hover:text-white'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultCard({ model, capital, cuotas, blue, activeColor, line }: {
  model: Model, capital: number, cuotas: number, blue: number | null, activeColor: Color | null, line: CreditLine
}) {
  const tc = blue || 0
  const cuotaBase = calcBase(capital, cuotas, line.tna)
  const interesTotal = cuotaBase * cuotas - capital
  const ivaXCuota = (interesTotal * IVA) / cuotas
  const seguroXCuota = capital * SEGURO
  const cuotaTotal = cuotaBase + ivaXCuota + seguroXCuota
  const totalGeneral = cuotaTotal * cuotas
  const precioARS = model.precio_usd * tc
  const patentamientoARS = model.patentamiento_usd * tc
  const quebrantoPct = line.quebranto?.[cuotas]
  const quebrantoBase = quebrantoPct ? capital * quebrantoPct : 0
  const quebrantoMonto = quebrantoBase * (1 + IVA)
  const costoPrenda = capital * COSTO_PRENDA

  const rows = [
    { label: 'Línea de crédito', val: line.nombre },
    { label: 'Vehículo', val: tc > 0 ? `${fp(precioARS)} (${fu(model.precio_usd)})` : fu(model.precio_usd) },
    { label: 'Patentamiento', val: tc > 0 ? `${fp(patentamientoARS)} (${fu(model.patentamiento_usd)})` : fu(model.patentamiento_usd) },
    { label: 'Capital financiado', val: tc > 0 ? `${fp(capital)} (${fu(capital / tc)})` : fp(capital) },
    { label: 'TNA', val: pct(line.tna) },
    { label: 'Plazo', val: `${cuotas} meses` },
    { label: 'Vencimiento', val: 'Día 10 de cada mes' },
    ...(quebrantoPct ? [{ label: 'Quebranto (bonif. tasa)', val: `${fp(quebrantoMonto)} (${pct(quebrantoPct)} + IVA, no incl. IIBB)` }] : []),
    { label: 'Costo de prenda', val: `${fp(costoPrenda)} (${pct(COSTO_PRENDA)})` },
    { label: 'Total a pagar', val: tc > 0 ? `${fp(totalGeneral)} (${fu(totalGeneral / tc)})` : fp(totalGeneral) },
    { label: 'Tipo de cambio blue', val: tc > 0 ? `$ ${tc.toLocaleString('es-AR')} / USD` : 'No disponible' },
  ]

  return (
    <div className="fade-up">
      {/* Main cuota */}
      <div className="relative rounded-2xl p-5 mb-3 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1f3d, #0a1628)', border: '1px solid rgba(0,212,232,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,232,0.4), transparent)' }} />
        <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1.5">{line.uva ? 'Cuota mensual inicial' : 'Cuota mensual total'}</div>
        <div className="font-mono text-4xl font-bold text-[#00d4e8] tracking-tight">{fp(cuotaTotal)}</div>
        {tc > 0 && <div className="font-mono text-xs text-white/30 mt-1.5">≈ {fu(cuotaTotal / tc)}</div>}

        {/* Breakdown strip */}
        <div className="grid grid-cols-3 gap-0 mt-4 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { label: 'Capital', val: fp(cuotaBase), color: 'text-white/60' },
            { label: 'IVA 21%', val: fp(ivaXCuota), color: 'text-yellow-300/80' },
            { label: 'Seguro', val: fp(seguroXCuota), color: 'text-purple-300/80' },
          ].map((item, i) => (
            <div key={i} className={`py-2.5 px-2 text-center ${i > 0 ? 'border-l border-white/7' : ''}`}>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">{item.label}</div>
              <div className={`font-mono text-[11px] font-medium ${item.color}`}>{item.val}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-white/30">{cuotas} cuotas · TNA {pct(line.tna)}</span>
          <span className="text-[11px] text-[#00d4e8] bg-[rgba(0,212,232,0.08)] border border-[rgba(0,212,232,0.2)] rounded-full px-2.5 py-0.5 font-mono">IVA + Seguro incl.</span>
        </div>
      </div>

      {/* Detail rows */}
      <div className="rounded-xl overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {rows.map((row, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i < rows.length - 1 ? 'border-b border-white/5' : ''}`}>
            <span className="text-xs text-white/40">{row.label}</span>
            <span className="font-mono text-xs text-white/85 text-right max-w-[55%]">{row.val}</span>
          </div>
        ))}
      </div>

      {/* UVA note */}
      {line.uva && (
        <div className="rounded-xl px-4 py-3 mb-3 text-xs" style={{ background: 'rgba(0,212,232,0.05)', border: '1px solid rgba(0,212,232,0.15)' }}>
          <span className="text-[#00d4e8] font-semibold">ℹ️ Línea indexada por UVA.</span>
          <span className="text-white/40 ml-1">La cuota se ajusta mensualmente según la evolución del coeficiente UVA (BCRA). El valor mostrado es la cuota inicial.</span>
        </div>
      )}

      {/* Warning */}
      <div className="rounded-xl px-4 py-3 mb-3 text-xs" style={{ background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.15)' }}>
        <span className="text-yellow-300/80 font-semibold">⚠️ No incluye seguro del vehículo.</span>
        <span className="text-white/40 ml-1">El seguro de automotor debe contratarse por separado.</span>
      </div>
    </div>
  )
}

// ─── CANVAS BUDGET GENERATOR ─────────────────────────────────────────────────
function drawBudgetCanvas(
  canvas: HTMLCanvasElement,
  model: Model,
  capital: number,
  cuotas: number,
  blue: number,
  activeColor: Color | null,
  imgKey: string | null,
  line: CreditLine
) {
  const W = 480, H = 940
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  const tc = blue || 1
  const cuotaBase = calcBase(capital, cuotas, line.tna)
  const interesTotal = cuotaBase * cuotas - capital
  const ivaXCuota = (interesTotal * IVA) / cuotas
  const seguroXCuota = capital * SEGURO
  const cuotaTotal = cuotaBase + ivaXCuota + seguroXCuota
  const totalGeneral = cuotaTotal * cuotas
  const precioARS = model.precio_usd * tc
  const patentamientoARS = model.patentamiento_usd * tc
  const quebrantoPct = line.quebranto?.[cuotas]
  const quebrantoBase = quebrantoPct ? capital * quebrantoPct : 0
  const quebrantoMonto = quebrantoBase * (1 + IVA)
  const costoPrenda = capital * COSTO_PRENDA

  // BG
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0a0f1e'); bg.addColorStop(1, '#0e1830')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Glow
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 320)
  glow.addColorStop(0, 'rgba(0,212,232,0.1)'); glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 320)

  let y = 0

  function rr(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
  }

  // Header
  ctx.fillStyle = 'rgba(0,212,232,0.08)'; ctx.fillRect(0, 0, W, 68)
  ctx.strokeStyle = 'rgba(0,212,232,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 68); ctx.lineTo(W, 68); ctx.stroke()
  ctx.font = 'bold 26px Arial'; ctx.fillStyle = '#00d4e8'; ctx.textAlign = 'left'
  ctx.fillText('BYD', 22, 44)
  ctx.font = '500 13px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'right'
  ctx.fillText('Bjack · BYD Argentina', W - 22, 36)
  ctx.font = '400 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('COTIZACIÓN FORMAL DE CRÉDITO', W - 22, 54)
  ctx.textAlign = 'left'
  y = 68

  // Car image section
  const imgH = 180
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, y, W, imgH)

  const drawRest = () => {
    // Model name bar
    ctx.fillStyle = 'rgba(0,212,232,0.07)'; ctx.fillRect(0, y, W, 60)
    ctx.strokeStyle = 'rgba(0,212,232,0.12)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, y + 60); ctx.lineTo(W, y + 60); ctx.stroke()
    ctx.font = 'bold 18px Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'
    ctx.fillText(model.nombre, 20, y + 24)
    ctx.font = '500 12px Arial'; ctx.fillStyle = '#00d4e8'
    ctx.fillText(model.tipo, 20, y + 46)
    // USD price pill
    ctx.fillStyle = 'rgba(0,212,232,0.12)'; rr(W - 125, y + 14, 106, 28, 14); ctx.fill()
    ctx.strokeStyle = 'rgba(0,212,232,0.25)'; rr(W - 125, y + 14, 106, 28, 14); ctx.stroke()
    ctx.font = '500 12px Arial'; ctx.fillStyle = '#00d4e8'; ctx.textAlign = 'right'
    ctx.fillText(fu(model.precio_usd), W - 18, y + 33)
    ctx.textAlign = 'left'; y += 60

    // Price in pesos
    ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0, y, W, 50)
    ctx.font = '400 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('PRECIO DE LISTA AL TC BLUE', 20, y + 17)
    ctx.font = 'bold 17px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.fillText(fp(precioARS), 20, y + 38)
    ctx.font = '400 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'right'
    ctx.fillText('Patentamiento: ' + fp(patentamientoARS), W - 20, y + 38)
    ctx.textAlign = 'left'
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(0, y + 50); ctx.lineTo(W, y + 50); ctx.stroke()
    y += 50

    // Big cuota box
    const boxH = 108
    const boxGrad = ctx.createLinearGradient(0, y, 0, y + boxH)
    boxGrad.addColorStop(0, '#0e2040'); boxGrad.addColorStop(1, '#0a1628')
    ctx.fillStyle = boxGrad; ctx.fillRect(0, y, W, boxH)
    ctx.strokeStyle = 'rgba(0,212,232,0.22)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.moveTo(0, y + boxH); ctx.lineTo(W, y + boxH); ctx.stroke()
    const lg = ctx.createLinearGradient(0, 0, W, 0)
    lg.addColorStop(0, 'transparent'); lg.addColorStop(0.5, 'rgba(0,212,232,0.45)'); lg.addColorStop(1, 'transparent')
    ctx.strokeStyle = lg; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, y + 1); ctx.lineTo(W, y + 1); ctx.stroke()
    ctx.font = '500 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.textAlign = 'left'
    ctx.fillText(line.uva ? 'CUOTA MENSUAL INICIAL' : 'CUOTA MENSUAL TOTAL', 20, y + 21)
    ctx.font = 'bold 36px monospace'; ctx.fillStyle = '#00d4e8'
    ctx.fillText(fp(cuotaTotal), 20, y + 66)
    ctx.font = '400 11px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillText('≈ ' + fu(cuotaTotal / tc), 20, y + 87)
    ctx.textAlign = 'right'
    ctx.font = 'bold 20px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(cuotas + ' cuotas', W - 20, y + 50)
    ctx.font = '500 11px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.fillText('Vencimiento: día 10 de cada mes', W - 20, y + 70)
    ctx.font = '500 10px Arial'; ctx.fillStyle = 'rgba(0,212,232,0.7)'
    ctx.fillText('TNA ' + pct(line.tna), W - 20, y + 88)
    ctx.textAlign = 'left'; y += boxH

    // Breakdown strip
    const bItems = [
      { label: 'Capital/cuota', val: fp(cuotaBase), color: 'rgba(255,255,255,0.65)' },
      { label: 'IVA 21%', val: fp(ivaXCuota), color: 'rgba(255,220,80,0.85)' },
      { label: 'Seguro', val: fp(seguroXCuota), color: 'rgba(180,160,255,0.85)' },
    ]
    const bW = W / 3
    bItems.forEach((it, i) => {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0)'
      ctx.fillRect(i * bW, y, bW, 42)
      if (i > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.moveTo(i * bW, y + 5); ctx.lineTo(i * bW, y + 37); ctx.stroke() }
      ctx.font = '400 9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.textAlign = 'center'
      ctx.fillText(it.label, i * bW + bW / 2, y + 15)
      ctx.font = '500 11px monospace'; ctx.fillStyle = it.color
      ctx.fillText(it.val, i * bW + bW / 2, y + 32)
    })
    ctx.textAlign = 'left'
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(0, y + 42); ctx.lineTo(W, y + 42); ctx.stroke()
    y += 42

    // Detail rows
    const rows = [
      ['Línea de crédito', line.nombre],
      ['Capital financiado', fp(capital) + ' (' + fu(capital / tc) + ')'],
      ['Precio de lista', fp(precioARS) + ' (' + fu(model.precio_usd) + ')'],
      ['Patentamiento', fp(patentamientoARS) + ' (' + fu(model.patentamiento_usd) + ')'],
      ['TNA', pct(line.tna)],
      ['Plazo', cuotas + ' meses'],
      ...(quebrantoPct ? [['Quebranto (bonif. tasa)', fp(quebrantoMonto) + ' (' + pct(quebrantoPct) + ' + IVA)']] : []),
      ['Costo de prenda', fp(costoPrenda) + ' (' + pct(COSTO_PRENDA) + ')'],
      ['Total a pagar', fp(totalGeneral) + ' (' + fu(totalGeneral / tc) + ')'],
      ['Tipo de cambio blue', '$ ' + tc.toLocaleString('es-AR') + ' / USD'],
    ]
    rows.forEach((row, i) => {
      const ry = y + i * 34
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0)'
      ctx.fillRect(0, ry, W, 34)
      ctx.font = '400 11px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.textAlign = 'left'
      ctx.fillText(row[0], 20, ry + 22)
      ctx.font = '500 11px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.textAlign = 'right'
      ctx.fillText(row[1], W - 18, ry + 22)
    })
    ctx.textAlign = 'left'
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(0, y + rows.length * 34); ctx.lineTo(W, y + rows.length * 34); ctx.stroke()
    y += rows.length * 34

    // Color display
    if (activeColor) {
      ctx.fillStyle = 'rgba(0,212,232,0.05)'; ctx.fillRect(0, y, W, 42)
      ctx.font = '500 10px Arial'; ctx.fillStyle = 'rgba(0,212,232,0.65)'
      ctx.fillText('COLOR SELECCIONADO', 20, y + 17)
      ctx.beginPath(); ctx.arc(130, y + 22, 8, 0, Math.PI * 2)
      ctx.fillStyle = activeColor.hex; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.font = '400 11px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.fillText(activeColor.name, 146, y + 26)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(0, y + 42); ctx.lineTo(W, y + 42); ctx.stroke()
      y += 42
    }

    // Warning seguro
    ctx.fillStyle = 'rgba(255,180,0,0.05)'; ctx.fillRect(0, y, W, 40)
    ctx.font = 'bold 10px Arial'; ctx.fillStyle = 'rgba(255,200,0,0.8)'
    ctx.fillText('⚠️  Esta cotización NO incluye el seguro del vehículo.', 20, y + 16)
    ctx.font = '400 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.32)'
    ctx.fillText('El seguro de automotor debe contratarse por separado.', 20, y + 32)
    ctx.strokeStyle = 'rgba(255,180,0,0.12)'; ctx.beginPath(); ctx.moveTo(0, y + 40); ctx.lineTo(W, y + 40); ctx.stroke()
    y += 40

    // Footer
    const footerY = y
    ctx.fillStyle = 'rgba(0,212,232,0.05)'; ctx.fillRect(0, footerY, W, H - footerY)
    ctx.strokeStyle = 'rgba(0,212,232,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, footerY); ctx.lineTo(W, footerY); ctx.stroke()

    const today = new Date()
    const vto = new Date(today); vto.setDate(vto.getDate() + 30)
    const fStr = today.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    const vStr = vto.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

    ctx.font = '500 10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.textAlign = 'left'
    ctx.fillText('Fecha: ' + fStr, 20, footerY + 18)
    ctx.font = 'bold 10px Arial'; ctx.fillStyle = 'rgba(0,212,232,0.75)'
    ctx.fillText('Validez: 30 días · Vence: ' + vStr, 20, footerY + 34)
    ctx.font = '400 9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillText('⚡ Los valores están sujetos a modificación según valor del dólar.', 20, footerY + 50)
    ctx.font = '400 9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.fillText('Sujeto a aprobación crediticia. Sin gastos de otorgamiento.', 20, footerY + 64)

    ctx.font = 'bold 16px Arial'; ctx.fillStyle = 'rgba(0,212,232,0.35)'; ctx.textAlign = 'right'
    ctx.fillText('BYD', W - 20, H - 14)
    ctx.font = '400 9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText('Bjack', W - 20, H - 28)
    ctx.textAlign = 'left'
  }

  const finalY = y + imgH

  if (imgKey && IMAGES[imgKey]) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, y, W, imgH)
      const ov = ctx.createLinearGradient(0, y, 0, y + imgH)
      ov.addColorStop(0, 'rgba(10,15,30,0.25)'); ov.addColorStop(1, 'rgba(10,15,30,0.55)')
      ctx.fillStyle = ov; ctx.fillRect(0, y, W, imgH)
      if (model.imagenIlustrativa) {
        ctx.font = '500 10px Arial'; ctx.textAlign = 'right'
        const label = 'Imagen ilustrativa'
        const padX = 10, labelW = ctx.measureText(label).width + padX * 2
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(W - labelW - 12, y + 10, labelW, 22, 11); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.fillText(label, W - 12 - padX, y + 25)
        ctx.textAlign = 'left'
      }
      y = finalY; drawRest()
    }
    img.onerror = () => { y = finalY; drawRest() }
    img.src = IMAGES[imgKey]
  } else {
    ctx.font = '56px Arial'; ctx.textAlign = 'center'
    ctx.fillText('🚗', W / 2, y + imgH / 2 + 20)
    ctx.textAlign = 'left'; y = finalY; drawRest()
  }
}

// ─── WA MODAL ────────────────────────────────────────────────────────────────
function WAModal({ onClose, onSend }: { onClose: () => void, onSend: (phone: string) => void }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState(false)

  const handleSend = () => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length < 8) { setError(true); return }
    onSend(clean)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: '#1a1a2e', border: '1px solid rgba(0,212,232,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-white text-base">Enviar por WhatsApp</span>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        <label className="block text-xs text-white/60 mb-1.5">Número del cliente</label>
        <div className="flex gap-2 mb-1">
          <div className="flex items-center px-3 text-sm text-white/50 rounded-xl h-11" style={{ background: '#1c2540', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
            🇦🇷 +54
          </div>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(false) }}
            placeholder="11 1234-5678"
            inputMode="numeric"
            autoFocus
            className={`flex-1 h-11 px-4 text-base font-mono rounded-xl text-white placeholder-white/20 ${error ? 'border-red-400/60' : 'border-white/10'}`}
            style={{ background: '#1c2540', border: `1px solid ${error ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)'}` }}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
        </div>
        {error && <div className="text-red-400 text-xs mb-2">⚠ Ingresá un número válido</div>}
        <div className="text-[11px] text-white/30 mb-4">Solo números, sin 0 ni 15. Ej: 1134567890</div>

        <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(0,212,232,0.05)', border: '1px solid rgba(0,212,232,0.12)' }}>
          <div className="text-xs font-semibold text-[#00d4e8] mb-2">📎 Se descarga automáticamente:</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-white/55">🖼️ Imagen del presupuesto (JPG)</div>
          </div>
        </div>

        <div className="rounded-xl px-3 py-2.5 mb-4 text-xs text-yellow-300/75 leading-relaxed" style={{ background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.12)' }}>
          ⚠️ Una vez que se abra WhatsApp, adjuntá la imagen descargada.
        </div>

        <button
          onClick={handleSend}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #25D366, #1db954)', boxShadow: '0 4px 20px rgba(37,211,102,0.25)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.535 5.845L0 24l6.341-1.513A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.375l-.36-.213-3.725.888.937-3.629-.234-.374A9.779 9.779 0 012.182 12C2.182 6.576 6.576 2.182 12 2.182S21.818 6.576 21.818 12 17.424 21.818 12 21.818z"/>
          </svg>
          Descargar y abrir WhatsApp
        </button>
      </div>
    </div>
  )
}

// ─── CANVAS PREVIEW MODAL ─────────────────────────────────────────────────────
function PreviewModal({ visible, canvasRef, onClose, onDownload, onWA }: {
  visible: boolean,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onClose: () => void,
  onDownload: () => void,
  onWA: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', display: visible ? 'flex' : 'none' }}
    >
      <div className="w-full max-w-lg rounded-2xl p-5 my-4" style={{ background: '#1a1a2e', border: '1px solid rgba(0,212,232,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-white text-base">Vista previa del presupuesto</span>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="rounded-xl overflow-hidden mb-4">
          <canvas ref={canvasRef} className="w-full block" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onDownload} className="py-3 rounded-xl font-bold text-sm text-navy transition-opacity hover:opacity-85" style={{ background: '#00d4e8', color: '#0a0f1e' }}>
            ⬇ Descargar JPG
          </button>
          <button onClick={onWA} className="py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-88" style={{ background: '#25D366' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.535 5.845L0 24l6.341-1.513A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.375l-.36-.213-3.725.888.937-3.629-.234-.374A9.779 9.779 0 012.182 12C2.182 6.576 6.576 2.182 12 2.182S21.818 6.576 21.818 12 17.424 21.818 12 21.818z"/></svg>
            Enviar por WA
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [blueInput, setBlueInput] = useState('')
  const [model, setModel] = useState<Model | null>(null)
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [linea, setLinea] = useState<CreditLine>(CREDIT_LINES[0])
  const [capital, setCapital] = useState('')
  const [cuotas, setCuotas] = useState(24)
  const [showWA, setShowWA] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const blueNum = parseFloat(blueInput.replace(/\./g, '').replace(',', '.'))
  const blue = blueNum > 0 ? blueNum : null

  const onModelChange = (m: Model) => {
    setModel(m)
    setActiveColor(m.colores.find(c => c.imgKey === m.defaultImg) || m.colores[0])
  }

  const onLineaChange = (l: CreditLine) => {
    setLinea(l)
    if (!l.plazos.includes(cuotas)) setCuotas(l.plazos.includes(24) ? 24 : l.plazos[0])
  }

  const capitalNum = parseFloat(capital.replace(/\./g, '').replace(',', '.')) || 0
  const hasResult = model && capitalNum > 0

  const generateCanvas = () => {
    if (!model || !canvasRef.current) return
    const imgKey = activeColor?.imgKey || model.defaultImg
    drawBudgetCanvas(canvasRef.current, model, capitalNum, cuotas, blue || 0, activeColor, imgKey, linea)
  }

  const openPreview = () => {
    if (!hasResult) return
    generateCanvas()
    setShowPreview(true)
  }

  const downloadImg = () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(blob => {
      if (!blob) return
      const a = document.createElement('a')
      a.download = `presupuesto-byd-${model?.id || 'cotizacion'}.jpg`
      a.href = URL.createObjectURL(blob)
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/jpeg', 0.92)
  }

  const doSendWA = (phone: string) => {
    if (!model) return
    const tc = blue || 0
    const cuotaBase = calcBase(capitalNum, cuotas, linea.tna)
    const interesTotal = cuotaBase * cuotas - capitalNum
    const ivaXCuota = (interesTotal * IVA) / cuotas
    const seguroXCuota = capitalNum * SEGURO
    const cuotaTotal = cuotaBase + ivaXCuota + seguroXCuota
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    const colorStr = activeColor?.name || 'A confirmar'
    const quebrantoPct = linea.quebranto?.[cuotas]
    const quebrantoLine = quebrantoPct ? `• Quebranto: *${fp(capitalNum * quebrantoPct * (1 + IVA))}* (${pct(quebrantoPct)} + IVA, no incl. IIBB)\n` : ''
    const costoPrenda = capitalNum * COSTO_PRENDA

    const msg =
      `🚗 *COTIZACIÓN FORMAL BYD ARGENTINA*\n` +
      `_Fecha: ${fecha}_\n\n` +
      `📋 *Vehículo:* ${model.nombre}\n` +
      `⚡ *Tecnología:* ${model.tipo}\n` +
      `🎨 *Color:* ${colorStr}\n` +
      `💵 *Precio de lista:* ${fp(model.precio_usd * tc)} (${fu(model.precio_usd)})\n` +
      `💱 *TC Blue:* $ ${tc.toLocaleString('es-AR')} / USD\n\n` +
      `🏦 *CONDICIONES DEL CRÉDITO — ${linea.nombre}*\n` +
      `• Capital: *${fp(capitalNum)}* (≈ ${fu(capitalNum / tc)})\n` +
      `• TNA: ${pct(linea.tna)}  |  Plazo: ${cuotas} meses\n` +
      quebrantoLine +
      `• Costo de prenda: *${fp(costoPrenda)}* (${pct(COSTO_PRENDA)})\n` +
      `• Vencimiento de cuota: *día 10 de cada mes*\n` +
      `*Cuota ${linea.uva ? 'inicial' : 'total'}: ${fp(cuotaTotal)}*\n` +
      (linea.uva ? `_Cuota indexada por UVA: se ajusta mensualmente según el coeficiente UVA (BCRA)._\n` : '') +
      `\n*Esta cotización NO incluye el seguro del vehículo.*\n\n` +
      `✅ *Validez: 30 días*\n` +
      `_Los valores están sujetos a modificación según valor del dólar._\n` +
      `_Sujeto a aprobación crediticia. Sin gastos de otorgamiento._\n\n` +
      `¿Te interesa avanzar con la reserva? ¡Consultanos! 🤝`

    // 1. Download image
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (!blob) return
        const a = document.createElement('a')
        a.download = `presupuesto-byd-${model.id}.jpg`
        a.href = URL.createObjectURL(blob)
        a.click()
        URL.revokeObjectURL(a.href)
      }, 'image/jpeg', 0.92)
    }

    // 2. Open WhatsApp
    setTimeout(() => {
      window.open(`https://wa.me/54${phone}?text=${encodeURIComponent(msg)}`, '_blank')
      setShowWA(false)
      setShowPreview(false)
    }, 600)
  }

  return (
    <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-16">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0c1836, #162040)', border: '1px solid rgba(0,212,232,0.3)', boxShadow: '0 0 24px rgba(0,212,232,0.15)' }}>
          <svg viewBox="0 0 88 32" width="42" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="26" fontFamily="Arial" fontWeight="900" fontSize="28" fill="#00d4e8">BYD</text>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Cotizador de Créditos</h1>
          <p className="text-xs text-white/50 mt-0.5">Bjack · BYD Argentina</p>
        </div>
      </div>

      {/* Blue rate */}
      <BlueBar value={blueInput} onChange={setBlueInput} />

      {/* Chips */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'TNA', val: pct(linea.tna), hi: true },
          { label: 'Moneda crédito', val: linea.uva ? 'Pesos (UVA)' : 'Pesos $', hi: false },
          { label: 'Hasta', val: `${Math.max(...linea.plazos)} cuotas`, hi: false },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl py-2 px-3 text-center">
            <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{c.label}</div>
            <div className={`text-sm font-semibold ${c.hi ? 'text-[#00d4e8]' : 'text-white'}`}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Linea de credito selector */}
      <LineaSelector selected={linea} onChange={onLineaChange} />

      {/* Model selector */}
      <ModelSelector selected={model} onChange={onModelChange} />

      {/* Price info */}
      {model && blue && (
        <div className="glass rounded-xl px-4 py-3 mb-4 text-sm fade-up">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">Precio de lista</span>
            <span className="font-mono text-xs text-white/30">{fu(model.precio_usd)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-semibold text-white">{fp(model.precio_usd * blue)}</span>
            <span className="text-white/40 text-xs">Patentamiento: {fp(model.patentamiento_usd * blue)}</span>
          </div>
        </div>
      )}

      {/* Gallery */}
      {model && (
        <ImageGallery model={model} activeColor={activeColor} onColorChange={setActiveColor} />
      )}

      {/* Capital input */}
      <div className="mb-4">
        <label className="block text-xs text-white/60 mb-1.5">
          Monto del crédito (en pesos $) <span className="text-white/25 text-[10px] ml-1">carga manual</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm pointer-events-none">$</span>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            placeholder="Ej: 15000000"
            inputMode="numeric"
            className="w-full h-11 pl-7 pr-4 text-sm font-mono bg-[#1c2540] text-white border border-white/10 rounded-xl"
          />
        </div>
        {capital && blue && (
          <div className="text-xs text-white/30 font-mono mt-1.5">
            ≈ <strong className="text-white/55">{fu(capitalNum / blue)}</strong> al tipo de cambio blue
          </div>
        )}
      </div>

      {/* Cuotas */}
      <CuotasGrid selected={cuotas} onChange={setCuotas} opts={linea.plazos} />

      {/* Result */}
      {hasResult && (
        <ResultCard model={model} capital={capitalNum} cuotas={cuotas} blue={blue} activeColor={activeColor} line={linea} />
      )}

      {/* Action buttons */}
      {hasResult && (
        <div className="grid grid-cols-2 gap-3 mt-3 fade-up">
          <button
            onClick={openPreview}
            className="py-3 rounded-xl text-[#00d4e8] font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(0,212,232,0.1)', border: '1px solid rgba(0,212,232,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Generar imagen
          </button>
          <button
            onClick={() => { generateCanvas(); setShowWA(true) }}
            className="py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #25D366, #1db954)', boxShadow: '0 4px 20px rgba(37,211,102,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.535 5.845L0 24l6.341-1.513A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.375l-.36-.213-3.725.888.937-3.629-.234-.374A9.779 9.779 0 012.182 12C2.182 6.576 6.576 2.182 12 2.182S21.818 6.576 21.818 12 17.424 21.818 12 21.818z"/></svg>
            Enviar por WhatsApp
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-center text-[10px] text-white/20 leading-relaxed mt-6 px-2">
        Cotización a modo de referencia. {linea.nombre} · TNA {pct(linea.tna)}{linea.uva ? ' (indexada UVA)' : ''}<br />
        Sistema francés · IVA 21% s/ intereses · Seguro vida/desempleo incluido<br />
        Sujeto a aprobación crediticia
      </div>

      {/* Modals */}
      {showWA && <WAModal onClose={() => setShowWA(false)} onSend={doSendWA} />}
      <PreviewModal
        visible={showPreview}
        canvasRef={canvasRef}
        onClose={() => setShowPreview(false)}
        onDownload={downloadImg}
        onWA={() => { setShowPreview(false); setShowWA(true) }}
      />
    </div>
  )
}
