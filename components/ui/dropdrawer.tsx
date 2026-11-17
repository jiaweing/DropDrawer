"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  animate,
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  type Transition,
} from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
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

// Parts rendered outside a DropDrawer fall back to the desktop variant.
const DropDrawerContext = React.createContext({ isMobile: false });

function useDropDrawerContext() {
  return React.useContext(DropDrawerContext);
}

// True inside a DropDrawerGroup, which draws the shared background for its rows on mobile.
const GroupContext = React.createContext(false);

// The DropDrawerSub that a trigger or content element belongs to.
const SubContext = React.createContext<{
  id: string;
  title?: React.ReactNode;
} | null>(null);

type SubmenuEntry = {
  id: string;
  title: React.ReactNode;
  label: string;
  trigger: HTMLElement;
};

// Mobile only. Each open submenu gets a panel, and its DropDrawerSubContent portals
// into that panel, so content keeps its React context wherever the Sub is declared.
const MobileMenuContext = React.createContext<{
  push: (entry: SubmenuEntry) => void;
  panels: Record<string, HTMLElement>;
} | null>(null);

const ITEM_SELECT = "dropdrawer.itemSelect";
const ENABLED_ITEM = '[role="menuitem"]:not([aria-disabled="true"])';

const SLIDE_TRANSITION: Transition = {
  type: "spring",
  bounce: 0,
  visualDuration: 0.25,
};
const FADE_TRANSITION: Transition = { duration: 0.15, ease: "easeOut" };

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) {
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function activateOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.target !== event.currentTarget) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.currentTarget.click();
  }
}

function mobileRowClassName({
  isInGroup,
  inset,
  disabled,
}: {
  isInGroup: boolean;
  inset?: boolean;
  disabled?: boolean;
}) {
  return cn(
    "flex cursor-pointer items-center justify-between px-4 py-4 outline-none select-none [-webkit-tap-highlight-color:transparent]",
    isInGroup
      ? "active:bg-foreground/5 focus-visible:bg-foreground/10"
      : "bg-accent focus-visible:ring-ring/50 mx-2 my-1.5 rounded-md transition-[scale,transform] duration-150 ease-out focus-visible:ring-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
    inset && "pl-8",
    disabled && "pointer-events-none opacity-50"
  );
}

// The `inert` prop needs React 19, so the property is set on the node instead.
function useInert<T extends HTMLElement>(inert: boolean) {
  const ref = React.useRef<T>(null);
  React.useLayoutEffect(() => {
    if (ref.current) ref.current.inert = inert;
  }, [inert]);
  return ref;
}

