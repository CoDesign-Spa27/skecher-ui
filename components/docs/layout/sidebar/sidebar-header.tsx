import { SidebarHeader } from "@/components/ui/sidebar";
import Link from "next/link";
import { DocsSidebarTriggerInSidebar } from "@/components/docs/layout/docs-sidebar-trigger";
import Image from "next/image";

const DocsSidebarHeader = () => {
    return (
        <SidebarHeader className="h-14 justify-center px-2">
            <div className="flex items-center px-1">
                <Link href="/" className="min-w-0 flex-1">
                    <span className="doto block text-2xl font-black tracking-tighter">
                        <Image src="/icon/dark-full-logo.svg" alt="Dark Logo" className="hidden dark:block" unoptimized width={150} height={80} />
                        <Image src="/icon/ligh-full-logo.svg" alt="Light Logo" className="dark:hidden block" unoptimized width={150} height={80} />
                    </span>
                </Link>
                <DocsSidebarTriggerInSidebar />
            </div>
        </SidebarHeader>
    );
};

export default DocsSidebarHeader;
