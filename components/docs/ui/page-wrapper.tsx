import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative h-full overflow-hidden rounded-xl border-none border-sidebar-border bg-sidebar shadow-sm sm:h-[calc(100vh-0.5rem)] sm:border">
            <ProgressiveBlur height="10%" position="top" />
            <div className="no-scrollbar h-full overflow-auto pb-10 pt-16 sm:overscroll-none">
                {children}
            </div>
            <ProgressiveBlur height="7%" position="bottom" />
        </div>
    )
}
