import { Heart } from 'lucide-react';
import { OfficialLinkBanner } from './OfficialLinkBanner';
import type { Page } from '../App';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <OfficialLinkBanner />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2025. Built with</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>using</span>
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onNavigate({ type: 'feedback' })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Feedback
            </button>
            <button
              onClick={() => onNavigate({ type: 'safety-privacy' })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy & Safety
            </button>
            <button
              onClick={() => onNavigate({ type: 'security' })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
