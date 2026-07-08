"use client";

import { useState, useCallback } from "react";

interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

/**
 * usePagination — reusable pagination state
 *
 * Usage:
 *   const { page, limit, setPage, setLimit, offset } = usePagination({ total: 100 });
 */
export function usePagination(options: PaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 20, total = 0 } = options;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1);
  }, []);

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  return {
    page, limit, offset, totalPages,
    setPage: goToPage, setLimit,
    goNext, goPrev,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
