import type { PaginatedResponse } from "./types";

/**
 * Fetches all pages from a paginated API endpoint and returns all items.
 *
 * @param fetcher - A function that accepts { page, page_size } and returns a PaginatedResponse
 * @param pageSize - The page_size to use per request (should match backend max limit)
 * @returns All items from all pages
 */
export async function fetchAllPages<T>(
  fetcher: (params: { page: number; page_size: number }) => Promise<PaginatedResponse<T>>,
  pageSize: number,
): Promise<T[]> {
  const first = await fetcher({ page: 1, page_size: pageSize });
  if (first.total_pages <= 1) return first.items;

  // Fetch remaining pages in parallel
  const remaining = Array.from(
    { length: first.total_pages - 1 },
    (_, i) => fetcher({ page: i + 2, page_size: pageSize }),
  );
  const pages = await Promise.all(remaining);
  return [...first.items, ...pages.flatMap((p) => p.items)];
}
