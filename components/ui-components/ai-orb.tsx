"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AiOrbProps = {
  /** Accessible description for the rendered plasma visualization. */
  ariaLabel?: string;
  /** Surface color behind the plasma strands. Accepts any valid CSS color. */
  backgroundColor?: string;
  className?: string;
  /** Controls the brightness of the plasma field. */
  intensity?: number;
  /** Enables subtle pointer-following offset and rotation on fine pointers. */
  interactive?: boolean;
  /** Multiplies the pointer-following depth effect. */
  pointerStrength?: number;
  /** Primary plasma strand color. Accepts any valid Three.js color string. */
  primaryColor?: string;
  /** Secondary plasma strand color. Accepts any valid Three.js color string. */
  secondaryColor?: string;
  /** Internal animation speed. Set to 0 for a still plasma field. */
  speed?: number;
  /** Thickness of the ray-marched plasma strands. */
  strandWidth?: number;
  /** Number of strand turns packed into the orb. */
  twist?: number;
};

type ThreeModule = typeof import("three");

type PlasmaUniforms = {
  uBend1: { value: number };
  uBend2: { value: number };
  uColor1: { value: import("three").Color };
  uColor2: { value: import("three").Color };
  uDir2: { value: number };
  uFocalLength: { value: number };
  uIntensity: { value: number };
  uLineThickness: { value: number };
  uOffset: { value: import("three").Vector2 };
  uResolution: { value: import("three").Vector2 };
  uRotation: { value: number };
  uSpeed1: { value: number };
  uSpeed2: { value: number };
  uTime: { value: number };
  uTwist: { value: number };
};

type OrbRuntime = {
  render: () => void;
  renderer: import("three").WebGLRenderer;
  uniforms: PlasmaUniforms;
};

type OrbSettings = Required<
  Pick<
    AiOrbProps,
    | "intensity"
    | "interactive"
    | "pointerStrength"
    | "primaryColor"
    | "secondaryColor"
    | "speed"
    | "strandWidth"
    | "twist"
  >
>;

