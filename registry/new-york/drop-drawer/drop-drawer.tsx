"use client";

import { ChevronRightIcon } from "lucide-react";
import * as React from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
};

type RootDropDrawerProps = BaseProps & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type DropDrawerProps = BaseProps & {
  className?: string;
  asChild?: true;
};

type DropDrawerSeparatorProps = {
  className?: string;
};

type DropDrawerGroupProps = BaseProps & {
  className?: string;
};

type DropDrawerItemProps = DropDrawerProps & {
  onSelect?: (event: Event) => void;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  inset?: boolean;
  disabled?: boolean;
};

const DropDrawerContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const useDropDrawerContext = () => {
  const context = React.useContext(DropDrawerContext);
  if (!context) {
    throw new Error(
      "DropDrawer components cannot be rendered outside the DropDrawer Context"
    );
  }
  return context;
};

function DropDrawer({ children, ...props }: RootDropDrawerProps) {
  const isMobile = useIsMobile();
  const DropdownComponent = isMobile ? Drawer : DropdownMenu;

  return (
    <DropDrawerContext.Provider value={{ isMobile }}>
      <DropdownComponent
        data-slot="drop-drawer"
        {...(isMobile && { autoFocus: true })}
        {...props}
      >
        {children}
      </DropdownComponent>
    </DropDrawerContext.Provider>
  );
}

function DropDrawerTrigger({ className, children, ...props }: DropDrawerProps) {
  const { isMobile } = useDropDrawerContext();
  const TriggerComponent = isMobile ? DrawerTrigger : DropdownMenuTrigger;

  return (
    <TriggerComponent
      data-slot="drop-drawer-trigger"
      className={className}
      {...props}
    >
      {children}
    </TriggerComponent>
  );
}

// Context for managing submenu state on mobile
interface SubmenuContextType {
  activeSubmenu: string | null;
  setActiveSubmenu: (id: string | null) => void;
  submenuTitle: string | null;
  setSubmenuTitle: (title: string | null) => void;
  navigateToSubmenu?: (id: string, title: string) => void;
}

const SubmenuContext = React.createContext<SubmenuContextType>({
  activeSubmenu: null,
  setActiveSubmenu: () => {},
  submenuTitle: null,
  setSubmenuTitle: () => {},
  navigateToSubmenu: undefined,
});

