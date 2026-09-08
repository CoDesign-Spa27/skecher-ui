"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const VERTEX_SHADER = `
  attribute vec2 aPosition;

  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 cellIndex = floor(p);
    vec2 f = fract(p);
    vec2 t = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(cellIndex), hash(cellIndex + vec2(1.0, 0.0)), t.x),
      mix(hash(cellIndex + vec2(0.0, 1.0)), hash(cellIndex + vec2(1.0, 1.0)), t.x),
      t.y
    );
  }

  // Four octaves is as much detail as survives the soft thresholds below. The
  // 2.03 lacunarity keeps octaves off a shared grid, which is what stops the
  // field from looking axis-aligned.
  float fbm(vec2 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return sum;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(vUv.x * aspect, vUv.y) * 2.2;

    // Domain warping: the field is displaced by two more noise fields before it
    // is sampled. Wider displacement and slower drift than a terrain field
    // would use, because this has to read as something flowing.
    vec2 warp = vec2(
      fbm(p + vec2(0.0, uTime * 0.035)),
      fbm(p + vec2(3.7, 1.9) - vec2(uTime * 0.026, 0.0))
    );
    float height = fbm(p + 3.1 * warp);

    // The body of the liquid: broad masses, feathered at both ends.
    float body = smoothstep(0.26, 0.74, height);

    // Where the flow folds back over itself. A triangle wave raised to a power
    // feathers the fold into a vein; thresholding it against a screen-space
    // derivative instead is what made the first pass read as a white contour map.
    float fold = clamp(1.0 - abs(fract(height * 6.5) - 0.5) * 2.0, 0.0, 1.0);
    float veins = pow(fold, 5.0);

    // Banded into the footer's empty middle, not its edges. The links sit at the
    // top and the wordmark is cropped into the floor, and structure behind
    // either of them would read as noise.
    float band = smoothstep(0.04, 0.34, vUv.y) * (1.0 - smoothstep(0.46, 0.9, vUv.y));

    // Structureless glow along the floor, so the bottom keeps depth for the
    // wordmark to sit in.
    float wash = pow(1.0 - vUv.y, 2.6) * 0.1;

    float ink = clamp((body * 0.17 + veins * 0.3) * band + wash, 0.0, 1.0);
    float alpha = ink * uOpacity;

    // Faintly cool rather than pure white: enough to read as water, not enough
    // to introduce a colour into a monochrome palette.
    vec3 tint = vec3(0.88, 0.93, 1.0);

    // Premultiplied: the canvas composites onto the footer panel.
    gl_FragColor = vec4(tint * alpha, alpha);
  }
`;

/** Peak alpha of the liquid field. */
const DEFAULT_OPACITY = 0.5;
/**
 * The field is soft and the lines are anti-aliased, so rendering under 1:1 and
 * letting the canvas stretch costs nothing visible and buys back roughly half
 * the fragments. Fifteen noise samples per pixel is the reason to care.
 */
const RESOLUTION_SCALE = 0.75;
/** Both warp terms move well under 1Hz; 30fps is already oversampled. */
const FRAME_INTERVAL = 1000 / 30;

type RenderState = "pending" | "ready" | "fallback";

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * A slow liquid field: domain-warped noise, read as soft masses with feathered
 * veins where the flow folds over itself. Deliberately unlike the hero's
 * dithered plate, so the two ends of the page share a palette without repeating
 * a trick.
 */
export function FooterContourShader({
  className,
  opacity = DEFAULT_OPACITY,
}: {
  className?: string;
  opacity?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = React.useState<RenderState>("pending");

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });

    if (!gl) {
      setRenderState("fallback");
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      setRenderState("fallback");
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const opacityLocation = gl.getUniformLocation(program, "uOpacity");

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    container.append(canvas);
    setRenderState("ready");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lastDrawTime = 0;
    let startTime = performance.now();
    let isVisible = true;
    let hasSize = false;

    const elapsed = () => (reducedMotion.matches ? 0 : (performance.now() - startTime) / 1000);

    const draw = () => {
      if (!hasSize) return;
      gl.uniform1f(timeLocation, elapsed());
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      frameId = window.requestAnimationFrame(tick);
      if (now - lastDrawTime < FRAME_INTERVAL) return;
      lastDrawTime = now;
      draw();
    };

    const stop = () => {
      if (frameId === 0) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const start = () => {
      if (frameId !== 0 || reducedMotion.matches || !isVisible) return;
      if (lastDrawTime !== 0) startTime += performance.now() - lastDrawTime;
      lastDrawTime = 0;
      frameId = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const scale = Math.min(window.devicePixelRatio || 1, 1) * RESOLUTION_SCALE;
      const width = Math.max(1, Math.round(bounds.width * scale));
      const height = Math.max(1, Math.round(bounds.height * scale));
      if (hasSize && canvas.width === width && canvas.height === height) return;

      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform1f(opacityLocation, opacity);
      hasSize = true;
      draw();
    };

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        stop();
        draw();
        return;
      }
      start();
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // A footer is off-screen for most of a visit; there is no reason to spend
    // fifteen noise samples a pixel on it while someone reads the hero.
    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting && !document.hidden;
      if (isVisible) start();
      else stop();
    });
    intersectionObserver.observe(container);

    reducedMotion.addEventListener("change", handleMotionPreference);
    document.addEventListener("visibilitychange", handleVisibility);

    resize();
    handleMotionPreference();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [opacity]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none [contain:layout_paint]", className)}
      data-render-state={renderState}
      ref={containerRef}
    >
      {renderState === "fallback" ? (
        <div className="h-full w-full [background:radial-gradient(120%_80%_at_50%_100%,rgb(255_255_255/10%),transparent_65%)]" />
      ) : null}
    </div>
  );
}
