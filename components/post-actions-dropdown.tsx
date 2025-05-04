"use client";

import {
  AlertTriangle,
  BookmarkIcon,
  ChevronRight,
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
  DropDrawerItem,
  DropDrawerSeparator,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";

interface PostActionsDropdownProps {
  postId?: string;
  userId?: string;
  onAddToFeed?: () => void;
  onSave?: () => void;
  onNotInterested?: () => void;
  onMute?: () => void;
  onUnfollow?: () => void;
  onReport?: () => void;
  onCopyLink?: () => void;
}

export function PostActionsDropdown({
  postId,
  // userId is defined but not used
  onAddToFeed,
  onSave,
  onNotInterested,
  onMute,
  onUnfollow,
  onReport,
  onCopyLink,
}: PostActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleCopyLink = () => {
    if (postId) {
      const url = `${window.location.origin}/post/${postId}`;
      navigator.clipboard.writeText(url);
    }
    if (onCopyLink) onCopyLink();
    setOpen(false);
  };

  return (
    <DropDrawer open={open} onOpenChange={setOpen}>
      <DropDrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropDrawerTrigger>
      <DropDrawerContent>
        <DropDrawerItem
          onClick={onAddToFeed}
          icon={<ChevronRight className="h-5 w-5" />}
        >
          Add to feed
        </DropDrawerItem>

        <DropDrawerItem
          onClick={onSave}
          icon={<BookmarkIcon className="h-5 w-5" />}
        >
          Save
        </DropDrawerItem>

        <DropDrawerItem
          onClick={onNotInterested}
          icon={<EyeOffIcon className="h-5 w-5" />}
        >
          Not interested
        </DropDrawerItem>

        <DropDrawerSeparator />

        <DropDrawerItem
          onClick={onMute}
          icon={<UserMinusIcon className="h-5 w-5" />}
        >
          Mute
        </DropDrawerItem>

        <DropDrawerItem
          onClick={onUnfollow}
          icon={<UserXIcon className="h-5 w-5" />}
        >
          Unfollow
        </DropDrawerItem>

        <DropDrawerSeparator />

        <DropDrawerItem
          variant="destructive"
          onClick={onReport}
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          Report
        </DropDrawerItem>

        <DropDrawerSeparator />

        <DropDrawerItem
          onClick={handleCopyLink}
          icon={<Copy className="h-5 w-5" />}
        >
          Copy link
        </DropDrawerItem>
      </DropDrawerContent>
    </DropDrawer>
  );
}
