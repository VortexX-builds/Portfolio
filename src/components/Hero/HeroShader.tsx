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
    for (int i = 0; i < 4; i++) {
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

    // Base time, modulated by scroll
    float t = u_time * (0.15 + u_scrollIntensity * 0.2);

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
    
    // Base resting filament opacity (6%), spikes to 18% on scroll
    float gold_opacity = gold_mask * mix(0.06, 0.18, u_scrollIntensity); 
    
    vec3 final_color = mix(base_color, gold, gold_opacity);

    gl_FragColor = vec4(final_color, 1.0);
}
`

export interface HeroShaderRef {
  setScrollIntensity: (val: number) => void
}

export const HeroShader = forwardRef<HeroShaderRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const uniformsRef = useRef({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_scrollIntensity: { value: 0 },
  })

  // Expose scroll intensity setter to parent
  useImperativeHandle(ref, () => ({
    setScrollIntensity: (val: number) => {
      uniformsRef.current.u_scrollIntensity.value = Math.min(Math.max(val, 0), 1)
    },
  }))

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

    const animate = () => {
      // Lerp mouse
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06
      uniformsRef.current.u_mouse.value.set(currentMouse.x, currentMouse.y)

      // Time
      uniformsRef.current.u_time.value = clock.getElapsedTime()

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clock.start() // resume time
          animate()
        } else {
          clock.stop()
          cancelAnimationFrame(rafId)
        }
      },
      { threshold: 0.0 }
    )
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
      
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
})
