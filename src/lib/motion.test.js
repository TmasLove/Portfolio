import { describe, it, expect } from 'vitest'
import { fadeUp, stagger } from './motion'

describe('motion variants', () => {
  it('fadeUp hides then shows with y offset', () => {
    expect(fadeUp.hidden.opacity).toBe(0)
    expect(fadeUp.visible.opacity).toBe(1)
    expect(fadeUp.hidden.y).toBeGreaterThan(0)
  })
  it('stagger sets container staggerChildren', () => {
    expect(stagger().visible.transition.staggerChildren).toBeGreaterThan(0)
  })
})
