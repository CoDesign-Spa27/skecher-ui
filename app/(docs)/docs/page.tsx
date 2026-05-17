import { DLogo } from "@/public/icon/dark-logo";
import { LLogo } from "@/public/icon/light-logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center px-5">
            <DLogo className="w-80 mx-auto hidden dark:block" />
            <LLogo className="w-80 mx-auto block dark:hidden" />

            <h1 className="mx-auto p-2 text-center font-raleway text-4xl font-light">
                Outstanding is in our blood, why not ui?
            </h1>
            <p className="mx-auto max-w-4xl p-2 text-center text-lg font-light">
                SKECHER UI is an animated UI library powered by React and Motion. Build modern,
                intuitive interfaces with smooth interactions and effortless customizability.
            </p>

            <div className="flex flex-row items-center gap-2">
                <Button asChild className="mx-auto w-fit">
                    <Link href="/docs/streaming-text">Get Started</Link>
                </Button>
                <Button asChild variant="secondary" className="mx-auto w-fit">
                    <Link href="/docs/streaming-text">View Components</Link>
                </Button>
            </div>
        </div>
    );
};

export default Page;
