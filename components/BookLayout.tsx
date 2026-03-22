"use client";

/**
 * BookLayout — horizontal page navigation like a leather-bound journal.
 * CSS scroll-snap for smooth page transitions.
 * Pages: Cover → Record → Entries → Graphs/Insights
 */

import { useRef, useState, useCallback, type ReactNode } from "react";

interface BookPage {
  id: string;
  label: string;
  content: ReactNode;
  fullBleed?: boolean;
}

interface BookLayoutProps {
  readonly pages: BookPage[];
}

export default function BookLayout({ pages }: BookLayoutProps) {
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
    <div className="book-wrapper">
      {/* Book cover edge decoration */}
      <div className="book-spine" />

      {/* Navigation tabs */}
      <nav className="book-nav" aria-label="Journal pages">
        {pages.map((page, i) => (
          <button
            key={page.id}
            className={`book-tab ${i === currentPage ? "book-tab-active" : ""}`}
            onClick={() => scrollToPage(i)}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {page.label}
          </button>
        ))}
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
            <div className={page.fullBleed ? "book-cover-inner" : "book-page-inner"}>
              {page.content}
            </div>
            {/* Page texture overlay */}
            <div className="book-page-texture" />
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
