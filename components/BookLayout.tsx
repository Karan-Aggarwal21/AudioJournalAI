"use client";

/**
 * BookLayout — horizontal page navigation like a leather-bound journal.
 * CSS scroll-snap for smooth page transitions.
 * Pages: Cover → Record → Entries → Graphs/Insights
 */

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";

interface BookPage {
  id: string;
  label: string;
  content: ReactNode;
  fullBleed?: boolean;
  nebulaPage?: boolean;
  wide?: boolean;
}

interface BookLayoutProps {
  readonly pages: BookPage[];
  readonly onNavigateRef?: (fn: (index: number) => void) => void;
}

export default function BookLayout({ pages, onNavigateRef }: BookLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollToPage = useCallback(
    (index: number) => {
      if (scrollRef.current) {
        const pageWidth = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
          left: pageWidth * index,
          behavior: "smooth",
        });
        setCurrentPage(index);
      }
    },
    []
  );

  useEffect(() => {
    if (onNavigateRef) onNavigateRef(scrollToPage);
  }, [onNavigateRef, scrollToPage]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const pageWidth = scrollRef.current.clientWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      const page = Math.round(scrollLeft / pageWidth);
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    }
  }, [currentPage]);

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      scrollToPage(currentPage + 1);
    }
  }, [currentPage, pages.length, scrollToPage]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  }, [currentPage, scrollToPage]);

  return (
    <div className="app-wrapper">
      {/* Top transparent navigation */}
      <nav className="top-nav" aria-label="Main navigation">
        <div className="nav-logo">
          <svg className="nav-logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          <span className="nav-logo-text">MINDMIRROR</span>
        </div>
        <div className="nav-links">
          {pages.map((page, i) => (
            <button
              key={page.id}
              className={`nav-link ${i === currentPage ? "nav-link-active" : ""}`}
              onClick={() => scrollToPage(i)}
              aria-current={i === currentPage ? "page" : undefined}
            >
              {page.label}
            </button>
          ))}
          <button className="nav-link">COMMUNITY</button>
        </div>
        <div className="nav-actions">
          <svg className="nav-mic-icon" viewBox="0 0 24 24" fill="currentColor" onClick={() => scrollToPage(1)}>
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
          </svg>
        </div>
      </nav>

      {/* Scroll container with pages */}
      <div
        className="book-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {pages.map((page) => (
          <section
            key={page.id}
            className="book-page"
            id={`page-${page.id}`}
          >
            <div
              className={
                page.nebulaPage
                  ? "book-nebula-inner"
                  : page.fullBleed
                    ? "book-cover-inner"
                    : page.wide
                      ? "book-page-inner book-page-wide"
                      : "book-page-inner"
              }
            >
              {page.content}
            </div>
            {/* Page texture overlay */}
            {!page.nebulaPage && <div className="book-page-texture" />}
          </section>
        ))}
      </div>

      {/* Page navigation arrows */}
      <div className="book-arrows">
        <button
          className="book-arrow book-arrow-left"
          onClick={goPrev}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="book-page-indicator">
          {currentPage + 1} / {pages.length}
        </span>
        <button
          className="book-arrow book-arrow-right"
          onClick={goNext}
          disabled={currentPage === pages.length - 1}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
