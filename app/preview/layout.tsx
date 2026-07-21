import { DialRoot } from "dialkit";
import "dialkit/styles.css";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DialRoot defaultOpen={false} position="bottom-right" productionEnabled />
    </>
  );
}