const DEFAULT_BACKGROUND_COLOR = "#090a0f";
const DEFAULT_SETTINGS: OrbSettings = {
  intensity: 1.25,
  interactive: true,
  pointerStrength: 1,
  primaryColor: "#A855F7",
  secondaryColor: "#06B6D4",
  speed: 0.45,
  strandWidth: 0.5,
  twist: 5,
};

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The plasma is raymarched as a double-helix confined inside an analytic
// sphere (rather than an unbounded tunnel), so the strands curl around a
// contained "ball" of light instead of streaking off in one direction.
const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uOffset;
  uniform float uRotation;
  uniform float uFocalLength;
  uniform float uSpeed1;
  uniform float uSpeed2;
  uniform float uDir2;
  uniform float uBend1;
  uniform float uBend2;
  uniform float uIntensity;
  uniform float uLineThickness;
  uniform float uTwist;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  const float sphereRadius = 1.2;
  const float pi = 9.14159;
  const float pi2 = 6.28318;
  const float halfPi = 1.5708;
  #define MAX_STEPS 22

  void renderPlasma(out vec4 outputColor, in vec2 coordinate) {
    float time = uTime * pi;

    vec3 rayOrigin = vec3(0.0, 0.0, -3.4);
    vec3 rayDirection = normalize(
      vec3((coordinate - 0.5 * uResolution) / uResolution.y, uFocalLength)
    );

    // Analytic ray/sphere intersection. Anything outside the sphere is
    // simply not part of the volume we march through.
    float b = dot(rayOrigin, rayDirection);
    float c = dot(rayOrigin, rayOrigin) - sphereRadius * sphereRadius;
    float h = b * b - c;
    if (h < 0.0) discard;
    h = sqrt(h);
    float tNear = max(-b - h, 0.0);
    float tFar = -b + h;
    if (tFar < 0.0) discard;

    float depth = tNear;
    float stepDistance = 1.0;
    vec2 fieldDistance = vec2(1.0);
    vec3 position = rayOrigin;

    float waveTime1 = time * 0.9;
    float waveTime2 = time * 0.9;
    float strandTime1 = time * uSpeed1;
    float strandTime2 = time * uSpeed2 * uDir2;

    for (int stepIndex = 0; stepIndex < MAX_STEPS; ++stepIndex) {
      position = rayOrigin + rayDirection * depth;

      // Phase driving the twist of the two strands as they wind through
      // the ball; multiplying by twistFrequency packs several loops into
      // the sphere's diameter instead of one long straight run.
      float twistX = position.x * uTwist;
      float wobble1 = uBend1 + sin(waveTime1 + twistX * 0.8) * 0.1;
      float wobble2 = uBend2 + cos(waveTime2 + twistX * 1.1) * 0.1;
      vec2 sineOffset = sin(vec2(twistX, twistX + halfPi) + strandTime1) * wobble1;
      vec2 cosineOffset = cos(vec2(twistX, twistX + halfPi) + strandTime2) * wobble2;

      vec2 yz = position.yz;
      fieldDistance.x = length(yz - sineOffset) - uLineThickness;
      fieldDistance.y = length(yz - cosineOffset) - uLineThickness;

      float currentDistance = min(fieldDistance.x, fieldDistance.y);
      stepDistance = min(stepDistance, currentDistance);

      if (stepDistance < 0.001 || depth > tFar) break;
      depth += max(stepDistance, 0.02) * 0.7;
    }

    float rootDepth = sqrt(max(depth, 0.0));
    vec3 raw = max(
      cos(depth * pi2) - stepDistance * rootDepth - vec3(fieldDistance, 0.0),
      0.0
    );
    raw.gb += 0.1;

    float maximumChannel = max(raw.r, max(raw.g, raw.b));
    if (maximumChannel < 0.15) discard;

    raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
    float luminance = dot(raw, vec3(0.299, 0.587, 0.114));
    float strandWeight1 = max(0.0, 1.0 - fieldDistance.x * 2.0);
    float strandWeight2 = max(0.0, 1.0 - fieldDistance.y * 2.0);
    float totalWeight = strandWeight1 + strandWeight2 + 0.001;
    vec3 plasmaColor =
      (uColor1 * strandWeight1 + uColor2 * strandWeight2) /
      totalWeight * luminance * 3.5 * uIntensity;

    // Soft falloff as we approach the sphere's surface so the plasma
    // dissolves into the container's glow instead of ending with a hard rim.
    float edgeFade = 1.0 - smoothstep(sphereRadius * 0.72, sphereRadius, length(position));
    plasmaColor *= edgeFade;

    outputColor = vec4(plasmaColor, edgeFade);
  }

  void main() {
    vec2 coordinate = gl_FragCoord.xy + uOffset;
    coordinate -= 0.5 * uResolution;

    float cosine = cos(uRotation);
    float sine = sin(uRotation);
    coordinate = mat2(cosine, -sine, sine, cosine) * coordinate;
    coordinate += 0.5 * uResolution;

    vec4 color;
    renderPlasma(color, coordinate);
    gl_FragColor = color;
  }
