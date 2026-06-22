import { describe, it, expect } from 'vitest'
import { projects, CATEGORIES } from './projects'
describe('projects data', () => {
  it('has all projects with required fields', () => {
    expect(projects.length).toBeGreaterThanOrEqual(22)
    for (const p of projects) {
      expect(p.key && p.title && p.category && p.description).toBeTruthy()
      expect(Array.isArray(p.badges)).toBe(true)
    }
  })
  it('archived projects carry the archived badge + image', () => {
    const arch = projects.filter(p => p.category === 'archived')
    expect(arch.length).toBe(9)
    arch.forEach(p => { expect(p.badges).toContain('archived'); expect(p.image).toMatch(/^\/images\//) })
  })
  it('exposes filter categories', () => {
    expect(CATEGORIES).toEqual(['all','apps','web','ai','tool','archived'])
  })
})
