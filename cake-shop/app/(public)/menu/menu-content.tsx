"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CakeCard } from "@/components/public/CakeCard";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const CAKE_TYPES = ["All", "cake", "pastries"];
const EGG_TYPES = ["All", "eggless", "egg"];
const CATEGORIES = ["All", "Wedding", "Birthday", "Custom", "Anniversary"];

export function MenuContent() {
  const [cakes, setCakes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cakeType, setCakeType] = useState("All");
  const [eggType, setEggType] = useState("All");
  const [category, setCategory] = useState("All");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchCakes = useCallback(
    async (loadMore = false) => {
      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (cakeType !== "All") params.set("caketype", cakeType);
        if (eggType !== "All") params.set("type", eggType);
        if (category !== "All") params.set("category", category);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (loadMore && cursor) params.set("cursor", cursor);
        params.set("limit", "12");

        const res = await fetch(`/api/public/cakes?${params}`);
        const data = await res.json();

        if (data.success) {
          if (loadMore) {
            setCakes((prev) => [...prev, ...data.cakes]);
          } else {
            setCakes(data.cakes);
            if (data.pagination.total !== undefined) {
              setTotal(data.pagination.total);
            }
          }
          setCursor(data.pagination.nextCursor);
          setHasMore(data.pagination.hasMore);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cakeType, eggType, category, debouncedSearch, cursor]
  );

  // Reset and fetch on filter/search change
  useEffect(() => {
    setCakes([]);
    setCursor(null);
    setTotal(null);
    setHasMore(false);
  }, [cakeType, eggType, category, debouncedSearch]);

  // Fetch after reset
  useEffect(() => {
    if (cakes.length === 0 && !cursor) {
      fetchCakes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cakeType, eggType, category, debouncedSearch]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cakes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Type:
          </span>
          {CAKE_TYPES.map((t) => (
            <Badge
              key={t}
              variant={cakeType === t ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                cakeType === t && "bg-cake-gold text-white"
              )}
              onClick={() => setCakeType(t)}
            >
              {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Egg:
          </span>
          {EGG_TYPES.map((t) => (
            <Badge
              key={t}
              variant={eggType === t ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                eggType === t && "bg-cake-gold text-white"
              )}
              onClick={() => setEggType(t)}
            >
              {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Category:
          </span>
          {CATEGORIES.map((c) => (
            <Badge
              key={c}
              variant={category === c ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                category === c && "bg-cake-gold text-white"
              )}
              onClick={() => setCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {/* Count */}
      {total !== null && !loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {total} cake{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cake-gold" />
        </div>
      ) : cakes.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No cakes found matching your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cakes.map((cake: any) => (
              <CakeCard key={cake._id} cake={cake} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchCakes(true)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Cakes"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
