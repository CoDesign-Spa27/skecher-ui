import Link from "next/link";
import { Button } from "../ui/button";
import { Cursor } from "./assets/cursor";
import { GemSmoke } from '@paper-design/shaders-react';

export const Hero = () => {
    return (
        <div className="relative w-full h-screen">
            <div className="absolute inset-0 z-0">
                <GemSmoke
                    style={{ width: '100%', height: '100%' }}
                    colors={["#fe5b16", "#f7ff61", "#ffffff"]}
                    colorBack="#0F0F0F"
                    colorInner="#0F0F0F"
                    shape="none"
                    innerDistortion={0.71}
                    outerDistortion={0.8}
                    outerGlow={0}
                    innerGlow={0.7}
                    offset={0}
                    angle={0}
                    size={1}
                    speed={0.2}
                    scale={1}
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-br from-transparent to-background/70 " />
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        WebkitMaskComposite: 'source-in',
                        WebkitMaskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)',
                        backgroundImage: 'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
                        backgroundPosition: '0 0, 0 0',
                        backgroundSize: '20px 20px',
                        maskComposite: 'intersect',
                        maskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)',
                        opacity: '0.5'
                    }}
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-tl from-transparent via-background/40 to-background" />
            </div>
            <div className="z-10 flex flex-col items-center justify-center h-full relative gap-2">
                <div className="relative">
                    <h1 className="sm:text-8xl text-4xl font-raleway font-bold">
                        Sketch The <span className="font-inspiration">Art</span>
                    </h1>
                    <Cursor className="absolute sm:top-12 top-8 sm:right-1/2 right-1/4 sm:w-10 w-8 sm:h-10 h-8" />
                    <p className="sm:text-2xl text-sm font-light py-4 font-mono text-center">
                        Component Which Contains Life
                    </p>
                </div>
                <div className="flex flex-row gap-2 z-30">
                <Link href="/docs">
                <Button variant="default" className="cursor-pointer">Browse Components</Button>
                </Link>
                <Link href="https://github.com/sketch-the-art/sketch-the-art" >
                <Button variant="secondary">Github</Button>
                </Link>
                </div>
            </div>
            {/* <div className="absolute bottom-0 right-0 z-0 w-full">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/80 to-background/80 blur-xl" />
            <GemSmoke
                 style={{ width: '100%', height: '100px' }}
                colors={["#fe5b16", "#f7ff61", "#ffffff"]}
                colorBack="#0F0F0F"
                colorInner="#0F0F0F"
                shape="none"
                innerDistortion={0.71}
                outerDistortion={0.8}
                outerGlow={0}
                innerGlow={1}
                offset={0}
                angle={0}
                size={0.8}
                speed={1}
                scale={3}
                />
                </div> */}
        </div>
    );
};

// const color = [
//     "#fe5b16",
//     "#f7ff61",
//     "#ffffff"
// ]