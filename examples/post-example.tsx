"use client";

import {
  AlertTriangle,
  BookmarkIcon,
  Copy,
  EyeOffIcon,
  MoreVertical,
  UserMinusIcon,
  UserXIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerGroup,
  DropDrawerItem,
  DropDrawerSeparator,
  DropDrawerSub,
  DropDrawerSubContent,
  DropDrawerSubTrigger,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";

import Image from "next/image";

export function PostExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-border/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/jay.png"
              height="40"
              width="40"
              alt="avatar"
              className="rounded-full"
            />
            <div>
              <p className="font-medium">Jay</p>
              <p className="text-xs text-muted-foreground">just now</p>
            </div>
          </div>
          <DropDrawer open={open} onOpenChange={setOpen}>
            <DropDrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropDrawerTrigger>
            <DropDrawerContent>
              {/* First group: Add to feed, Save, Not interested */}
              <DropDrawerGroup>
                <DropDrawerSub id="add-to-feed">
                  <DropDrawerSubTrigger>Add to feed</DropDrawerSubTrigger>
                  <DropDrawerSubContent>
                    <DropDrawerItem>Home feed</DropDrawerItem>
                    <DropDrawerItem>Work feed</DropDrawerItem>
                    <DropDrawerItem>Personal feed</DropDrawerItem>
                  </DropDrawerSubContent>
                </DropDrawerSub>
                <DropDrawerItem icon={<BookmarkIcon className="h-5 w-5" />}>
                  Save
                </DropDrawerItem>
                <DropDrawerItem icon={<EyeOffIcon className="h-5 w-5" />}>
                  Not interested
                </DropDrawerItem>
              </DropDrawerGroup>

              <DropDrawerSeparator />

              {/* Second group: Mute, Advanced options, Unfollow */}
              <DropDrawerGroup>
                <DropDrawerItem icon={<UserMinusIcon className="h-5 w-5" />}>
                  Mute
                </DropDrawerItem>
                <DropDrawerItem icon={<UserXIcon className="h-5 w-5" />}>
                  Unfollow
                </DropDrawerItem>
                <DropDrawerSub id="advanced-options">
                  <DropDrawerSubTrigger>Advanced options</DropDrawerSubTrigger>
                  <DropDrawerSubContent>
                    <DropDrawerItem>Hide this post</DropDrawerItem>
                    <DropDrawerItem>Block content</DropDrawerItem>
                    <DropDrawerSeparator />
                    <DropDrawerSub id="nested-submenu">
                      <DropDrawerSubTrigger>
                        Privacy options
                      </DropDrawerSubTrigger>
                      <DropDrawerSubContent>
                        <DropDrawerItem>Restrict sharing</DropDrawerItem>
                        <DropDrawerItem>Manage visibility</DropDrawerItem>
                      </DropDrawerSubContent>
                    </DropDrawerSub>
                  </DropDrawerSubContent>
                </DropDrawerSub>
              </DropDrawerGroup>

              <DropDrawerSeparator />

              {/* Third group: Report (destructive action) */}
              <DropDrawerGroup>
                <DropDrawerItem
                  variant="destructive"
                  icon={<AlertTriangle className="h-5 w-5" />}
                >
                  Report
                </DropDrawerItem>
              </DropDrawerGroup>

              <DropDrawerSeparator />

              {/* Fourth group: Copy link */}
              <DropDrawerGroup>
                <DropDrawerItem icon={<Copy className="h-5 w-5" />}>
                  Copy link
                </DropDrawerItem>
              </DropDrawerGroup>
            </DropDrawerContent>
          </DropDrawer>
        </div>
        <div className="mb-4">
          <p>Click the menu button to see it in action.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch between desktop and mobile view to see the responsive
            behavior.
          </p>
        </div>
        <div className="h-32 w-full rounded-lg bg-muted"></div>
      </div>
    </div>
  );
}
