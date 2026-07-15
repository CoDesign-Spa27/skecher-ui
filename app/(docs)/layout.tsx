import {
  DocsSidebarTriggerInInset,
  DocsSidebarTriggerLayoutGroup,
} from "@/components/docs/layout/docs-sidebar-trigger";
import DocsHeader from "@/components/docs/layout/header/docs-header";
import { DocsSidebar } from "@/components/docs/layout/sidebar/docs-sidebar";
import { PageWrapper } from "@/components/docs/ui/page-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="bg-background" defaultOpen={false}>
      <DocsSidebarTriggerLayoutGroup>
        <DocsSidebar />
        <SidebarInset className="bg-background">
          <DocsSidebarTriggerInInset />
          <DocsHeader />

          <div className="relative h-svh w-full overflow-hidden bg-background">
            <PageWrapper>{children}</PageWrapper>
          </div>
        </SidebarInset>
      </DocsSidebarTriggerLayoutGroup>
    </SidebarProvider>
  );
}
