import "server-only";

// While `next build` runs, the database may not be reachable or migrated yet (for example the very
// first deploy). In that case the page is built empty and refreshes itself within the revalidate window.
// At runtime errors are never swallowed.
export async function withBuildFallback<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[build] Database not available, building this page empty: ${message}`);
      return fallback;
    }
    throw error;
  }
}