function DropDrawerContent({
  className,
  children,
  ...props
}: DropDrawerProps) {
  const { isMobile } = useDropDrawerContext();
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);
  const [submenuTitle, setSubmenuTitle] = React.useState<string | null>(null);

  const goBack = () => {
    setActiveSubmenu(null);
    setSubmenuTitle(null);
  };

  if (isMobile) {
    return (
      <SubmenuContext.Provider
        value={{
          activeSubmenu,
          setActiveSubmenu,
          submenuTitle,
          setSubmenuTitle,
          navigateToSubmenu: (id, title) => {
            setActiveSubmenu(id);
            setSubmenuTitle(title);
          },
        }}
      >
        <DrawerContent
          data-slot="drop-drawer-content"
          className={cn(className)}
          {...props}
        >
          {activeSubmenu ? (
            <>
              <DrawerHeader className="border-b">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goBack}
                    className="hover:bg-muted/50 rounded-full p-1"
                  >
                    <ChevronRightIcon className="h-5 w-5 rotate-180" />
                  </button>
                  <DrawerTitle>{submenuTitle || "Submenu"}</DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto">
                {/* Find and render the active submenu content */}
                <div className="py-3 pb-4">
                  {(() => {
                    // Function to extract submenu content
                    const extractSubmenuContent = (
                      elements: React.ReactNode,
                      targetId: string
                    ): React.ReactNode[] => {
                      const result: React.ReactNode[] = [];
                      React.Children.forEach(elements, (child) => {
                        if (
                          React.isValidElement(child) &&
                          child.type === DropDrawerSub &&
                          child.props.id === targetId
                        ) {
                          // Found the target submenu, extract its children
                          React.Children.forEach(
                            child.props.children,
                            (subChild) => {
                              if (
                                React.isValidElement(subChild) &&
                                subChild.type === DropDrawerSubContent
                              ) {
                                result.push(subChild.props.children);
                              }
                            }
                          );
                        } else if (React.isValidElement(child) && child.props?.children) {
                          // Recursively search in children
                          const nestedContent = extractSubmenuContent(
                            child.props.children,
                            targetId
                          );
                          result.push(...nestedContent);
                        }
                      });
                      return result;
                    };

                    const submenuContent = extractSubmenuContent(
                      children,
                      activeSubmenu
                    );
                    return submenuContent.length > 0 ? (
                      submenuContent
                    ) : (
                      <div className="px-4 py-2 text-muted-foreground">
                        No content found
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="py-3 pb-4">{children}</div>
            </div>
          )}
          <DrawerFooter className="border-t pt-2">
            <DrawerClose asChild>
              <button className="w-full rounded-md border py-2 text-sm font-medium">
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </SubmenuContext.Provider>
    );
  }

  return (
    <SubmenuContext.Provider
      value={{ activeSubmenu, setActiveSubmenu, submenuTitle, setSubmenuTitle }}
    >
      <DropdownMenuContent
        data-slot="drop-drawer-content"
        align="end"
        sideOffset={4}
        className={cn(
          "max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[220px] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    </SubmenuContext.Provider>
  );
}

function DropDrawerLabel({
  className,
  children,
  ...props
}: DropDrawerProps) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <div
        data-slot="drop-drawer-label"
        className={cn(
          "px-4 py-2 text-sm font-semibold text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <DropdownMenuLabel
      data-slot="drop-drawer-label"
      className={className}
      {...props}
    >
      {children}
    </DropdownMenuLabel>
  );
}

function DropDrawerSeparator({
  className,
  ...props
}: DropDrawerSeparatorProps) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <div
        data-slot="drop-drawer-separator"
        className={cn("mx-2 my-1 h-px bg-border", className)}
        {...props}
      />
    );
  }

  return (
    <DropdownMenuSeparator
      data-slot="drop-drawer-separator"
      className={className}
      {...props}
    />
  );
}

function DropDrawerItem({
  className,
  children,
  icon,
  variant = "default",
  inset,
  disabled,
  onClick,
  ...props
}: DropDrawerItemProps) {
  const { isMobile } = useDropDrawerContext();
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Check if this item is inside a group
  const isInsideGroup = React.useMemo(() => {
    if (!itemRef.current) return false;
    let parent = itemRef.current.parentElement;
    while (parent) {
      if (parent.hasAttribute("data-drop-drawer-group")) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }, []);

  if (isMobile) {
    return (
      <div
        ref={itemRef}
        data-slot="drop-drawer-item"
        data-variant={variant}
        data-inset={inset}
        data-disabled={disabled}
        className={cn(
          "flex cursor-pointer items-center gap-2 px-4 py-3",
          // Only apply margin, background and rounded corners if not in a group
          !isInsideGroup && "bg-accent dark:bg-accent mx-2 my-0.5 rounded-md",
          // For items in a group, don't add background
          isInsideGroup && "bg-transparent",
          variant === "destructive" && "text-destructive",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-grow">{children}</span>
      </div>
    );
  }

  return (
    <DropdownMenuItem
      data-slot="drop-drawer-item"
      data-variant={variant}
      data-inset={inset}
      className={cn(
        variant === "destructive" && "text-destructive",
        inset && "pl-8",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {children}
    </DropdownMenuItem>
  );
}

function DropDrawerGroup({
  className,
  children,
  ...props
}: DropDrawerGroupProps) {
  const { isMobile } = useDropDrawerContext();

  // Add separators between items for mobile view
  const childrenWithSeparators = React.useMemo(() => {
    if (!isMobile) return children;

    const result: React.ReactNode[] = [];
    React.Children.forEach(children, (child, index) => {
      if (index > 0) {
        result.push(
          <div
            key={`separator-${index}`}
            className="mx-3 h-px bg-border/50"
          />
        );
      }
      result.push(child);
    });
    return result;
  }, [children, isMobile]);

  if (isMobile) {
    return (
      <div
        data-drop-drawer-group
        data-slot="drop-drawer-group"
        role="group"
        className={cn(
          "bg-accent dark:bg-accent mx-2 my-3 overflow-hidden rounded-xl",
          className
        )}
        {...props}
      >
        {childrenWithSeparators}
      </div>
    );
  }

  // On desktop, use a div with proper role and attributes
  return (
    <div
      data-drop-drawer-group
      data-slot="drop-drawer-group"
      role="group"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

// Submenu components
function DropDrawerSub({
  children,
  id,
  ...props
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
}) {
  const { isMobile } = useDropDrawerContext();
  // Generate ID outside of conditionals
  const generatedId = React.useId();
  const submenuId = id || generatedId;

  if (isMobile) {
    // For mobile, we don't use the Radix DropdownMenuSub
    // Instead, we'll handle the submenu navigation in the DropDrawerContent
    return (
      <div data-submenu-id={submenuId} data-slot="drop-drawer-sub">
        {children}
      </div>
    );
  }

  return (
    <DropdownMenuSub data-slot="drop-drawer-sub" {...props}>
      {children}
    </DropdownMenuSub>
  );
}

function DropDrawerSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropDrawerProps & { inset?: boolean }) {
  const { isMobile } = useDropDrawerContext();
  const { navigateToSubmenu } = React.useContext(SubmenuContext);
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Check if this item is inside a group
  const isInsideGroup = React.useMemo(() => {
    if (!itemRef.current) return false;
    let parent = itemRef.current.parentElement;
    while (parent) {
      if (parent.hasAttribute("data-drop-drawer-group")) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }, []);

  if (isMobile) {
    // Find the submenu ID from the parent
    const submenuId = React.useMemo(() => {
      if (!itemRef.current) return null;
      let parent = itemRef.current.parentElement;
      while (parent) {
        if (parent.hasAttribute("data-submenu-id")) {
          return parent.getAttribute("data-submenu-id");
        }
        parent = parent.parentElement;
      }
      return null;
    }, []);

    const combinedOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (submenuId && navigateToSubmenu) {
        navigateToSubmenu(
          submenuId,
          typeof children === "string"
            ? children
            : "Submenu"
        );
      }
      if (props.onClick) {
        props.onClick(e);
      }
    };

    // Remove onClick from props to avoid duplicate handlers
    const { ...restProps } = props as Record<string, unknown>;

    // Don't wrap in DrawerClose for submenu triggers
    return (
      <div
        ref={itemRef}
        data-slot="drop-drawer-sub-trigger"
        data-inset={inset}
        className={cn(
          "flex cursor-pointer items-center justify-between px-4 py-3",
          // Only apply margin, background and rounded corners if not in a group
          !isInsideGroup && "bg-accent dark:bg-accent mx-2 my-0.5 rounded-md",
          // For items in a group, don't add background
          isInsideGroup && "bg-transparent",
          inset && "pl-8",
          className
        )}
        onClick={combinedOnClick}
        {...restProps}
      >
        <div className="flex items-center gap-2">{children}</div>
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <DropdownMenuSubTrigger
      data-slot="drop-drawer-sub-trigger"
      data-inset={inset}
      className={className}
      inset={inset}
      {...props}
    >
      {children}
    </DropdownMenuSubTrigger>
  );
}

function DropDrawerSubContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: DropDrawerProps & { sideOffset?: number }) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    // For mobile, we don't render the content directly
    // It will be rendered by the DropDrawerContent component when active
    return null;
  }

  return (
    <DropdownMenuSubContent
      data-slot="drop-drawer-sub-content"
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuSubContent>
  );
}

function DropDrawerFooter({
  className,
  children,
  ...props
}: DropDrawerProps) {
  const { isMobile } = useDropDrawerContext();

  if (!isMobile) {
    return null;
  }

  return (
    <div
      data-slot="drop-drawer-footer"
      className={cn("px-4 py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  DropDrawer,
  DropDrawerContent,
  DropDrawerFooter,
  DropDrawerGroup,
  DropDrawerItem,
  DropDrawerLabel,
  DropDrawerSeparator,
  DropDrawerSub,
  DropDrawerSubContent,
  DropDrawerSubTrigger,
  DropDrawerTrigger,
};
