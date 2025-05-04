"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "tsx",
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

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
      className={cn("rounded-md overflow-hidden", className)}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}
