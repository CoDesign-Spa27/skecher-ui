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
  precision mediump float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uCell;
  uniform float uOpacity;

  varying vec2 vUv;

  float hash11(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
  }

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(float x) {
    float cellIndex = floor(x);
    float t = fract(x);
    t = t * t * (3.0 - 2.0 * t);
    return mix(hash11(cellIndex), hash11(cellIndex + 1.0), t);
  }

  // The 2x2 ordered-dither matrix, [[0, 2], [3, 1]] / 4, written as arithmetic
  // so it needs no lookup table.
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x * 0.5 + a.y * a.y * 0.75);
  }

  // Recursing once gives the 4x4 matrix: sixteen thresholds, which is what makes
  // half coverage resolve to a clean checkerboard rather than clumped noise.
  float bayer4(vec2 a) {
    return bayer2(a * 0.5) * 0.25 + bayer2(a);
  }

  void main() {
    vec2 cell = floor(vUv * uResolution / uCell);

    // 0 along the bottom edge of the strip, 1 at the top.
    float height = (cell.y * uCell + uCell * 0.5) / uResolution.y;

    // How high this column carries dots. The drifting term undulates across the
    // strip; the per-row term breaks that curve into the stepped lines the
    // reference plate has, instead of one clean silhouette.
    float undulation = valueNoise(cell.x * 0.045 + uTime * 0.015);
    float rowStep = hash11(cell.y * 17.31);
    float edge = 0.30 + undulation * 0.34 + rowStep * 0.16;
    float fade = 1.0 - smoothstep(edge - 0.30, edge, height);

    // Runs of dots with gaps between them, reseeded every row so no two lines
    // break in the same place.
    float wordNoise = valueNoise(cell.x * 0.085 + cell.y * 31.7 + uTime * 0.04);
    float words = smoothstep(0.34, 0.46, wordNoise);
    float coverage = fade * mix(0.28, 1.0, words);

    // A handful of runs fill solid: the long dashes scattered through the plate.
    float dash = step(0.975, hash21(vec2(floor(cell.x / 18.0), cell.y + floor(uTime * 0.15) * 41.0)));

    // Half coverage is as dense as the plate ever gets, because a dithered 0.5
    // is a checkerboard. The dashes are the exception that goes fully solid.
    float level = mix(coverage * 0.5, fade, dash);

    // Half a step of bias, so an empty cell cannot pass the zero threshold.
    float lit = step(bayer4(cell) + 0.03125, level);
    float alpha = lit * uOpacity;

    // Premultiplied white: this canvas composites onto the hero panel.
    gl_FragColor = vec4(vec3(alpha), alpha);
  }
`;

/** CSS pixels per dot. Three keeps the grid legible without reading as noise. */
const DEFAULT_CELL_SIZE = 2;
/** Peak alpha of a lit dot, matched to the CodeTexture plates it sits beside. */
const DEFAULT_OPACITY = 0.1;
/** Retina is worth it, beyond that the dots are smaller than anyone can see. */
const MAX_PIXEL_RATIO = 2;
/** Every drift term runs well under 1Hz, so 30fps is already oversampled. */
const FRAME_INTERVAL = 6000 / 30;

type RenderState = "pending" | "ready" | "fallback";

type HeroCodeShaderProps = {
  cellSize?: number;
  className?: string;
  opacity?: number;
};

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
  // Attached shaders live as long as the program once it has linked.
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * A dithered code plate, drawn rather than sampled from an image so it can fill
 * any width without tiling and drift slowly instead of sitting still.
 *
 * Raw WebGL on purpose: this is one fullscreen triangle on the landing page's
 * first paint, and a scene graph would cost more than the effect.
 */
export function HeroCodeShader({
  cellSize = DEFAULT_CELL_SIZE,
  className,
  opacity = DEFAULT_OPACITY,
}: HeroCodeShaderProps) {
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
    // One oversized triangle covers the viewport with fewer vertices than a quad.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const cellLocation = gl.getUniformLocation(program, "uCell");
    const opacityLocation = gl.getUniformLocation(program, "uOpacity");

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    // Premultiplied source, which is what the fragment shader writes.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    container.append(canvas);
    setRenderState("ready");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lastDrawTime = 0;
    let startTime = performance.now();
    let isVisible = true;
    let hasSize = false;

    // Held at zero under reduced motion, so every draw renders the same plate.
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
      // Rebase so a paused stretch does not jump the drift forward on resume.
      // Nothing to subtract before the first frame has ever been drawn.
      if (lastDrawTime !== 0) startTime += performance.now() - lastDrawTime;
      lastDrawTime = 0;
      frameId = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
      if (hasSize && canvas.width === width && canvas.height === height) return;

      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
      // Dots are sized in CSS pixels, so the grid looks the same on any display.
      gl.uniform1f(cellLocation, cellSize * pixelRatio);
      gl.uniform1f(opacityLocation, opacity);
      hasSize = true;
      draw();
    };

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        stop();
        // A single frame of the same plate, just held still.
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

    // A hero strip scrolls away quickly; there is no reason to keep drawing it.
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
  }, [cellSize, opacity]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none [contain:layout_paint]", className)}
      data-render-state={renderState}
      ref={containerRef}
    >
      {renderState === "fallback" ? (
        <div className="h-full w-full [background:linear-gradient(to_top,rgb(255_255_255/6%),transparent_70%)]" />
      ) : null}
    </div>
  );
}
