"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Code } from "@/components/ui/code";
import { CodeBlock } from "@/components/ui/code-block";
import { PostExample } from "../examples/post-example";

export default function DropDrawerPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-8 py-16 md:py-24">
      <header className="flex justify-between items-center mb-16">
        <a
          href="https://github.com/jiaweing/DropDrawer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
          >
            <path
              fill="currentColor"
              d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
            />
          </svg>
          GitHub
        </a>
        <ModeToggle />
      </header>

      <main className="flex-1">
        <div className="mb-16">
          <h1 className="text-2xl font-medium mb-2">DropDrawer</h1>
          <p className="text-muted-foreground">
            A responsive component that automatically switches between a
            dropdown menu on desktop and a drawer on mobile devices for
            shadcn/ui.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-4">Example</h2>
            <PostExample />
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4">Installation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Using shadcn registry (Recommended)
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The easiest way to install DropDrawer is through the shadcn
                  registry:
                </p>
                <Code
                  code={{
                    pnpm: "pnpm dlx shadcn@latest add https://dropdrawer.jiawei.dev/r/dropdrawer.json",
                    npm: "npx shadcn@latest add https://dropdrawer.jiawei.dev/r/dropdrawer.json",
                    yarn: "yarn dlx shadcn@latest add https://dropdrawer.jiawei.dev/r/dropdrawer.json",
                    bun: "bunx shadcn@latest add https://dropdrawer.jiawei.dev/r/dropdrawer.json",
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Manual Installation
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  1. Copy the dropdown-menu and drawer components from
                  shadcn/ui:
                </p>
                <Code
                  code={{
                    pnpm: "pnpm dlx shadcn@latest add dropdown-menu drawer",
                    npm: "npx shadcn@latest add dropdown-menu drawer",
                    yarn: "yarn dlx shadcn@latest add dropdown-menu drawer",
                    bun: "bunx shadcn@latest add dropdown-menu drawer",
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  For detailed manual installation steps, please refer to the{" "}
                  <a
                    href="https://github.com/jiaweing/dropdrawer"
                    className="underline"
                  >
                    README
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4">Usage</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Migrating from DropdownMenu
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  DropDrawer is designed as a drop-in replacement for
                  shadcn/ui&apos;s DropdownMenu component. Simply replace your
                  imports:
                </p>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  <CodeBlock
                    code={`import { DropDrawer, DropDrawerContent, DropDrawerItem, DropDrawerTrigger } from "@/components/ui/dropdrawer";`}
                    language="tsx"
                  />
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Basic Example</h3>
                <CodeBlock
                  code={`import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerItem,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";
import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <DropDrawer>
      <DropDrawerTrigger asChild>
        <Button>Open Menu</Button>
      </DropDrawerTrigger>
      <DropDrawerContent>
        <DropDrawerItem>Item 1</DropDrawerItem>
        <DropDrawerItem>Item 2</DropDrawerItem>
        <DropDrawerItem>Item 3</DropDrawerItem>
      </DropDrawerContent>
    </DropDrawer>
  );
}`}
                  language="tsx"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
