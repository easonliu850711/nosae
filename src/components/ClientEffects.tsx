'use client'

import dynamic from 'next/dynamic'

const MoodRing = dynamic(() => import('./MoodRing'), { ssr: false })
const NightLamp = dynamic(() => import('./NightLamp'), { ssr: false })
const EveningLamp = dynamic(() => import('./EveningLamp'), { ssr: false })
const OmamoriCorner = dynamic(() => import('./OmamoriCorner'), { ssr: false })
const Bioluminescence = dynamic(() => import('./Bioluminescence'), { ssr: false })
const PetalTouch = dynamic(() => import('./PetalTouch'), { ssr: false })

// Keep browser-only effects within a client boundary while retaining the
// layout's server metadata and the original placement/order of each effect.
export function MoodRingEffect() { return <MoodRing /> }
export function AmbientEffects() {
  return <><PetalTouch /><Bioluminescence /><NightLamp /><EveningLamp /><OmamoriCorner /></>
}
