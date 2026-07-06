import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-full overflow-hidden bg-background">
      <ProgressiveBlur height="10%" position="top" />
      <div className="no-scrollbar h-full overflow-auto pt-16 sm:overscroll-none">{children}</div>
      <ProgressiveBlur height="7%" position="bottom" />
    </div>
  );
};
