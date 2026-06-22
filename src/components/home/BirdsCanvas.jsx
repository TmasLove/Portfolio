import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Legacy Three.js (r95) + Canvas renderer + Bird geometry, served from /public/js.
// Loaded in order; they attach THREE and Bird to window.
const SCRIPTS = ['/js/three.min.js', '/js/projector.js', '/js/canvasRenderer.js', '/js/bird.js']

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-birds="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.dataset.birds = src
    s.onload = () => { s.dataset.loaded = 'true'; resolve() }
    s.onerror = reject
    document.body.appendChild(s)
  })
}

// Adapted boid (flocking) logic from the original openprocessing-based canvas.js.
function makeBoid(THREE) {
  const Boid = function () {
    let vector = new THREE.Vector3()
    let _acceleration
    let _width = 500, _height = 500, _depth = 200, _goal
    const _neighborhoodRadius = 70, _maxSpeed = 3, _maxSteerForce = 0.1
    let _avoidWalls = false
    this.position = new THREE.Vector3()
    this.velocity = new THREE.Vector3()
    _acceleration = new THREE.Vector3()
    this.setGoal = (t) => { _goal = t }
    this.setAvoidWalls = (v) => { _avoidWalls = v }
    this.setWorldSize = (w, h, d) => { _width = w; _height = h; _depth = d }
    this.run = function (boids) {
      if (_avoidWalls) {
        const edges = [
          [-_width, this.position.y, this.position.z], [_width, this.position.y, this.position.z],
          [this.position.x, -_height, this.position.z], [this.position.x, _height, this.position.z],
          [this.position.x, this.position.y, -_depth], [this.position.x, this.position.y, _depth],
        ]
        for (const e of edges) {
          vector.set(e[0], e[1], e[2])
          vector = this.avoid(vector)
          vector.multiplyScalar(5)
          _acceleration.add(vector)
        }
      }
      if (Math.random() > 0.5) this.flock(boids)
      this.move()
    }
    this.flock = function (boids) {
      if (_goal) _acceleration.add(this.reach(_goal, 0.005))
      _acceleration.add(this.alignment(boids))
      _acceleration.add(this.cohesion(boids))
      _acceleration.add(this.separation(boids))
    }
    this.move = function () {
      this.velocity.add(_acceleration)
      const l = this.velocity.length()
      if (l > _maxSpeed) this.velocity.divideScalar(l / _maxSpeed)
      this.position.add(this.velocity)
      _acceleration.set(0, 0, 0)
    }
    this.avoid = function (target) {
      const steer = new THREE.Vector3()
      steer.copy(this.position); steer.sub(target)
      steer.multiplyScalar(1 / this.position.distanceToSquared(target))
      return steer
    }
    this.repulse = function (target) {
      const distance = this.position.distanceTo(target)
      if (distance < 150) {
        const steer = new THREE.Vector3()
        steer.subVectors(this.position, target)
        steer.multiplyScalar(0.5 / distance)
        _acceleration.add(steer)
      }
    }
    this.reach = function (target, amount) {
      const steer = new THREE.Vector3()
      steer.subVectors(target, this.position); steer.multiplyScalar(amount)
      return steer
    }
    this.alignment = function (boids) {
      let count = 0
      const velSum = new THREE.Vector3()
      for (let i = 0; i < boids.length; i++) {
        if (Math.random() > 0.6) continue
        const boid = boids[i]
        const d = boid.position.distanceTo(this.position)
        if (d > 0 && d <= _neighborhoodRadius) { velSum.add(boid.velocity); count++ }
      }
      if (count > 0) {
        velSum.divideScalar(count)
        const l = velSum.length()
        if (l > _maxSteerForce) velSum.divideScalar(l / _maxSteerForce)
      }
      return velSum
    }
    this.cohesion = function (boids) {
      let count = 0
      const posSum = new THREE.Vector3()
      const steer = new THREE.Vector3()
      for (let i = 0; i < boids.length; i++) {
        if (Math.random() > 0.6) continue
        const boid = boids[i]
        const d = boid.position.distanceTo(this.position)
        if (d > 0 && d <= _neighborhoodRadius) { posSum.add(boid.position); count++ }
      }
      if (count > 0) posSum.divideScalar(count)
      steer.subVectors(posSum, this.position)
      const l = steer.length()
      if (l > _maxSteerForce) steer.divideScalar(l / _maxSteerForce)
      return steer
    }
    this.separation = function (boids) {
      const posSum = new THREE.Vector3()
      const repulse = new THREE.Vector3()
      for (let i = 0; i < boids.length; i++) {
        if (Math.random() > 0.6) continue
        const boid = boids[i]
        const d = boid.position.distanceTo(this.position)
        if (d > 0 && d <= _neighborhoodRadius) {
          repulse.subVectors(this.position, boid.position)
          repulse.normalize(); repulse.divideScalar(d); posSum.add(repulse)
        }
      }
      return posSum
    }
  }
  return Boid
}

