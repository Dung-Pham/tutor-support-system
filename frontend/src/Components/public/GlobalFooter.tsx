/**
 * File: Components/layout/Footer.tsx
 * Purpose: Reusable footer component with giasuonline.vn styling
 * Features:
 *   - Gradient purple background matching header
 *   - 4-column layout with links
 *   - Social media icons
 *   - Copyright information
 */

import { Link } from 'react-router-dom';

export default function GlobalFooter() {
  return (
    <section className="bg-white mt-12">
      <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link to="/about" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/blog" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Blog
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/team" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Team
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/pricing" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Pricing
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/contact" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/terms" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Terms
            </Link>
          </div>
        </nav>

        <div className="flex justify-center mt-8 space-x-6">
          <a
            href="#"
            aria-label="facebook"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/90 hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.4c0-2.2 1.3-3.4 3.2-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.6h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="instagram"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/90 hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <path d="M17.5 6.5h.01" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="x"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/90 hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12l-4.89 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="github"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/90 hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 2 .9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.6 11.6 0 016.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.7.2 3 .1 3.3.8.9 1.2 2 1.2 3.3 0 4.6-2.7 5.6-5.3 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="youtube"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[hsl(var(--primary-foreground))]/10 text-[hsl(var(--primary-foreground))]/90 hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1-2.9-.2-7.3-.2-7.3-.2s-4.4 0-7.3.2c-.4 0-1.4.1-2.1 1-.6.7-.8 2.3-.8 2.3S2 8 2 9.8v4.4c0 1.8.5 3.6.5 3.6s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.1 7.1.2 7.1.2s4.4 0 7.3-.2c.4 0 1.4-.1 2.1-1 .6-.7.8-2.3.8-2.3s.5-1.8.5-3.6V9.8c0-1.8-.5-3.6-.5-3.6zM9.8 15.4V8.6l6.1 3.4-6.1 3.4z" />
            </svg>
          </a>
        </div>

        <p className="mt-8 text-base leading-6 text-center text-gray-400">
          © 2021 SomeCompany, Inc. All rights reserved.
        </p>
      </div>
    </section>
  );
}
