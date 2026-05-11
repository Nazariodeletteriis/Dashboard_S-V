import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface AnimatedBackgroundProps {
  /** 'subtle' per le pagine interne (Layout), 'rich' per la pagina di login */
  variant?: 'subtle' | 'rich'
}

/**
 * Sfondo ambientale animato — orbi gold/wine in movimento + grid sottile + grano.
 * È fixed e pointer-events-none, quindi non interferisce con l'interazione.
 * Mountato in Layout per le pagine interne, e in Login direttamente.
 */
export function AnimatedBackground({ variant = 'subtle' }: AnimatedBackgroundProps) {
  // Posizioni casuali stabili tra render — memoizzate per non saltare
  const sparks = useMemo(
    () => Array.from({ length: variant === 'rich' ? 16 : 8 }, (_, i) => ({
      id:        i,
      x:         Math.random() * 100,
      y:         Math.random() * 100,
      size:      Math.random() * 2 + 1.5,
      delay:     Math.random() * 5,
      duration:  Math.random() * 6 + 6,
    })),
    [variant],
  )

  const opacity = variant === 'rich' ? 0.45 : 0.25

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Orb #1 — bordeaux, lento, in alto a sinistra → in basso a destra */}
      <motion.div
        className="absolute w-[42rem] h-[42rem] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(123,45,62,0.35) 0%, rgba(123,45,62,0) 60%)',
          opacity,
          filter: 'blur(40px)',
        }}
        initial={{ x: '-10%', y: '-15%' }}
        animate={{
          x: ['-10%', '40%', '20%', '-10%'],
          y: ['-15%', '20%', '60%', '-15%'],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb #2 — oro, controfaserato */}
      <motion.div
        className="absolute w-[36rem] h-[36rem] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(201,169,110,0.28) 0%, rgba(201,169,110,0) 65%)',
          opacity,
          filter: 'blur(60px)',
        }}
        initial={{ x: '60%', y: '70%' }}
        animate={{
          x: ['60%', '20%', '70%', '60%'],
          y: ['70%', '30%', '10%', '70%'],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb #3 — piccolo, plum, solo nella variante rich (login) */}
      {variant === 'rich' && (
        <motion.div
          className="absolute w-[24rem] h-[24rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(157,58,79,0.22) 0%, rgba(157,58,79,0) 70%)',
            opacity: 0.5,
            filter: 'blur(50px)',
          }}
          initial={{ x: '40%', y: '20%' }}
          animate={{
            x: ['40%', '-10%', '60%', '40%'],
            y: ['20%', '60%', '40%', '20%'],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Grid lattice — molto sottile */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,169,110,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      {/* Sparks — micro-particles oro che scintillano */}
      {sparks.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-gold-500"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            boxShadow: '0 0 6px rgba(201,169,110,0.6)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.2, 0.6] }}
          transition={{
            duration: s.duration,
            delay:    s.delay,
            repeat:   Infinity,
            ease:    'easeInOut',
          }}
        />
      ))}

      {/* Noise grain — SVG filter molto leggero */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  )
}
