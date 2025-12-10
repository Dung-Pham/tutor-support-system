/**
 * File: Components/layout/Footer.tsx
 * Purpose: Reusable footer component using shadcn/ui
 * Features:
 *   - shadcn Button components for navigation and social links
 *   - lucide-react icons for social media
 *   - Theme-aware styling with CSS variables
 *   - Responsive layout
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, Github, Youtube } from 'lucide-react';

export default function GlobalFooter() {
  return (
    <section className="bg-background mt-12">
      <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Button variant="link" className="text-base" asChild>
            <Link to="/about">About</Link>
          </Button>
          <Button variant="link" className="text-base" asChild>
            <Link to="/blog">Blog</Link>
          </Button>
          <Button variant="link" className="text-base" asChild>
            <Link to="/team">Team</Link>
          </Button>
          <Button variant="link" className="text-base" asChild>
            <Link to="/pricing">Pricing</Link>
          </Button>
          <Button variant="link" className="text-base" asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          <Button variant="link" className="text-base" asChild>
            <Link to="/terms">Terms</Link>
          </Button>
        </nav>

        <div className="flex justify-center mt-8 space-x-3">
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <a href="#" aria-label="Facebook">
              <Facebook className="h-6 w-6" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <a href="#" aria-label="Instagram">
              <Instagram className="h-6 w-6" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <a href="#" aria-label="Twitter">
              <Twitter className="h-6 w-6" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <a href="#" aria-label="GitHub">
              <Github className="h-6 w-6" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <a href="#" aria-label="YouTube">
              <Youtube className="h-6 w-6" />
            </a>
          </Button>
        </div>

        <p className="mt-8 text-base text-center text-muted-foreground">
          © {new Date().getFullYear()} Your Company, Inc. All rights reserved.
        </p>
      </div>
    </section>
  );
}
