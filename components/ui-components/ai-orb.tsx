"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AiOrbProps = {
  /** Accessible description for the rendered energy visualization. */
  ariaLabel?: string;
  className?: string;
  /** Controls the density and brightness of the volumetric field. */
  intensity?: number;
  /** Enables subtle pointer-following depth on fine pointers. */
  interactive?: boolean;
  /** Main energy color. Accepts any valid Three.js color string. */
  primaryColor?: string;
  /** Supporting color mixed through the quieter parts of the field. */
  secondaryColor?: string;
  /** Internal animation speed. Set to 0 for a still orb. */
  speed?: number;
};

type ThreeModule = typeof import("three");
type OrbUniforms = {
  uAsymmetry: { value: number };
  uDetail: { value: number };
  uIntensity: { value: number };
  uLocalCamera: { value: import("three").Vector3 };
  uPrimaryColor: { value: import("three").Color };
  uSecondaryColor: { value: import("three").Color };
  uTime: { value: number };
};

type AtmosphereUniforms = {
  uColor: { value: import("three").Color };
  uGlow: { value: number };
};

type OrbRuntime = {
  atmosphereUniforms: AtmosphereUniforms;
  orbitMaterial: import("three").MeshBasicMaterial;
  renderer: import("three").WebGLRenderer;
  render: () => void;
  
  uniforms: OrbUniforms;
};

type OrbSettings = Required<
  Pick<AiOrbProps, "intensity" | "interactive" | "primaryColor" | "secondaryColor" | "speed">
>;

const DEFAULT_SETTINGS: OrbSettings = {
  intensity: 1.25,
  interactive: true,
  primaryColor: "#00d9ff",
  secondaryColor: "#7c3aed",
  speed: 0.45,
};

