"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type LiquidMorphologyEffect =
  | "glass"
  | "frost"
  | "ripple"
  | "plasma"
  | "timeshift";

export type LiquidMorphologySlide = {
  title: string;
  src: string;
  alt?: string;
  category?: string;
  description?: string;
};

export type LiquidMorphologyNavItem = {
  label: string;
  href?: string;
};

export type LiquidMorphologyProfileCard = {
  name: string;
  role: string;
  image?: string;
  imageAlt?: string;
};

type LiquidMorphologySlideshowProps = {
  slides?: LiquidMorphologySlide[];
  effect?: LiquidMorphologyEffect;
  initialIndex?: number;
  autoPlay?: boolean;
  interval?: number;
  transitionDuration?: number;
  showNavigation?: boolean;
  showCounters?: boolean;
  showHelp?: boolean;
  clickToAdvance?: boolean;
  keyboardControls?: boolean;
  brandName?: string;
  navItems?: LiquidMorphologyNavItem[];
  kicker?: string;
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  profileCard?: LiquidMorphologyProfileCard;
  footerLabel?: string;
  className?: string;
  overlayClassName?: string;
  onSlideChange?: (index: number) => void;
};

type ThreeModule = typeof import("three");
type Texture = import("three").Texture;
type ShaderMaterial = import("three").ShaderMaterial;
type WebGLRenderer = import("three").WebGLRenderer;
type OrthographicCamera = import("three").OrthographicCamera;
type Scene = import("three").Scene;
type PlaneGeometry = import("three").PlaneGeometry;

type TextureWithSize = Texture & {
  userData: {
    size: import("three").Vector2;
  };
};

type ThreeRuntime = {
  THREE: ThreeModule;
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  material: ShaderMaterial;
  geometry: PlaneGeometry;
  textures: TextureWithSize[];
};

type UniformValue = {
  value: number | Texture | import("three").Vector2 | null;
};

type ShaderUniforms = Record<string, UniformValue>;

const DEFAULT_SLIDES: LiquidMorphologySlide[] = [
  {
    title: "Ethereal Glow",
    src: "/assets/images/image.jpg",
    alt: "Warm editorial scene with layered light",
    category: "Strategy",
    description: "Videography",
  },
  {
    title: "Rose Mirage",
    src: "/assets/images/image2.jpg",
    alt: "Soft cinematic frame with muted tones",
    category: "Motion",
    description: "Art direction",
  },
  {
    title: "Velvet Mystique",
    src: "/assets/images/image3.jpg",
    alt: "Textured image with rich light and shadow",
    category: "Branding",
    description: "Identity systems",
  },
  {
    title: "Golden Hour",
    src: "/assets/images/image4.jpg",
    alt: "Wide atmospheric scene with natural contrast",
    category: "Editorial",
    description: "Campaign imagery",
  },
  {
    title: "Midnight Dreams",
    src: "/assets/images/image5.jpg",
    alt: "Moody image with clean composition",
    category: "Digital",
    description: "Launch systems",
  },
  {
    title: "Silver Light",
    src: "/assets/images/image6.jpg",
    alt: "Quiet image with bright highlights",
    category: "Production",
    description: "Post work",
  },
];

