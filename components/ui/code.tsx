"use client";

import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CodeProps {
  code: {
    pnpm?: string;
    npm?: string;
    yarn?: string;
    bun?: string;
  };
  className?: string;
  showLineNumbers?: boolean;
  language?: string;
}

export function Code({ code, className, language = "bash" }: CodeProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pnpm");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get available package managers from the code object
  const packageManagers = Object.keys(code).filter(
    (key) => code[key as keyof typeof code]
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <Tabs
        defaultValue={packageManagers[0]}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b">
          <TabsList className="bg-transparent p-0 h-auto">
            {packageManagers.map((pm) => (
              <TabsTrigger
                key={pm}
                value={pm}
                className="px-3 py-1 text-xs data-[state=active]:bg-background/50 data-[state=active]:shadow-none"
              >
                {pm}
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            onClick={() =>
              copyToClipboard(code[activeTab as keyof typeof code] || "")
            }
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {packageManagers.map((pm) => (
          <TabsContent key={pm} value={pm} className="p-0 m-0">
            <CodeBlock
              code={code[pm as keyof typeof code] || ""}
              language={language}
              className="rounded-t-none"
              showCopyButton={false}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
