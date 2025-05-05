"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showCopyButton?: boolean;
}

export function CodeBlock({
  code,
  language = "tsx",
  className,
  showCopyButton = true,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const highlight = async () => {
      try {
        // Use the current theme to determine which theme to use
        const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

        const html = await codeToHtml(code, {
          lang: language,
          theme: theme,
        });

        setHighlightedCode(html);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to highlight code:", error);
        setIsLoading(false);
      }
    };

    highlight();
  }, [code, language, resolvedTheme]);

  if (isLoading) {
    return (
      <div className={cn("rounded-md bg-muted p-4", className)}>
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn("relative rounded-md overflow-hidden bg-muted", className)}
    >
      {showCopyButton && (
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ClipboardIcon className="h-4 w-4" />
          )}
        </button>
      )}
      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </div>
  );
}
