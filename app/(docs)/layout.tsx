import { DocsSidebar } from "@/components/docs/layout/sidebar/docs-sidebar";
import DocsHeader from "@/components/docs/layout/header/docs-header";
import {
    DocsSidebarTriggerInInset,
    DocsSidebarTriggerLayoutGroup,
} from "@/components/docs/layout/docs-sidebar-trigger";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageWrapper } from "@/components/docs/ui/page-wrapper";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider className="bg-background">
            <DocsSidebarTriggerLayoutGroup>
                <DocsSidebar />
                <SidebarInset className="bg-background">
                    <DocsSidebarTriggerInInset />
                    <DocsHeader />

                    <div className="w-full bg-background pt-1 pr-1 pl-1 scroll-fade-y">
                        <PageWrapper>{children}</PageWrapper>
                    </div>
                </SidebarInset>
            </DocsSidebarTriggerLayoutGroup>
        </SidebarProvider>
    );
}
