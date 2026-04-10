import { DocsSidebar } from "@/components/docs/layout/sidebar/docs-sidebar";
import DocsHeader from "@/components/docs/layout/header/docs-header";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider className="" >
            <DocsSidebar />
            <SidebarInset>
                {/* Header */}
                <SidebarTrigger className="absolute top-5 left-5" />
                <DocsHeader />
                {/* Childrens */}
                <div className="pt-2 sm:pl-1 pl-3 pr-3 w-full bg-accent" >{children}</div>
                {/* Request more charts */}
            </SidebarInset>
        </SidebarProvider>
    );
}