function DropDrawer({
  children,
  ...props
}:
  | React.ComponentProps<typeof Drawer>
  | React.ComponentProps<typeof DropdownMenu>) {
  const isMobile = useIsMobile();
  const DropdownComponent = isMobile ? Drawer : DropdownMenu;
  const contextValue = React.useMemo(() => ({ isMobile }), [isMobile]);

  return (
    <DropDrawerContext.Provider value={contextValue}>
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

function DropDrawerTrigger({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DrawerTrigger>
  | React.ComponentProps<typeof DropdownMenuTrigger>) {
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

function DropDrawerContent({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DrawerContent>
  | React.ComponentProps<typeof DropdownMenuContent>) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="drop-drawer-content"
        aria-describedby={undefined}
        className={cn("max-h-[90vh]", className)}
        {...props}
      >
        {/* Lives inside DrawerContent so the stack resets when the drawer closes. */}
        <MobileMenu>{children}</MobileMenu>
      </DrawerContent>
    );
  }

  return (
    <DropdownMenuContent
      data-slot="drop-drawer-content"
      align="end"
      sideOffset={4}
      className={cn(
        "max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[220px] overflow-y-auto motion-reduce:animate-none!",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  );
}

// Sizes the menu body to the active level. The new height goes into layout once and
// the drawer is then moved with `translate` (vaul owns `transform`), so the change
// animates without a layout pass per frame and can be redirected at any point.
function useSheetHeight(reduceMotion: boolean) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const visibleHeight = useMotionValue(0);
  const layoutHeight = React.useRef<number | null>(null);
  const requestedHeight = React.useRef<number | null>(null);
  const pendingHeight = React.useRef<number | null>(null);

  const setHeight = React.useCallback(
    (height: number) => {
      const body = bodyRef.current;
      if (!body) {
        // On mount the levels report before the body ref is attached.
        pendingHeight.current = height;
        return;
      }
      if (height === requestedHeight.current) return;
      requestedHeight.current = height;

      const sheet = body.closest<HTMLElement>("[data-vaul-drawer]");
      const direction = sheet?.getAttribute("data-vaul-drawer-direction");
      // Only drawers anchored to the top or bottom edge change size with the menu.
      const sign = direction === "bottom" ? 1 : direction === "top" ? -1 : 0;
      const applyLayout = (value: number) => {
        layoutHeight.current = value;
        body.style.height = `${value}px`;
      };

      // The drawer caps its own height, so read back what the body really gets.
      body.style.height = `${height}px`;
      const target = body.offsetHeight;
      const previous = layoutHeight.current;

      if (previous === null || !sheet || sign === 0 || reduceMotion) {
        visibleHeight.jump(target);
        applyLayout(target);
        if (sheet) sheet.style.translate = "";
        return;
      }

      // Lay out at the taller of the two sizes and keep the surplus off screen.
      const layout = Math.max(previous, target);
      const place = (visible: number) => {
        sheet.style.translate = `0 ${(layout - visible) * sign}px`;
      };
      applyLayout(layout);
      place(visibleHeight.get());
      animate(visibleHeight, target, {
        ...SLIDE_TRANSITION,
        onUpdate: place,
        onComplete: () => {
          applyLayout(target);
          sheet.style.translate = "";
        },
      });
    },
    [reduceMotion, visibleHeight]
  );

  // Runs after the levels' own layout effects, with the body ref attached.
  React.useLayoutEffect(() => {
    const pending = pendingHeight.current;
    pendingHeight.current = null;
    if (pending !== null) setHeight(pending);
  }, [setHeight]);

  React.useEffect(() => () => visibleHeight.stop(), [visibleHeight]);

  return { bodyRef, setHeight };
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [{ stack, direction }, setNavigation] = React.useState<{
    stack: SubmenuEntry[];
    direction: 1 | -1;
  }>({ stack: [], direction: 1 });
  const [panels, setPanels] = React.useState<Record<string, HTMLElement>>({});
  const { bodyRef, setHeight } = useSheetHeight(reduceMotion);
  const backButtonRef = React.useRef<HTMLButtonElement>(null);
  const pendingFocus = React.useRef<HTMLElement | "first-item" | null>(null);

  const current = stack.at(-1);
  const transition = reduceMotion ? FADE_TRANSITION : SLIDE_TRANSITION;

  const push = React.useCallback((entry: SubmenuEntry) => {
    pendingFocus.current = "first-item";
    setNavigation((prev) =>
      prev.stack.some((item) => item.id === entry.id)
        ? prev
        : { stack: [...prev.stack, entry], direction: 1 }
    );
  }, []);

  const goBack = () => {
    pendingFocus.current = current?.trigger ?? null;
    setNavigation((prev) =>
      prev.stack.length > 0
        ? { stack: prev.stack.slice(0, -1), direction: -1 }
        : prev
    );
  };

  const registerPanel = React.useCallback(
    (id: string, node: HTMLElement | null) => {
      setPanels((prev) => {
        if (node) return prev[id] === node ? prev : { ...prev, [id]: node };
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    []
  );

  // Move focus after navigating: into the new level, or back to the trigger that opened it.
  React.useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    if (target === "first-item") {
      const panel = current && panels[current.id];
      if (!panel) return;
      const firstItem = panel.querySelector<HTMLElement>(ENABLED_ITEM);
      (firstItem ?? backButtonRef.current)?.focus({ preventScroll: true });
    } else if (target.isConnected) {
      target.focus({ preventScroll: true });
    }
    pendingFocus.current = null;
  }, [current, panels]);

  // Arrow keys work as in the desktop menu: up and down move between items,
  // right opens a submenu and left returns to the previous level.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const item = event.target;
    if (
      event.defaultPrevented ||
      !(item instanceof HTMLElement) ||
      item.getAttribute("role") !== "menuitem"
    ) {
      return;
    }
    const items = Array.from(
      item
        .closest('[role="menu"]')
        ?.querySelectorAll<HTMLElement>(ENABLED_ITEM) ?? []
    );
    const index = items.indexOf(item);
    const run = (action: () => void) => {
      event.preventDefault();
      action();
    };

    switch (event.key) {
      case "ArrowDown":
        return run(() => items[(index + 1) % items.length]?.focus());
      case "ArrowUp":
        return run(() => items.at(index - 1)?.focus());
      case "Home":
        return run(() => items[0]?.focus());
      case "End":
        return run(() => items.at(-1)?.focus());
      case "ArrowRight":
        if (item.getAttribute("aria-haspopup") === "menu") run(() => item.click());
        return;
      case "ArrowLeft":
        if (current) run(goBack);
        return;
    }
  };

  const menuContext = React.useMemo(() => ({ push, panels }), [push, panels]);

  return (
    <MobileMenuContext.Provider value={menuContext}>
      <DrawerTitle className="sr-only">{current?.label ?? "Menu"}</DrawerTitle>
      <div
        ref={bodyRef}
        className="relative min-h-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <MenuHeader
          entry={current}
          direction={direction}
          reduceMotion={reduceMotion}
          transition={transition}
          backButtonRef={backButtonRef}
          onBack={goBack}
        />
        <MenuPanel
          label="Menu"
          active={!current}
          reduceMotion={reduceMotion}
          transition={transition}
          onHeightChange={setHeight}
        >
          {children}
        </MenuPanel>
        <AnimatePresence initial={false}>
          {stack.map((entry, index) => (
            <MenuPanel
              key={entry.id}
              id={entry.id}
              label={entry.label}
              active={index === stack.length - 1}
              reduceMotion={reduceMotion}
              transition={transition}
              onHeightChange={setHeight}
              registerPanel={registerPanel}
            />
          ))}
        </AnimatePresence>
      </div>
    </MobileMenuContext.Provider>
  );
}

// Back button and title of the open submenu. It overlays the top of the menu body
// and fades in over the root level; submenu panels start below it.
function MenuHeader({
  entry,
  direction,
  reduceMotion,
  transition,
  backButtonRef,
  onBack,
}: {
  entry: SubmenuEntry | undefined;
  direction: 1 | -1;
  reduceMotion: boolean;
  transition: Transition;
  backButtonRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
}) {
  const headerRef = useInert<HTMLDivElement>(!entry);
  const offset = reduceMotion ? 0 : 24;
  const titleVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * offset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -offset }),
  };

  return (
    <motion.div
      ref={headerRef}
      initial={false}
      animate={{ opacity: entry ? 1 : 0 }}
      transition={transition}
      className="bg-background absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-2 px-4"
    >
      <button
        ref={backButtonRef}
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="hover:bg-muted/50 active:bg-muted focus-visible:ring-ring/50 rounded-full p-1 outline-none focus-visible:ring-2"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      {/* The DrawerTitle above already announces the level. */}
      <div className="relative min-w-0 flex-1" aria-hidden>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          {entry && (
            <motion.div
              key={entry.id}
              custom={direction}
              variants={titleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="text-foreground truncate font-semibold"
            >
              {entry.title}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// One level of the menu. The root level renders its children; a submenu level is an
// empty panel that the matching DropDrawerSubContent portals into.
function MenuPanel({
  id,
  label,
  active,
  reduceMotion,
  transition,
  onHeightChange,
  registerPanel,
  children,
}: {
  id?: string;
  label: string;
  active: boolean;
  reduceMotion: boolean;
  transition: Transition;
  onHeightChange: (height: number) => void;
  registerPanel?: (id: string, node: HTMLElement | null) => void;
  children?: React.ReactNode;
}) {
  const isPresent = useIsPresent();
  const panelRef = useInert<HTMLDivElement>(!(active && isPresent));
  const contentNode = React.useRef<HTMLDivElement | null>(null);

  const contentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentNode.current = node;
      if (id && registerPanel) registerPanel(id, node);
    },
    [id, registerPanel]
  );

  // The active level decides how tall the menu body is.
  React.useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentNode.current;
    if (!active || !panel || !content) return;
    const report = () => {
      // A submenu panel is empty for a moment until its content portals in.
      if (content.childElementCount) {
        onHeightChange(panel.offsetTop + content.offsetHeight);
      }
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(content);
    return () => observer.disconnect();
  }, [active, onHeightChange, panelRef]);

  // Push and pop run together: the new level slides over the old one, which drifts
  // left and fades. With reduced motion the levels only crossfade.
  const offRight = reduceMotion ? { x: 0, opacity: 0 } : { x: "100%", opacity: 1 };
  const covered = reduceMotion ? { x: 0, opacity: 0 } : { x: "-30%", opacity: 0 };

  return (
    <motion.div
      ref={panelRef}
      role="menu"
      aria-label={label}
      initial={id ? offRight : false}
      animate={active ? { x: 0, opacity: 1 } : covered}
      exit={offRight}
      transition={transition}
      className={cn(
        "bg-background absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain",
        id ? "top-14" : "top-0"
      )}
    >
      {/* flow-root keeps the margins of the first and last row inside the measured box. */}
      <div ref={contentRef} className="flow-root w-full space-y-1.5 pb-6">
        {children}
      </div>
    </motion.div>
  );
}

function DropDrawerItem({
  className,
  children,
  onSelect,
  onClick,
  onKeyDown,
  icon,
  variant = "default",
  inset,
  disabled,
  asChild,
  textValue,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  icon?: React.ReactNode;
}) {
  const { isMobile } = useDropDrawerContext();
  const isInGroup = React.useContext(GroupContext);

  if (isMobile) {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (event.defaultPrevented || !onSelect) return;
      // Same contract as Radix: onSelect gets a cancelable Event, and
      // preventDefault() keeps the drawer open.
      const target = event.currentTarget;
      const selectEvent = new CustomEvent(ITEM_SELECT, {
        bubbles: true,
        cancelable: true,
      });
      target.addEventListener(ITEM_SELECT, onSelect, { once: true });
      target.dispatchEvent(selectEvent);
      if (selectEvent.defaultPrevented) event.preventDefault();
    };

    return (
      // DrawerClose skips closing when the click event was default-prevented.
      <DrawerClose asChild>
        <div
          data-slot="drop-drawer-item"
          data-variant={variant}
          data-inset={inset || undefined}
          data-disabled={disabled || undefined}
          role="menuitem"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          className={cn(
            mobileRowClassName({ isInGroup, inset, disabled }),
            variant === "destructive" && "text-destructive",
            className
          )}
          onClick={handleClick}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented) activateOnKeyDown(event);
          }}
          {...props}
        >
          <div className="flex items-center gap-2">{children}</div>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
      </DrawerClose>
    );
  }

  return (
    <DropdownMenuItem
      data-slot="drop-drawer-item"
      data-variant={variant}
      data-inset={inset}
      className={className}
      onSelect={onSelect}
      onClick={onClick}
      onKeyDown={onKeyDown}
      variant={variant}
      inset={inset}
      disabled={disabled}
      asChild={asChild}
      textValue={textValue}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <div>{children}</div>
        {icon && <div>{icon}</div>}
      </div>
    </DropdownMenuItem>
  );
}

function DropDrawerSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  const { isMobile } = useDropDrawerContext();

  // Groups already provide the visual separation on mobile.
  if (isMobile) {
    return null;
  }

  return (
    <DropdownMenuSeparator
      data-slot="drop-drawer-separator"
      className={className}
      {...props}
    />
  );
}

function DropDrawerLabel({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DropdownMenuLabel>
  | React.ComponentProps<typeof DrawerTitle>) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    // A plain element: the drawer already has one DrawerTitle for screen readers.
    return (
      <div
        data-slot="drop-drawer-label"
        className={cn(
          "text-muted-foreground px-4 py-2 text-sm font-medium",
          className
        )}
        {...(props as React.ComponentProps<"div">)}
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

function DropDrawerFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerFooter> | React.ComponentProps<"div">) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <DrawerFooter
        data-slot="drop-drawer-footer"
        className={cn("p-4", className)}
        {...props}
      >
        {children}
      </DrawerFooter>
    );
  }

  return (
    <div
      data-slot="drop-drawer-footer"
      className={cn("p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DropDrawerGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  children: React.ReactNode;
}) {
  const { isMobile } = useDropDrawerContext();

  const childrenWithSeparators = React.useMemo(() => {
    if (!isMobile) return children;

    const items = React.Children.toArray(children).filter(
      (child) =>
        React.isValidElement(child) && child.type !== DropDrawerSeparator
    );

    return items.flatMap((child, index) =>
      index === items.length - 1
        ? [child]
        : [
            child,
            <div
              key={`separator-${index}`}
              className="bg-border h-px"
              aria-hidden="true"
            />,
          ]
    );
  }, [children, isMobile]);

  if (isMobile) {
    return (
      <GroupContext.Provider value={true}>
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
      </GroupContext.Provider>
    );
  }

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

function DropDrawerSub({
  children,
  id,
  title,
  ...props
}: React.ComponentProps<typeof DropdownMenuSub> & {
  id?: string;
  /** Header title of the submenu on mobile. Defaults to the trigger's text. */
  title?: React.ReactNode;
}) {
  const { isMobile } = useDropDrawerContext();
  const generatedId = React.useId();
  const subId = id ?? generatedId;
  const subContext = React.useMemo(() => ({ id: subId, title }), [subId, title]);

  return (
    <SubContext.Provider value={subContext}>
      {isMobile ? (
        <div data-slot="drop-drawer-sub" data-submenu-id={subId} id={subId}>
          {children}
        </div>
      ) : (
        <DropdownMenuSub data-slot="drop-drawer-sub" {...props}>
          {children}
        </DropdownMenuSub>
      )}
    </SubContext.Provider>
  );
}

function DropDrawerSubTrigger({
  className,
  inset,
  children,
  icon,
  disabled,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  icon?: React.ReactNode;
}) {
  const { isMobile } = useDropDrawerContext();
  const isInGroup = React.useContext(GroupContext);
  const sub = React.useContext(SubContext);
  const menu = React.useContext(MobileMenuContext);

  // Accepted for API compatibility; the chevron takes the icon slot.
  void icon;

  if (isMobile) {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (disabled || event.defaultPrevented || !sub || !menu) return;
      const label =
        getNodeText(sub.title).trim() ||
        getNodeText(children).trim() ||
        event.currentTarget.textContent?.trim() ||
        "Submenu";
      menu.push({
        id: sub.id,
        title: sub.title ?? label,
        label,
        trigger: event.currentTarget,
      });
    };

    return (
      <div
        data-slot="drop-drawer-sub-trigger"
        data-inset={inset || undefined}
        data-disabled={disabled || undefined}
        role="menuitem"
        aria-haspopup="menu"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        className={cn(
          mobileRowClassName({ isInGroup, inset, disabled }),
          className
        )}
        onClick={handleClick}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) activateOnKeyDown(event);
        }}
        {...props}
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
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
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
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  const { isMobile } = useDropDrawerContext();
  const sub = React.useContext(SubContext);
  const menu = React.useContext(MobileMenuContext);

  if (isMobile) {
    const panel = sub && menu?.panels[sub.id];
    if (!panel) return null;
    // Context follows the React tree through the portal, so reset what only
    // applies at the Sub's own position.
    return createPortal(
      <GroupContext.Provider value={false}>
        <SubContext.Provider value={null}>{children}</SubContext.Provider>
      </GroupContext.Provider>,
      panel
    );
  }

  return (
    <DropdownMenuSubContent
      data-slot="drop-drawer-sub-content"
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg motion-reduce:animate-none!",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuSubContent>
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
