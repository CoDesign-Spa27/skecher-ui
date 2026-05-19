export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full rounded-xl border-none border-sidebar-border bg-sidebar shadow-sm pt-16 pb-10 no-scrollbar  overflow-scroll sm:h-[calc(100vh-0.5rem)] sm:overscroll-none sm:border ">
            {children}
        </div>
    )
}