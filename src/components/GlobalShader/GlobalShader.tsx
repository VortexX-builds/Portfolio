import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scrollIntensity;

varying vec2 vUv;

// Hash and Noise functions
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 3; i++) {
        f += w * noise(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

void main() {
    vec2 uv = vUv;

    // Apply mouse warp
    float warp_radius = 0.6;
    float dist = length(uv - u_mouse);
    float warp_strength = exp(-dist * dist / (warp_radius * warp_radius));
    vec2 warp = (uv - u_mouse) * warp_strength * 0.15;
    
    // Scale UV for noise detail
    vec2 p = uv * 3.0 + warp; 

    // Time is now fully managed by JS (accelerates on scroll)
    float t = u_time;

    // Domain Warping - the secret to cinematic fluid
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t), fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.8));
    float f = fbm(p + 4.0 * r);

    // Mix colors based on the noise field 'f'
    // This creates actual visible texture instead of just black
    vec3 color_bg = vec3(0.004, 0.024, 0.024);       // Deep base (#010606)
    vec3 color_mid = vec3(0.024, 0.150, 0.130);      // Mid fluid
    vec3 color_highlight = vec3(0.090, 0.400, 0.350); // Bright highlights

    vec3 base_color = mix(color_bg, color_mid, clamp(f * f * 4.0, 0.0, 1.0));
    base_color = mix(base_color, color_highlight, clamp(length(q) * f * 1.5, 0.0, 1.0));

    // Gold filaments: highlight areas where noise is very intense
    float gold_mask = smoothstep(0.4, 0.75, f * length(r));
    vec3 gold = vec3(0.204, 0.827, 0.600); // #34D399 — vibrant green filament
    
    // Base resting filament opacity (6%), spikes to 20% based on scroll velocity
    float gold_opacity = gold_mask * mix(0.06, 0.20, clamp(u_scrollIntensity, 0.0, 1.0)); 
    
    vec3 final_color = mix(base_color, gold, gold_opacity);

    gl_FragColor = vec4(final_color, 1.0);
}
`

export interface GlobalShaderRef {}

export const GlobalShader = forwardRef<GlobalShaderRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const uniformsRef = useRef({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_scrollIntensity: { value: 0 },
  })

  useImperativeHandle(ref, () => ({}))

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    // Cap pixel ratio at 1.5 per instructions
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x010606, 1) // Base dark background

    // Scene & Camera
    const scene = new THREE.Scene()
    // Orthographic camera covering NDC perfectly
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      depthWrite: false,
      depthTest: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Mouse tracking setup
    let targetMouse = { x: 0.5, y: 0.5 }
    let currentMouse = { x: 0.5, y: 0.5 }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth
      // WebGL Y is flipped
      targetMouse.y = 1.0 - (e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        renderer.setSize(width, height, false)
        uniformsRef.current.u_resolution.value.set(width, height)
      }
    })
    resizeObserver.observe(canvas)

    // Animation Loop
    let rafId: number
    const clock = new THREE.Clock()
    let customTime = 0
    let lastScrollY = window.scrollY
    let currentScrollVelocity = 0

    const animate = () => {
      // 1. Calculate scroll velocity for this frame
      const currentScrollY = window.scrollY
      const deltaY = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY

      // Target velocity based on pixels moved (tuned for smooth visual)
      let targetVelocity = deltaY * 0.05
      targetVelocity = Math.min(targetVelocity, 3.0) // Cap max speed

      // Smoothly interpolate current velocity towards target (decay when stopped)
      currentScrollVelocity += (targetVelocity - currentScrollVelocity) * 0.08

      // Update shader scroll intensity uniform for the gold filament opacity
      uniformsRef.current.u_scrollIntensity.value = currentScrollVelocity

      // 2. Accumulate custom time safely
      const dt = clock.getDelta() // time since last frame
      // Base resting speed = 0.15. When scrolling, add velocity to speed up time
      customTime += dt * (0.15 + currentScrollVelocity * 1.5)
      uniformsRef.current.u_time.value = customTime

      // 3. Lerp mouse
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06
      uniformsRef.current.u_mouse.value.set(currentMouse.x, currentMouse.y)

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    // Start animation loop immediately
    clock.start()
    animate()

    // Page Visibility API to pause when off-screen/tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clock.stop()
        cancelAnimationFrame(rafId)
      } else {
        clock.start()
        animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
      
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="global-bg" aria-hidden="true" />
})
