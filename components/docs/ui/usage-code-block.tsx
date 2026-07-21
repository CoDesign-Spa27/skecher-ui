import { CodeSnippet } from "./code-snippet";

export function UsageCodeBlock({ code }: { code: string }) {
  return (
    <CodeSnippet
      ariaLabel="Copy usage code"
      codeClassName="no-scrollbar max-h-[28rem] text-[13px] leading-5 [&_pre]:p-4"
      source={code}
    />
  );
}
