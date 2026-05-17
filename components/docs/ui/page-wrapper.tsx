export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full rounded-xl border-[0.5px] border-sidebar-border bg-sidebar shadow-sm pt-16 pb-10">
            {children}
        </div>
    )
}