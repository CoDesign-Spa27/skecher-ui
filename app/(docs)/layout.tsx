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
     
                <SidebarTrigger className="absolute left-6 top-6  header-shadow p-4" />
                <DocsHeader />
       
                <div className="pt-1 pr-1 w-full bg-accent" >{children}</div>
          
            </SidebarInset>
        </SidebarProvider>
    );
}