const DEFAULT_NAV_ITEMS: LiquidMorphologyNavItem[] = [
  { label: "Home", href: "#" },
  { label: "Work", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

const DEFAULT_PROFILE_CARD: LiquidMorphologyProfileCard = {
  name: "Sandeep",
  role: "@roohbuilds",
  image: "/pfp.png",
  imageAlt: "Portrait crop from the active visual campaign",
};

const EFFECT_INDEX: Record<LiquidMorphologyEffect, number> = {
  glass: 0,
  frost: 1,
  ripple: 2,
  plasma: 3,
  timeshift: 4,
};

const DEFAULT_SETTINGS = {
  globalIntensity: 1,
  speedMultiplier: 1,
  distortionStrength: 1,
  colorEnhancement: 1,
  glassRefractionStrength: 1,
  glassChromaticAberration: 1,
  glassBubbleClarity: 1,
  glassEdgeGlow: 1,
  glassLiquidFlow: 1,
  frostIntensity: 1.5,
  frostCrystalSize: 1,
  frostIceCoverage: 1,
  frostTemperature: 1,
  frostTexture: 1,
  rippleFrequency: 25,
  rippleAmplitude: 0.08,
  rippleWaveSpeed: 1,
  rippleRippleCount: 1,
  rippleDecay: 1,
  plasmaIntensity: 1.2,
  plasmaSpeed: 0.8,
  plasmaEnergyIntensity: 0.4,
  plasmaContrastBoost: 0.3,
  plasmaTurbulence: 1,
  timeshiftDistortion: 1.6,
  timeshiftBlur: 1.5,
  timeshiftFlow: 1.4,
  timeshiftChromatic: 1.5,
  timeshiftTurbulence: 1.4,
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  uniform int uEffectType;
  uniform float uGlobalIntensity;
  uniform float uSpeedMultiplier;
  uniform float uDistortionStrength;
  uniform float uColorEnhancement;
  uniform float uGlassRefractionStrength;
  uniform float uGlassChromaticAberration;
  uniform float uGlassBubbleClarity;
  uniform float uGlassEdgeGlow;
  uniform float uGlassLiquidFlow;
  uniform float uFrostIntensity;
  uniform float uFrostCrystalSize;
  uniform float uFrostIceCoverage;
  uniform float uFrostTemperature;
  uniform float uFrostTexture;
  uniform float uRippleFrequency;
  uniform float uRippleAmplitude;
  uniform float uRippleWaveSpeed;
  uniform float uRippleRippleCount;
  uniform float uRippleDecay;
  uniform float uPlasmaIntensity;
  uniform float uPlasmaSpeed;
  uniform float uPlasmaEnergyIntensity;
  uniform float uPlasmaContrastBoost;
  uniform float uPlasmaTurbulence;
  uniform float uTimeshiftDistortion;
  uniform float uTimeshiftBlur;
  uniform float uTimeshiftFlow;
  uniform float uTimeshiftChromatic;
  uniform float uTimeshiftTurbulence;

  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 safeTextureSize = max(textureSize, vec2(1.0));
    vec2 s = uResolution / safeTextureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = safeTextureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x),
      mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float rand(vec2 uv) {
    float a = dot(uv, vec2(92.0, 80.0));
    float b = dot(uv, vec2(41.0, 62.0));
    return fract(sin(a) + cos(b) * 51.0);
  }

  vec3 enhanceColor(vec3 color) {
    float amount = clamp((uColorEnhancement - 1.0) * 0.5, -0.4, 0.7);
    return mix(color, color * 1.2, amount);
  }

  vec4 glassEffect(vec2 uv, float progress) {
    float glassStrength = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity;
    float chromaticAberration = 0.02 * uGlassChromaticAberration * uGlobalIntensity;
    float waveDistortion = 0.025 * uDistortionStrength;
    float clearCenterSize = 0.3 * uGlassBubbleClarity;
    float surfaceRipples = 0.004 * uDistortionStrength;
    float liquidFlow = 0.015 * uGlassLiquidFlow * uSpeedMultiplier;

    vec2 center = vec2(0.5);
    vec2 p = uv * uResolution;
    vec2 uv1 = getCoverUV(uv, uTexture1Size);
    vec2 uv2 = getCoverUV(uv, uTexture2Size);
    float maxRadius = length(uResolution) * 0.85;
    float bubbleRadius = progress * maxRadius;
    vec2 sphereCenter = center * uResolution;
    float dist = length(p - sphereCenter);
    float normalizedDist = dist / max(bubbleRadius, 0.001);
    vec2 direction = dist > 0.0 ? (p - sphereCenter) / dist : vec2(0.0);
    float inside = smoothstep(bubbleRadius + 3.0, bubbleRadius - 3.0, dist);
    float distanceFactor = smoothstep(clearCenterSize, 1.0, normalizedDist);
    float time = progress * 5.0 * uSpeedMultiplier;

    vec2 liquidSurface = vec2(
      smoothNoise(uv * 100.0 + time * 0.3),
      smoothNoise(uv * 100.0 + time * 0.2 + 50.0)
    ) - 0.5;
    liquidSurface *= surfaceRipples * distanceFactor;

    vec2 distortedUV = uv2;
    if (inside > 0.0) {
      vec2 flowDirection = normalize(direction + vec2(sin(time), cos(time * 0.7)) * 0.3);
      distortedUV -= flowDirection * glassStrength * pow(distanceFactor, 1.5);
      float wave1 = sin(normalizedDist * 22.0 - time * 3.5);
      float wave2 = sin(normalizedDist * 35.0 + time * 2.8) * 0.7;
      float wave3 = sin(normalizedDist * 50.0 - time * 4.2) * 0.5;
      distortedUV -= direction * ((wave1 + wave2 + wave3) / 3.0) * waveDistortion * distanceFactor + liquidSurface;
      distortedUV += vec2(
        sin(time + normalizedDist * 10.0),
        cos(time * 0.8 + normalizedDist * 8.0)
      ) * liquidFlow * distanceFactor * inside;
    }

    vec4 newImg;
    if (inside > 0.0) {
      float aberrationOffset = chromaticAberration * pow(distanceFactor, 1.2);
      float r = texture2D(uTexture2, distortedUV + direction * aberrationOffset * 1.2).r;
      float g = texture2D(uTexture2, distortedUV + direction * aberrationOffset * 0.2).g;
      float b = texture2D(uTexture2, distortedUV - direction * aberrationOffset * 0.8).b;
      newImg = vec4(r, g, b, 1.0);
    } else {
      newImg = texture2D(uTexture2, uv2);
    }

    float rim = smoothstep(0.95, 1.0, normalizedDist) * (1.0 - smoothstep(1.0, 1.01, normalizedDist));
    newImg.rgb += rim * 0.08 * (1.0 - smoothstep(0.8, 1.0, progress)) * uGlassEdgeGlow * uGlobalIntensity;
    newImg.rgb = enhanceColor(newImg.rgb);

    if (progress > 0.95) {
      newImg = mix(newImg, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
    }

    return mix(texture2D(uTexture1, uv1), newImg, inside);
  }

  vec4 frostEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    float effectiveIntensity = uFrostIntensity * uGlobalIntensity;
    float crystalScale = 80.0 / max(uFrostCrystalSize, 0.1);
    float frost = (
      smoothNoise(uv * crystalScale * uFrostTexture) +
      smoothNoise(uv * 40.0 / max(uFrostCrystalSize, 0.1) + 50.0) * 0.7 +
      smoothNoise(uv * crystalScale * 2.0 + 100.0) * 0.3
    ) / 2.0;
    vec2 rnd = vec2(rand(uv + frost * 0.1), rand(uv + frost * 0.1 + 0.5));
    float size = mix(progress, sqrt(progress), 0.5) * 1.12 * clamp(uFrostIceCoverage, 0.1, 2.5) + 0.000001;
    vec2 lens = vec2(size, clamp(pow(size, 4.0) / 2.0, size * 0.1, size * 8.0));
    float dist = distance(uv, vec2(0.5));
    float vignette = pow(1.0 - smoothstep(lens.x, lens.y, dist), 2.0);
    rnd *= frost * vignette * 0.8 * effectiveIntensity * uDistortionStrength * (1.0 - floor(vignette));

    vec4 frozen = texture2D(uTexture2, getCoverUV(uv + rnd * 0.06, uTexture2Size));
    float tempShift = clamp(uFrostTemperature * 0.15, 0.0, 0.3);
    frozen *= vec4(clamp(0.85 + tempShift, 0.7, 1.2), 0.9, clamp(1.2 - tempShift, 0.8, 1.3), 1.0);
    frozen = mix(frozen, vec4(0.9, 0.95, 1.1, 1.0), clamp(0.1 * uFrostTemperature, 0.0, 0.25));

    float icespread = smoothNoise(uv * 25.0 / max(uFrostCrystalSize, 0.1) + 200.0);
    float frostMask = smoothstep(icespread * 0.8, 1.0, pow(vignette, 1.5));
    vec4 finalFrost = mix(frozen, newImg, frostMask);
    finalFrost = mix(finalFrost, newImg, smoothstep(mix(0.85, 0.7, clamp(effectiveIntensity - 1.0, 0.0, 1.0)), 1.0, progress));
    finalFrost.rgb = enhanceColor(finalFrost.rgb);
    return mix(currentImg, finalFrost, smoothstep(0.0, 1.0, progress));
  }

  vec4 rippleEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    vec2 center = vec2(0.5);
    float dist = distance(uv, center);
    float waveRadius = progress * 1.2 * uRippleWaveSpeed * uSpeedMultiplier;
    float ripple1 = sin((dist - waveRadius) * uRippleFrequency) * exp(-abs(dist - waveRadius) * 8.0 * uRippleDecay);
    float ripple2 = sin((dist - waveRadius * 0.7) * uRippleFrequency * 1.3) * exp(-abs(dist - waveRadius * 0.7) * 6.0 * uRippleDecay) * 0.6 * uRippleRippleCount;
    float ripple3 = sin((dist - waveRadius * 0.4) * uRippleFrequency * 1.8) * exp(-abs(dist - waveRadius * 0.4) * 4.0 * uRippleDecay) * 0.3 * uRippleRippleCount;
    vec2 normal = normalize(uv - center);
    vec2 distortedUV = getCoverUV(uv + normal * (ripple1 + ripple2 + ripple3) * uRippleAmplitude * uDistortionStrength * uGlobalIntensity, uTexture2Size);
    vec4 rippleResult = mix(newImg, texture2D(uTexture2, distortedUV), smoothstep(0.8, 0.72, dist));
    float mask = smoothstep(0.0, 0.3, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
    rippleResult = mix(newImg, rippleResult, mask);
    rippleResult.rgb = enhanceColor(rippleResult.rgb);
    return mix(currentImg, rippleResult, smoothstep(0.0, 1.0, progress));
  }

  vec4 plasmaEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    float time = progress * 8.0 * uPlasmaSpeed * uSpeedMultiplier;
    float plasma1 = sin(uv.x * 10.0 + time) * cos(uv.y * 8.0 + time * 0.7);
    float plasma2 = sin((uv.x + uv.y) * 12.0 + time * 1.3) * cos((uv.x - uv.y) * 15.0 + time * 0.9);
    float plasma3 = sin(length(uv - vec2(0.5)) * 20.0 + time * 1.8);
    float turbulence = (
      smoothNoise(uv * 15.0 * uPlasmaTurbulence + vec2(time * 0.5, time * 0.3)) +
      smoothNoise(uv * 25.0 * uPlasmaTurbulence + vec2(time * 0.8, -time * 0.4)) * 0.7 +
      smoothNoise(uv * 40.0 * uPlasmaTurbulence + vec2(-time * 0.6, time * 0.9)) * 0.4
    ) / 2.1;
    float plasma = sin(((plasma1 + plasma2 + plasma3) * 0.333 + turbulence * 0.5) * 3.14159);
    float phase = smoothstep(0.0, 0.3, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
    float intensity = uPlasmaIntensity * uGlobalIntensity;
    vec2 electricField = vec2(sin(plasma * 6.28 + time), cos(plasma * 4.71 + time * 1.1)) * 0.02 * intensity * phase * uDistortionStrength;
    vec4 distortedCurrent = texture2D(uTexture1, getCoverUV(uv + electricField, uTexture1Size));
    vec4 distortedNew = texture2D(uTexture2, getCoverUV(uv + electricField, uTexture2Size));
    vec3 color = mix(distortedCurrent.rgb, distortedNew.rgb, progress);
    float energyMask = abs(plasma) * phase * intensity;
    float contrast = 1.0 + energyMask * uPlasmaContrastBoost;
    color = (color - 0.5) * contrast + 0.5;
    color += vec3(0.9, 0.95, 1.0) * energyMask * uPlasmaEnergyIntensity * (0.7 + (sin(time * 4.0) * 0.5 + 0.5) * 0.3);
    color += vec3(1.0) * smoothstep(0.85, 1.0, smoothNoise(uv * 50.0 + time * 2.0)) * energyMask * uPlasmaEnergyIntensity * 0.5;
    color = enhanceColor(color);

    vec4 plasmaResult = vec4(color, 1.0);
    if (progress > 0.85) {
      plasmaResult = mix(plasmaResult, newImg, (progress - 0.85) / 0.15);
    }
    return mix(currentImg, plasmaResult, smoothstep(0.0, 1.0, progress));
  }

  vec4 timeshiftEffect(vec2 uv, float progress) {
    vec2 uv1 = getCoverUV(uv, uTexture1Size);
    vec2 uv2 = getCoverUV(uv, uTexture2Size);
    vec4 currentImg = texture2D(uTexture1, uv1);
    vec4 newImg = texture2D(uTexture2, uv2);
    vec2 center = vec2(0.5);
    vec2 p = uv * uResolution;
    float circleRadius = progress * length(uResolution) * 0.85;
    float dist = length(p - center * uResolution);
    float normalizedDist = dist / max(circleRadius, 0.001);
    float inside = smoothstep(
      circleRadius + circleRadius * 0.2 * uTimeshiftBlur,
      circleRadius - circleRadius * 0.2 * uTimeshiftBlur,
      dist
    );

    vec4 finalColor = inside >= 0.99 ? newImg : currentImg;
    if (inside > 0.01 && inside < 0.99) {
      vec2 fromCenter = uv - center;
      float radius = length(fromCenter);
      vec2 direction = radius > 0.0 ? fromCenter / radius : vec2(0.0);
      float boundaryStrength = smoothstep(0.0, 0.3, inside) * smoothstep(1.0, 0.7, inside);
      float time = progress * 6.28 * uTimeshiftFlow * uSpeedMultiplier;
      float turb1 = smoothNoise(uv * 12.0 * uTimeshiftTurbulence + time * 0.4);
      float turb2 = smoothNoise(uv * 20.0 * uTimeshiftTurbulence - time * 0.5);
      float turb3 = smoothNoise(uv * 35.0 * uTimeshiftTurbulence + time * 0.7);
      vec2 turbulence = vec2((turb1 - 0.5) * 1.2 + (turb2 - 0.5) * 0.8, (turb2 - 0.5) * 1.2 + (turb3 - 0.5) * 0.8);
      vec2 perpendicular = vec2(-direction.y, direction.x);
      vec2 displacement = turbulence * 0.18 * uTimeshiftDistortion * uDistortionStrength * uGlobalIntensity * boundaryStrength;
      displacement += direction * sin(normalizedDist * 12.0 - time * 2.5) * 0.05 * uTimeshiftDistortion * boundaryStrength;
      displacement += perpendicular * sin(time * 2.5 + normalizedDist * 10.0) * 0.06 * uTimeshiftFlow * boundaryStrength;

      vec4 oldColor = texture2D(uTexture1, getCoverUV(uv + displacement, uTexture1Size));
      vec4 newColor = texture2D(uTexture2, getCoverUV(uv + displacement, uTexture2Size));
      float chromatic = boundaryStrength * 0.03 * uTimeshiftChromatic * uGlobalIntensity;
      if (chromatic > 0.01) {
        oldColor = vec4(
          texture2D(uTexture1, getCoverUV(uv + displacement + direction * chromatic * 2.0, uTexture1Size)).r,
          oldColor.g,
          texture2D(uTexture1, getCoverUV(uv + displacement - direction * chromatic * 1.2, uTexture1Size)).b,
          1.0
        );
        newColor = vec4(
          texture2D(uTexture2, getCoverUV(uv + displacement + direction * chromatic * 2.0, uTexture2Size)).r,
          newColor.g,
          texture2D(uTexture2, getCoverUV(uv + displacement - direction * chromatic * 1.2, uTexture2Size)).b,
          1.0
        );
      }
      finalColor = mix(oldColor, newColor, inside);
    }

    finalColor.rgb = enhanceColor(finalColor.rgb);
    if (progress > 0.95) {
      finalColor = mix(finalColor, newImg, (progress - 0.95) / 0.05);
    }
    return mix(currentImg, finalColor, smoothstep(0.0, 1.0, progress));
  }

  void main() {
    if (uEffectType == 0) {
      gl_FragColor = glassEffect(vUv, uProgress);
    } else if (uEffectType == 1) {
      gl_FragColor = frostEffect(vUv, uProgress);
    } else if (uEffectType == 2) {
      gl_FragColor = rippleEffect(vUv, uProgress);
    } else if (uEffectType == 3) {
      gl_FragColor = plasmaEffect(vUv, uProgress);
    } else {
      gl_FragColor = timeshiftEffect(vUv, uProgress);
    }
  }
`;

function formatSlideNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function isNavigationTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("[data-liquid-morphology-nav]"));
}

function useReducedMotionPreference() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setShouldReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return shouldReduceMotion;
}

function createUniforms(THREE: ThreeModule, effect: LiquidMorphologyEffect): ShaderUniforms {
  return {
    uTexture1: { value: null },
    uTexture2: { value: null },
    uProgress: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTexture1Size: { value: new THREE.Vector2(1, 1) },
    uTexture2Size: { value: new THREE.Vector2(1, 1) },
    uEffectType: { value: EFFECT_INDEX[effect] },
    uGlobalIntensity: { value: DEFAULT_SETTINGS.globalIntensity },
    uSpeedMultiplier: { value: DEFAULT_SETTINGS.speedMultiplier },
    uDistortionStrength: { value: DEFAULT_SETTINGS.distortionStrength },
    uColorEnhancement: { value: DEFAULT_SETTINGS.colorEnhancement },
    uGlassRefractionStrength: { value: DEFAULT_SETTINGS.glassRefractionStrength },
    uGlassChromaticAberration: { value: DEFAULT_SETTINGS.glassChromaticAberration },
    uGlassBubbleClarity: { value: DEFAULT_SETTINGS.glassBubbleClarity },
    uGlassEdgeGlow: { value: DEFAULT_SETTINGS.glassEdgeGlow },
    uGlassLiquidFlow: { value: DEFAULT_SETTINGS.glassLiquidFlow },
    uFrostIntensity: { value: DEFAULT_SETTINGS.frostIntensity },
    uFrostCrystalSize: { value: DEFAULT_SETTINGS.frostCrystalSize },
    uFrostIceCoverage: { value: DEFAULT_SETTINGS.frostIceCoverage },
    uFrostTemperature: { value: DEFAULT_SETTINGS.frostTemperature },
    uFrostTexture: { value: DEFAULT_SETTINGS.frostTexture },
    uRippleFrequency: { value: DEFAULT_SETTINGS.rippleFrequency },
    uRippleAmplitude: { value: DEFAULT_SETTINGS.rippleAmplitude },
    uRippleWaveSpeed: { value: DEFAULT_SETTINGS.rippleWaveSpeed },
    uRippleRippleCount: { value: DEFAULT_SETTINGS.rippleRippleCount },
    uRippleDecay: { value: DEFAULT_SETTINGS.rippleDecay },
    uPlasmaIntensity: { value: DEFAULT_SETTINGS.plasmaIntensity },
    uPlasmaSpeed: { value: DEFAULT_SETTINGS.plasmaSpeed },
    uPlasmaEnergyIntensity: { value: DEFAULT_SETTINGS.plasmaEnergyIntensity },
    uPlasmaContrastBoost: { value: DEFAULT_SETTINGS.plasmaContrastBoost },
    uPlasmaTurbulence: { value: DEFAULT_SETTINGS.plasmaTurbulence },
    uTimeshiftDistortion: { value: DEFAULT_SETTINGS.timeshiftDistortion },
    uTimeshiftBlur: { value: DEFAULT_SETTINGS.timeshiftBlur },
    uTimeshiftFlow: { value: DEFAULT_SETTINGS.timeshiftFlow },
    uTimeshiftChromatic: { value: DEFAULT_SETTINGS.timeshiftChromatic },
    uTimeshiftTurbulence: { value: DEFAULT_SETTINGS.timeshiftTurbulence },
  };
}

async function loadTexture(
  THREE: ThreeModule,
  loader: import("three").TextureLoader,
  src: string
) {
  return new Promise<TextureWithSize>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(`Timed out loading ${src}`)), 10000);

    loader.load(
      src,
      (texture) => {
        window.clearTimeout(timeout);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.userData.size = new THREE.Vector2(
          texture.image?.width || 1,
          texture.image?.height || 1
        );
        resolve(texture as TextureWithSize);
      },
      undefined,
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

export function LiquidMorphologySlideshow({
  slides = DEFAULT_SLIDES,
  effect = "glass",
  initialIndex = 0,
  autoPlay = true,
  interval = 1000,
  transitionDuration = 2.5,
 
  showHelp = false,
  clickToAdvance = true,
  keyboardControls = true,
  brandName = "Skecher",
  navItems = DEFAULT_NAV_ITEMS,
  kicker = "Skecher UI",
  headline = "Where colors and chaos shape tomorrow’s textures.",
  description = "Dive into a living canvas: morph, mutate, and let morphologies flow with your wildest ideas.",
  ctaLabel = "See the magic",
  ctaHref = "#",
  profileCard = DEFAULT_PROFILE_CARD,
 
  className,
  overlayClassName,
  onSlideChange,
}: LiquidMorphologySlideshowProps) {
  const shouldReduceMotion = useReducedMotionPreference();
  const safeSlides = useMemo(
    () => (slides.length > 0 ? slides : DEFAULT_SLIDES),
    [slides]
  );
  const safeInitialIndex = clampIndex(initialIndex, safeSlides.length);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const progressStartedAtRef = useRef(0);
  const activeIndexRef = useRef(safeInitialIndex);
  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef(0);
  const onSlideChangeRef = useRef(onSlideChange);

  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const canAnimate = !shouldReduceMotion && safeSlides.length > 1;

  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  }, [onSlideChange]);

  const resetProgressIndicator = useCallback(() => {
    progressStartedAtRef.current = performance.now();
    setProgress(0);
  }, []);

  const cancelProgressLoop = useCallback(() => {
    if (progressFrameRef.current !== null) {
      window.cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
    resetProgressIndicator();
  }, [resetProgressIndicator]);

  const applyTexturePair = useCallback((index: number, nextIndex: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return false;

    const currentTexture = runtime.textures[index];
    const nextTexture = runtime.textures[nextIndex];
    if (!currentTexture || !nextTexture) return false;

    runtime.material.uniforms.uTexture1.value = currentTexture;
    runtime.material.uniforms.uTexture2.value = nextTexture;
    runtime.material.uniforms.uTexture1Size.value = currentTexture.userData.size;
    runtime.material.uniforms.uTexture2Size.value = nextTexture.userData.size;

    return true;
  }, []);

  const completeSlideChange = useCallback((targetIndex: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const targetTexture = runtime.textures[targetIndex];
    if (!targetTexture) return;

    runtime.material.uniforms.uProgress.value = 0;
    runtime.material.uniforms.uTexture1.value = targetTexture;
    runtime.material.uniforms.uTexture1Size.value = targetTexture.userData.size;
    activeIndexRef.current = targetIndex;
    progressStartedAtRef.current = performance.now();
    setActiveIndex(targetIndex);
    setProgress(0);
    onSlideChangeRef.current?.(targetIndex);
  }, []);

  const navigateToSlide = useCallback(
    (targetIndex: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.textures.length < 1 || isTransitioningRef.current) {
        return;
      }

      const safeTargetIndex = clampIndex(targetIndex, runtime.textures.length);
      const currentIndex = activeIndexRef.current;
      if (safeTargetIndex === currentIndex) {
        return;
      }

      resetProgressIndicator();

      if (!applyTexturePair(currentIndex, safeTargetIndex)) {
        return;
      }

      if (!canAnimate) {
        completeSlideChange(safeTargetIndex);
        return;
      }

      isTransitioningRef.current = true;
      const startedAt = performance.now();
      const durationMs = Math.max(0.1, transitionDuration) * 1000;

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }

      const animateTransition = (timestamp: number) => {
        const elapsed = timestamp - startedAt;
        const nextProgress = Math.min(elapsed / durationMs, 1);
        runtime.material.uniforms.uProgress.value = easeInOutCubic(nextProgress);

        if (nextProgress < 1) {
          transitionFrameRef.current = window.requestAnimationFrame(animateTransition);
          return;
        }

        transitionFrameRef.current = null;
        isTransitioningRef.current = false;
        completeSlideChange(safeTargetIndex);
      };

      transitionFrameRef.current = window.requestAnimationFrame(animateTransition);
    },
    [applyTexturePair, canAnimate, completeSlideChange, resetProgressIndicator, transitionDuration]
  );

  const goNext = useCallback(() => {
    navigateToSlide((activeIndexRef.current + 1) % safeSlides.length);
  }, [navigateToSlide, safeSlides.length]);

  const goPrevious = useCallback(() => {
    navigateToSlide((activeIndexRef.current - 1 + safeSlides.length) % safeSlides.length);
  }, [navigateToSlide, safeSlides.length]);

  useEffect(() => {
    activeIndexRef.current = safeInitialIndex;
    setActiveIndex(safeInitialIndex);
  }, [safeInitialIndex]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.material.uniforms.uEffectType.value = EFFECT_INDEX[effect];
  }, [effect]);

  useEffect(() => {
    if (!autoPlay || !isReady || !canAnimate) {
      cancelProgressLoop();
      return;
    }

    progressStartedAtRef.current = performance.now();
    const durationMs = Math.max(1000, interval);

    const tick = (timestamp: number) => {
      if (isTransitioningRef.current) {
        progressFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const startedAt = progressStartedAtRef.current || timestamp;
      const nextProgress = Math.min(((timestamp - startedAt) / durationMs) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        progressStartedAtRef.current = timestamp;
        goNext();
        setProgress(0);
      }

      progressFrameRef.current = window.requestAnimationFrame(tick);
    };

    progressFrameRef.current = window.requestAnimationFrame(tick);

    return cancelProgressLoop;
  }, [autoPlay, canAnimate, cancelProgressLoop, goNext, interval, isReady]);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    const root = rootRef.current;

    if (!canvas || !root) return;
    const activeCanvas = canvas;
    const activeRoot = root;

    async function setupRenderer() {
      try {
        const THREE = await import("three");
        if (!isMounted) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
          canvas: activeCanvas,
          antialias: false,
          alpha: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const material = new THREE.ShaderMaterial({
          uniforms: createUniforms(THREE, effect),
          vertexShader,
          fragmentShader,
        });
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        const loadedTextures = await Promise.allSettled(
          safeSlides.map((slide) => loadTexture(THREE, loader, slide.src))
        );

        if (!isMounted) {
          renderer.dispose();
          material.dispose();
          geometry.dispose();
          return;
        }

        const textures = loadedTextures
          .filter((result): result is PromiseFulfilledResult<TextureWithSize> => result.status === "fulfilled")
          .map((result) => result.value);

        if (!textures.length) {
          throw new Error("No slideshow textures loaded.");
        }

        runtimeRef.current = {
          THREE,
          renderer,
          scene,
          camera,
          material,
          geometry,
          textures,
        };

        const safeIndex = clampIndex(safeInitialIndex, textures.length);
        const nextIndex = textures.length > 1 ? (safeIndex + 1) % textures.length : safeIndex;
        activeIndexRef.current = safeIndex;
        setActiveIndex(safeIndex);
        applyTexturePair(safeIndex, nextIndex);

        const resize = () => {
          const rect = activeRoot.getBoundingClientRect();
          const width = Math.max(1, Math.floor(rect.width));
          const height = Math.max(1, Math.floor(rect.height));
          renderer.setSize(width, height, false);
          material.uniforms.uResolution.value.set(width, height);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(activeRoot);
        resize();

        const render = () => {
          renderer.render(scene, camera);
          renderFrameRef.current = window.requestAnimationFrame(render);
        };
        renderFrameRef.current = window.requestAnimationFrame(render);

        setHasWebGLError(false);
        setIsReady(true);

        return () => {
          resizeObserver.disconnect();
        };
      } catch (error) {
        if (!isMounted) return;
        console.warn("LiquidMorphologySlideshow failed to initialize.", error);
        setHasWebGLError(true);
      }
    }

    let cleanupResize: VoidFunction | undefined;
    setupRenderer().then((cleanup) => {
      cleanupResize = cleanup;
    });

    return () => {
      isMounted = false;
      cleanupResize?.();
      setIsReady(false);
      cancelProgressLoop();

      if (renderFrameRef.current !== null) {
        window.cancelAnimationFrame(renderFrameRef.current);
        renderFrameRef.current = null;
      }

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
        transitionFrameRef.current = null;
      }

      const runtime = runtimeRef.current;
      runtimeRef.current = null;

      if (runtime) {
        // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
        runtime.textures.forEach((texture) => texture.dispose());
        runtime.geometry.dispose();
        runtime.material.dispose();
        runtime.renderer.dispose();
        runtime.renderer.forceContextLoss();
      }
    };
  }, [applyTexturePair, cancelProgressLoop, effect, safeInitialIndex, safeSlides]);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!clickToAdvance || isNavigationTarget(event.target)) {
      return;
    }

    goNext();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!keyboardControls || isNavigationTarget(event.target)) {
      return;
    }

    if (event.code === "Space" || event.code === "ArrowRight") {
      event.preventDefault();
      goNext();
    }

    if (event.code === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.changedTouches[0]?.screenX ?? 0;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const touchEndX = event.changedTouches[0]?.screenX ?? 0;
    const delta = touchEndX - touchStartXRef.current;

    if (Math.abs(delta) < 50) {
      return;
    }

    if (delta < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  const activeSlide = safeSlides[activeIndex] ?? safeSlides[0];
  const displayTotal = formatSlideNumber(safeSlides.length - 1);
  const profileImage = profileCard.image ?? activeSlide?.src ?? DEFAULT_PROFILE_CARD.image;

  return (
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    <div
      ref={rootRef}
      aria-label="Liquid morphology landing slideshow"
      className={cn(
        "group/liquid-morphology relative isolate h-auto w-full overflow-hidden rounded-lg bg-black text-white outline-none",
        clickToAdvance && "cursor-pointer",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      role="region"
      tabIndex={keyboardControls ? 0 : undefined}
    >
      <canvas
        ref={canvasRef}
        aria-label={activeSlide?.alt ?? activeSlide?.title ?? "Liquid slideshow image"}
        className={cn(
          "block h-full w-full transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isReady ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.46)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.13)_0%,transparent_30%),radial-gradient(circle_at_50%_115%,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.2)_38%,transparent_62%)]" />

      {hasWebGLError ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeSlide?.src ?? DEFAULT_SLIDES[0].src})` }}
        />
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex min-h-full flex-col justify-between overflow-hidden px-4 py-4 text-white sm:px-6 sm:py-6 lg:px-8 lg:py-7",
          overlayClassName
        )}
      >
        <header className="grid items-start gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <a
            aria-label={`${brandName} home`}
            className="pointer-events-auto flex w-fit items-center gap-2 text-sm font-black tracking-[-0.02em] text-white outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/80"
            data-liquid-morphology-nav
            href="#"
          >
            <span className="grid size-4 grid-cols-2 gap-1" aria-hidden="true">
              <span className="bg-white" />
              <span className="bg-white" />
              <span className="bg-white" />
              <span className="bg-white/75" />
            </span>
            {brandName}
          </a>

          <nav
            aria-label="Landing"
            className="pointer-events-auto order-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-white/82 sm:order-none sm:justify-center sm:gap-x-9"
            data-liquid-morphology-nav
          >
            {navItems.map((item, index) => (
              <a
                className="group/nav relative outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-white/80"
                href={item.href ?? "#"}
                key={`${item.label}-${index}`}
              >
                <span>{item.label}</span>
                <span className="ml-2 align-super text-[9px] text-white/50">
                  {formatSlideNumber(index)}
                </span>
                <span className="absolute -bottom-1 left-0 h-px w-full scale-x-0 bg-white/80 transition-transform duration-200 group-hover/nav:scale-x-100 group-focus-visible/nav:scale-x-100" />
              </a>
            ))}
          </nav>

          {profileCard ? (
            <aside
              className="pointer-events-auto ml-auto hidden w-full max-w-[25.5rem] items-center gap-3 rounded-sm bg-white p-2 text-black shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:flex"
              data-liquid-morphology-nav
            >
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={profileCard.imageAlt ?? profileCard.name}
                  className="h-14 w-14 rounded-sm object-cover"
                  src={profileImage}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold tracking-[-0.02em]">
                  {profileCard.name}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-black/72">
                  {profileCard.role}
                </p>
              </div>
              <span className="grid size-5 grid-cols-2 gap-1 self-start" aria-hidden="true">
                <span className="bg-black" />
                <span className="bg-black" />
                <span />
                <span className="bg-black" />
              </span>
            </aside>
          ) : null}
        </header>

        {showHelp ? (
          <p className="absolute left-4 top-20 max-w-[calc(100%-2rem)] text-xs font-medium text-white/70 sm:left-8">
            Space/Right: Next - Left: Previous - Click to Advance
          </p>
        ) : null}

        <main className="grid flex-1 items-end gap-8 pb-24 pt-10 sm:pb-28 lg:grid-cols-[minmax(15rem,24rem)_1fr_minmax(14rem,22rem)] lg:pb-20 lg:pt-16">
          <section className="max-w-[22rem] self-center lg:self-auto">
            <p className="mb-4 text-xs font-semibold text-white/70">{kicker}</p>
            <h1 className="max-w-[18rem] text-xl font-semibold leading-[1.05] tracking-[-0.02em] text-white text-balance sm:text-2xl">
              {headline}
            </h1>
            <p className="mt-3 max-w-[18rem] text-sm leading-5 text-white/72 text-pretty">
              {description}
            </p>
            <a
              className="pointer-events-auto mt-9 flex w-full max-w-[15.5rem] items-center justify-between border-b border-white/88 pb-3 text-base font-semibold text-white outline-none transition-[max-width,opacity] duration-300 hover:max-w-[17rem] hover:opacity-[0.82] focus-visible:ring-2 focus-visible:ring-white/80"
              data-liquid-morphology-nav
              href={ctaHref}
            >
              <span>{ctaLabel}</span>
              <span className="relative size-4 border-r border-t border-white" aria-hidden="true" />
            </a>
          </section>

          <section className="relative hidden min-h-[18rem] self-end lg:block" aria-hidden="true">
            <div className="absolute left-[10%] top-[22%] size-4">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/75" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/75" />
            </div>
            <div className="absolute right-[18%] top-[2%] size-4">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
            </div>
            <div className="absolute right-[5%] bottom-[34%] size-4">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
            </div>
            <div className="absolute bottom-0 left-0">
              <p className="mb-5 text-base font-semibold leading-6 text-white">
                <span className="text-white/52">{formatSlideNumber(activeIndex)} / </span>
                {activeSlide?.category ?? "Motion"}
                <br />
                {activeSlide?.description ?? activeSlide?.title}
                <br />
                {activeSlide?.title}
              </p>
            </div>
          </section>

    
        </main>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-[51%] hidden select-none text-[clamp(5rem,16vw,14rem)] font-extralight font-raleway leading-[0.76] tracking-[-0.04em] text-white/94 mix-blend-screen lg:block"
        >
          {brandName}
        </div>
 
      </div>
    </div>
  );
}
