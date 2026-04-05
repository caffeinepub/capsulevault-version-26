import { Menu } from "lucide-react";
import type { Page } from "../App";
import { OfficialLinkBanner } from "./OfficialLinkBanner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const isActive = (pageType: string) => {
    return currentPage.type === pageType;
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <button
          type="button"
          onClick={() => onNavigate({ type: "home" })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/lock-key-icon-transparent.dim_64x64.png"
            alt="LockLetter"
            className="w-7 h-7"
          />
          <span className="text-lg font-semibold text-foreground">
            LockLetter
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ type: "home" })}
            className={isActive("home") ? "font-semibold" : ""}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ type: "open" })}
            className={isActive("open") ? "font-semibold" : ""}
          >
            Open Capsule
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ type: "my-capsules" })}
            className={isActive("my-capsules") ? "font-semibold" : ""}
          >
            My Capsules
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ type: "verify" })}
            className={isActive("verify") ? "font-semibold" : ""}
          >
            Verify
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ type: "security" })}
            className={isActive("security") ? "font-semibold" : ""}
          >
            Security
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onNavigate({ type: "home" })}>
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate({ type: "open" })}>
                Open Capsule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onNavigate({ type: "my-capsules" })}
              >
                My Capsules
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate({ type: "verify" })}>
                Verify
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onNavigate({ type: "security" })}
              >
                Security
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <OfficialLinkBanner />
    </header>
  );
}
