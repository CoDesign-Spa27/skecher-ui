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

                    <div className="relative h-svh w-full overflow-hidden bg-background px-2 pt-2">
                        <PageWrapper>{children}</PageWrapper>
                    </div>
                </SidebarInset>
            </DocsSidebarTriggerLayoutGroup>
        </SidebarProvider>
    );
}