const VERTEX_SHADER = `
  varying vec3 vLocalPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vLocalPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uDetail;
  uniform float uAsymmetry;
  uniform vec3 uLocalCamera;
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;

  varying vec3 vLocalPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, sine, -sine, cosine);
  }

  float evaluateStructure(vec3 position) {
    float accumulatedDensity = 0.0;
    vec3 anchor = position;
    mat2 animatedRotation = rotate2d(uTime * 0.42);
    mat2 asymmetricRotation = rotate2d(0.34 * uAsymmetry);

    for (int step = 0; step < 8; step++) {
      if (float(step) >= uDetail) break;

      position.xy *= animatedRotation;
      position.yz *= animatedRotation;
      position.xz *= asymmetricRotation;
      position += vec3(0.045, -0.018, 0.032) * uAsymmetry;

      vec3 folded = sqrt(position * position + 0.036);
      float magnitude = max(dot(folded, folded), 0.0001);
      position = (0.82 * folded / magnitude) - 0.82;

      float ySquared = position.y * position.y;
      float zSquared = position.z * position.z;
      position.yz = vec2(ySquared - zSquared, 2.0 * position.y * position.z);
      position = vec3(position.z, position.x, position.y);

      accumulatedDensity += exp(-17.5 * abs(dot(position, anchor)));
    }

    return accumulatedDensity * 0.55;
  }

  vec2 volumeBounds(vec3 origin, vec3 direction, float radius) {
    float projection = dot(origin, direction);
    float distanceToSurface = dot(origin, origin) - radius * radius;
    float discriminant = projection * projection - distanceToSurface;

    if (discriminant < 0.0) return vec2(-1.0);

    float root = sqrt(discriminant);
    return vec2(-projection - root, -projection + root);
  }

  vec3 traceEnergy(vec3 origin, vec3 direction, vec2 limits) {
    float depth = limits.x;
    float field = 0.0;
    vec3 energy = vec3(0.0);

    for (int sampleIndex = 0; sampleIndex < 48; sampleIndex++) {
      depth += 0.028 * exp(-1.8 * field);
      if (depth > limits.y) break;

      vec3 samplePoint = origin + depth * direction;
      field = evaluateStructure(samplePoint);
      float core = field * field;
      float colorMix = smoothstep(0.0, 0.52, field);
      vec3 gradient = mix(uSecondaryColor, uPrimaryColor, colorMix);
      vec3 emission = gradient * (field * 1.55 + core * 0.82);
      energy = energy * 0.985 + (0.07 * uIntensity) * emission;
    }

    return energy;
  }

  void main() {
    vec3 rayOrigin = uLocalCamera;
    vec3 rayDirection = normalize(vLocalPosition - uLocalCamera);
    mat2 slowTwist = rotate2d(uTime * 0.08);
    rayOrigin.xz *= slowTwist;
    rayDirection.xz *= slowTwist;

    vec2 limits = volumeBounds(rayOrigin, rayDirection, 1.72);
    if (limits.x < 0.0) discard;

    vec3 volumeColor = traceEnergy(rayOrigin, rayDirection, limits);
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);
    float facing = max(dot(normal, viewDirection), 0.0);
    float edgeFade = smoothstep(0.0, 0.08, facing);
    float fresnel = pow(1.0 - facing, 2.4);

    vec3 finalColor = 0.58 * log(1.0 + volumeColor);
    finalColor += uPrimaryColor * fresnel * 0.08 * uIntensity;
    finalColor = clamp(finalColor, 0.0, 1.0) * edgeFade;

    float luminance = max(finalColor.r, max(finalColor.g, finalColor.b));
    float alpha = clamp(luminance * 1.65, 0.0, 1.0) * edgeFade;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);
    float facing = max(dot(normal, viewDirection), 0.0);
    float fresnel = pow(0.8 - facing, 3.1);
    float edgeFade = smoothstep(0.0, 0.16, facing);
    float alpha = fresnel * edgeFade * uGlow;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function AiOrb({
  ariaLabel = "Animated AI energy orb",
  className,
  intensity = DEFAULT_SETTINGS.intensity,
  interactive = DEFAULT_SETTINGS.interactive,
  primaryColor = DEFAULT_SETTINGS.primaryColor,
  secondaryColor = DEFAULT_SETTINGS.secondaryColor,
  speed = DEFAULT_SETTINGS.speed,
}: AiOrbProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const runtimeRef = React.useRef<OrbRuntime | null>(null);
  const settingsRef = React.useRef<OrbSettings>(DEFAULT_SETTINGS);
  const [renderState, setRenderState] = React.useState<"loading" | "ready" | "fallback">("loading");

  settingsRef.current = {
    intensity: Math.max(0.25, Math.min(2.5, intensity)),
    interactive,
    primaryColor,
    secondaryColor,
    speed: Math.max(0, Math.min(2, speed)),
  };

  React.useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const safeIntensity = Math.max(0.25, Math.min(2.5, intensity));
    runtime.uniforms.uIntensity.value = safeIntensity;
    runtime.uniforms.uPrimaryColor.value.set(primaryColor);
    runtime.uniforms.uSecondaryColor.value.set(secondaryColor);
    runtime.atmosphereUniforms.uColor.value.set(primaryColor);
    runtime.atmosphereUniforms.uGlow.value = 0.34 + safeIntensity * 0.1;
    runtime.orbitMaterial.color.set(primaryColor);
    
    runtime.render();
  }, [intensity, primaryColor, secondaryColor]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let removePointerListeners = () => {};
    let disposeRuntime = () => {};

    const setup = async () => {
      try {
        const THREE: ThreeModule = await import("three");
        if (cancelled) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 6.4);

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "absolute inset-0 size-full";
        container.appendChild(renderer.domElement);

        const settings = settingsRef.current;
        const uniforms: OrbUniforms = {
          uAsymmetry: { value: 0.56 },
          uDetail: { value: 4 },
          uIntensity: { value: settings.intensity },
          uLocalCamera: { value: new THREE.Vector3() },
          uPrimaryColor: { value: new THREE.Color(settings.primaryColor) },
          uSecondaryColor: { value: new THREE.Color(settings.secondaryColor) },
          uTime: { value: 0 },
        };
        const atmosphereUniforms: AtmosphereUniforms = {
          uColor: { value: new THREE.Color(settings.primaryColor) },
          uGlow: { value: 0.34 + settings.intensity * 0.1 },
        };

        const geometry = new THREE.SphereGeometry(1.72, 72, 72);
        const energyMaterial = new THREE.ShaderMaterial({
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fragmentShader: FRAGMENT_SHADER,
          side: THREE.FrontSide,
          transparent: true,
          uniforms,
          vertexShader: VERTEX_SHADER,
        });
        const atmosphereMaterial = new THREE.ShaderMaterial({
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
          side: THREE.FrontSide,
          transparent: true,
          uniforms: atmosphereUniforms,
          vertexShader: ATMOSPHERE_VERTEX_SHADER,
        });

        const root = new THREE.Group();
        const orb = new THREE.Mesh(geometry, energyMaterial);
        const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
        atmosphere.scale.setScalar(1.055);
        orb.add(atmosphere);
        root.add(orb);

        const orbitMaterial = new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color: settings.primaryColor,
          opacity: 0.2,
          transparent: true,
        });
        
        const satelliteMaterial = new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color: settings.secondaryColor,
          transparent: true,
        });
        
        scene.add(root);

        const localCamera = new THREE.Vector3();
        const pointerTarget = new THREE.Vector2();
        const pointerCurrent = new THREE.Vector2();
        let isVisible = true;
        let lastTime = performance.now();

        const render = () => {
          orb.updateMatrixWorld(true);
          localCamera.copy(camera.position);
          orb.worldToLocal(localCamera);
          uniforms.uLocalCamera.value.copy(localCamera);
          renderer.render(scene, camera);
        };

        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          const safeWidth = Math.max(1, Math.round(width));
          const safeHeight = Math.max(1, Math.round(height));
          camera.aspect = safeWidth / safeHeight;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          renderer.setSize(safeWidth, safeHeight, false);
          render();
        };

        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const resetPointerDepth = () => {
          pointerTarget.set(0, 0);
          pointerCurrent.set(0, 0);
          root.rotation.x = 0;
          root.rotation.y = 0;
          render();
        };
        const handlePointerMove = (event: PointerEvent) => {
          if (!settingsRef.current.interactive || !finePointer.matches || reducedMotion.matches) {
            return;
          }

          const bounds = container.getBoundingClientRect();
          pointerTarget.set(
            ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2,
            ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2,
          );
        };
        const handlePointerLeave = () => pointerTarget.set(0, 0);
        reducedMotion.addEventListener("change", resetPointerDepth);
        container.addEventListener("pointermove", handlePointerMove, { passive: true });
        container.addEventListener("pointerleave", handlePointerLeave);
        removePointerListeners = () => {
          reducedMotion.removeEventListener("change", resetPointerDepth);
          container.removeEventListener("pointermove", handlePointerMove);
          container.removeEventListener("pointerleave", handlePointerLeave);
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          isVisible = entry?.isIntersecting ?? true;
        });
        intersectionObserver.observe(container);

        const animate = (now: number) => {
          if (cancelled) return;

          const delta = Math.min((now - lastTime) / 1000, 0.05);
          lastTime = now;
          const currentSettings = settingsRef.current;
          if (!currentSettings.interactive) pointerTarget.set(0, 0);
          const shouldAnimate =
            isVisible &&
            !document.hidden &&
            !reducedMotion.matches &&
            (currentSettings.speed > 0 || currentSettings.interactive);

          if (shouldAnimate) {
            uniforms.uTime.value += delta * currentSettings.speed;
            pointerCurrent.lerp(pointerTarget, 1 - Math.exp(-delta * 7.5));
            root.rotation.x = -pointerCurrent.y * 0.11;
            root.rotation.y = pointerCurrent.x * 0.14;
            orb.rotation.x += delta * currentSettings.speed * 0.07;
            orb.rotation.y += delta * currentSettings.speed * 0.11;
            
            render();
          }

          frameId = window.requestAnimationFrame(animate);
        };

        const runtime: OrbRuntime = {
          atmosphereUniforms,
          orbitMaterial,
          renderer,
          render,
          
          uniforms,
        };
        runtimeRef.current = runtime;
        resize();
        render();
        setRenderState("ready");
        frameId = window.requestAnimationFrame(animate);

        disposeRuntime = () => {
          window.cancelAnimationFrame(frameId);
          runtimeRef.current = null;
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
              materials.forEach((material) => {
                material.dispose();
              });
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!cancelled) setRenderState("fallback");
      }
    };

    void setup();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      removePointerListeners();
      disposeRuntime();
    };
  }, []);

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "relative isolate aspect-square w-[min(82vw,28rem)] overflow-visible [contain:layout_paint] ",
        className,
      )}
      data-render-state={renderState}
      ref={containerRef}
      role="img"
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-[10%] rounded-full transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          renderState === "ready" ? "opacity-0" : "opacity-100",
        )}
        
      />
    </div>
  );
}