`;

export function AiOrb({
  ariaLabel = "Animated AI plasma field",
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  className,
  intensity = DEFAULT_SETTINGS.intensity,
  interactive = DEFAULT_SETTINGS.interactive,
  pointerStrength = DEFAULT_SETTINGS.pointerStrength,
  primaryColor = DEFAULT_SETTINGS.primaryColor,
  secondaryColor = DEFAULT_SETTINGS.secondaryColor,
  speed = DEFAULT_SETTINGS.speed,
  strandWidth = DEFAULT_SETTINGS.strandWidth,
  twist = DEFAULT_SETTINGS.twist,
}: AiOrbProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const runtimeRef = React.useRef<OrbRuntime | null>(null);
  const settingsRef = React.useRef<OrbSettings>(DEFAULT_SETTINGS);
  const [renderState, setRenderState] = React.useState<"loading" | "ready" | "fallback">("loading");

  settingsRef.current = {
    intensity: Math.max(0.25, Math.min(5.5, intensity)),
    interactive,
    pointerStrength: Math.max(0, Math.min(2, pointerStrength)),
    primaryColor,
    secondaryColor,
    speed: Math.max(0, Math.min(2, speed)),
    strandWidth: Math.max(0.2, Math.min(1, strandWidth)),
    twist: Math.max(1, Math.min(10, twist)),
  };

  React.useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.uniforms.uIntensity.value = Math.max(0.25, Math.min(2.5, intensity));
    runtime.uniforms.uColor1.value.set(primaryColor);
    runtime.uniforms.uColor2.value.set(secondaryColor);
    runtime.uniforms.uLineThickness.value = Math.max(0.2, Math.min(1, strandWidth));
    runtime.uniforms.uTwist.value = Math.max(1, Math.min(10, twist));
    runtime.render();
  }, [intensity, primaryColor, secondaryColor, strandWidth, twist]);

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
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
          stencil: false,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "absolute inset-0 size-full";
        container.appendChild(renderer.domElement);

        const settings = settingsRef.current;
        const uniforms: PlasmaUniforms = {
          uBend1: { value: 1 },
          uBend2: { value: 0.5 },
          uColor1: { value: new THREE.Color(settings.primaryColor) },
          uColor2: { value: new THREE.Color(settings.secondaryColor) },
          uDir2: { value: 1 },
          uFocalLength: { value: 1.5 },
          uIntensity: { value: settings.intensity },
          uLineThickness: { value: settings.strandWidth },
          uOffset: { value: new THREE.Vector2() },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uRotation: { value: 0 },
          uSpeed1: { value: 0.05 },
          uSpeed2: { value: 0.05 },
          uTime: { value: 0 },
          uTwist: { value: settings.twist },
        };

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
        );

        const material = new THREE.ShaderMaterial({
          depthTest: false,
          depthWrite: false,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          uniforms,
          vertexShader: VERTEX_SHADER,
        });
        const plasma = new THREE.Mesh(geometry, material);
        plasma.frustumCulled = false;
        scene.add(plasma);

        const pointerTarget = new THREE.Vector2();
        const pointerCurrent = new THREE.Vector2();
        let isVisible = true;
        let lastTime = performance.now();

        const render = () => renderer.render(scene, camera);

        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          const safeWidth = Math.max(1, Math.round(width));
          const safeHeight = Math.max(1, Math.round(height));
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          renderer.setSize(safeWidth, safeHeight, false);
          renderer.getDrawingBufferSize(uniforms.uResolution.value);
          render();
        };

        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const applyPointerDepth = () => {
          const resolution = uniforms.uResolution.value;
          const strength = settingsRef.current.pointerStrength;
          uniforms.uOffset.value.set(
            pointerCurrent.x * resolution.x * 0.075 * strength,
            -pointerCurrent.y * resolution.y * 0.075 * strength,
          );
          uniforms.uRotation.value = pointerCurrent.x * 0.1 * strength;
        };
        const resetPointerDepth = () => {
          pointerTarget.set(0, 0);
          pointerCurrent.set(0, 0);
          applyPointerDepth();
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
            applyPointerDepth();
            render();
          }

          frameId = window.requestAnimationFrame(animate);
        };

        runtimeRef.current = { render, renderer, uniforms };
        resize();
        render();
        setRenderState("ready");
        frameId = window.requestAnimationFrame(animate);

        disposeRuntime = () => {
          window.cancelAnimationFrame(frameId);
          runtimeRef.current = null;
          geometry.dispose();
          material.dispose();
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
        "relative isolate aspect-square w-[min(82vw,20rem)] overflow-hidden rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-24px_48px_rgb(0_0_0/0.3)] [contain:layout_paint]",
        className,
      )}
      data-render-state={renderState}
      ref={containerRef}
      role="img"
      style={{
        background: `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${backgroundColor} 78%, white) 0%, ${backgroundColor} 58%, color-mix(in srgb, ${backgroundColor} 72%, black) 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-[12%] rounded-full blur-3xl transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          renderState === "ready" ? "opacity-0" : "opacity-70",
        )}
        style={{
          background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor} 52%, transparent 72%)`,
        }}
      />
    </div>
  );
}
