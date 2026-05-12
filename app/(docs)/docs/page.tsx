import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DLogo } from "@/public/icon/dark-logo";
import { DarkLogo } from "@/public/icon/dark-logo-full";
import { LLogo } from "@/public/icon/light-logo";
import React from "react";
// import { GenerateBreadcrumb } from "@/components/ui/generate-breadcrumb";
// import {
//     DocsContainer,
//     DocsDescription,
//     DocsLink,
//     DocsParagraph,
//     DocsSubContainer,
//     DocsSubtitle,
//     DocsTitle,
// } from "@/components/docs/components/docs-typography";
// import { WhiteSpan } from "@/components/ui/typography";

const Page = () => {
    return (
  
            <div className="flex flex-col items-center justify-center  h-full">
            <DLogo className="w-80 mx-auto hidden dark:block" />
            <LLogo className="w-80 mx-auto block dark:hidden" />

                <h1 className="text-4xl font-light p-2 mx-auto text-center font-raleway">Outstanding is in our blood, why not ui?</h1>
                <p className="text-lg font-light p-2 mx-auto text-center max-w-4xl">
                    SKECHER UI is an animated UI library powered by React and Motion. Build modern, intuitive interfaces with smooth interactions and effortless customizability.
                </p>
          
             <div className="flex flex-row items-center gap-2">
                <Button className="mx-auto w-fit">Get Started</Button>
                    <Button variant={"secondary"} className="mx-auto w-fit">Learn More</Button>
             </div>
            </div>
     
    );
};
export default Page;