export default function BirdsCanvas({ className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    let raf, renderer, onMove, onResize
    let cancelled = false

    ;(async () => {
      try { for (const src of SCRIPTS) await loadScript(src) } catch { return }
      if (cancelled || !el) return
      const THREE = window.THREE
      const Bird = window.Bird
      if (!THREE || !Bird || !THREE.CanvasRenderer) return

      const Boid = makeBoid(THREE)
      let W = el.clientWidth || window.innerWidth
      let H = el.clientHeight || window.innerHeight

      const camera = new THREE.PerspectiveCamera(75, W / H, 1, 10000)
      camera.position.z = 450
      const scene = new THREE.Scene()
      const birds = [], boids = []

      for (let i = 0; i < 22; i++) {
        const boid = boids[i] = new Boid()
        boid.position.set(Math.random() * 500 - 200, Math.random() * 500 - 200, Math.random() * 500 - 200)
        boid.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        boid.setAvoidWalls(true)
        boid.setWorldSize(500, 500, 400)
        const bird = birds[i] = new THREE.Mesh(new Bird(), new THREE.MeshBasicMaterial({ color: 0x161616, side: THREE.DoubleSide }))
        bird.phase = Math.floor(Math.random() * 62.83)
        scene.add(bird)
      }

      renderer = new THREE.CanvasRenderer({ alpha: true })
      renderer.setClearColor(0x000000, 0) // transparent — only birds paint
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(W, H)
      el.appendChild(renderer.domElement)

      onMove = (event) => {
        const rect = el.getBoundingClientRect()
        const vx = event.clientX - rect.left - W / 2
        const vy = -(event.clientY - rect.top) + H / 2
        const v = new THREE.Vector3(vx, vy, 0)
        for (let i = 0; i < boids.length; i++) { v.z = boids[i].position.z; boids[i].repulse(v) }
      }
      window.addEventListener('mousemove', onMove)

      onResize = () => {
        W = el.clientWidth || window.innerWidth
        H = el.clientHeight || window.innerHeight
        camera.aspect = W / H
        camera.updateProjectionMatrix()
        renderer.setSize(W, H)
      }
      window.addEventListener('resize', onResize)

      const render = () => {
        for (let i = 0; i < birds.length; i++) {
          const boid = boids[i]
          boid.run(boids)
          const bird = birds[i]
          bird.position.copy(boid.position)
          bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x)
          bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length())
          bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83
          bird.geometry.vertices[5].y = bird.geometry.vertices[4].y = Math.sin(bird.phase) * 5
          bird.geometry.verticesNeedUpdate = true
        }
        renderer.render(scene, camera)
      }
      const animate = () => { raf = requestAnimationFrame(animate); render() }
      animate()
    })()

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      if (onMove) window.removeEventListener('mousemove', onMove)
      if (onResize) window.removeEventListener('resize', onResize)
      if (renderer && renderer.domElement && el && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [reduce])

  return <div ref={ref} className={className} aria-hidden="true" />
}
