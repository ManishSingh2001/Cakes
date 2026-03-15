"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CakeCard } from "@/components/public/CakeCard";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface MenuContentProps {
  initialCakes: any[];
}

const CAKE_TYPES = ["All", "cake", "pastries"];
const EGG_TYPES = ["All", "eggless", "egg"];
const CATEGORIES = ["All", "Wedding", "Birthday", "Custom", "Anniversary"];

export function MenuContent({ initialCakes }: MenuContentProps) {
  const [search, setSearch] = useState("");
  const [cakeType, setCakeType] = useState("All");
  const [eggType, setEggType] = useState("All");
  const [category, setCategory] = useState("All");

  const debouncedSearch = useDebounce(search, 300);

  const filteredCakes = useMemo(() => {
    return initialCakes.filter((cake) => {
      const matchesSearch =
        !debouncedSearch ||
        cake.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cake.tags?.some((t: string) =>
          t.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      const matchesCakeType = cakeType === "All" || cake.caketype === cakeType;
      const matchesEggType = eggType === "All" || cake.type === eggType;
      const matchesCategory = category === "All" || cake.category === category;
      return matchesSearch && matchesCakeType && matchesEggType && matchesCategory;
    });
  }, [initialCakes, debouncedSearch, cakeType, eggType, category]);

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
          <span className="text-sm font-medium text-muted-foreground">Type:</span>
          {CAKE_TYPES.map((t) => (
            <Badge
              key={t}
              variant={cakeType === t ? "default" : "outline"}
              className={cn("cursor-pointer", cakeType === t && "bg-cake-gold text-white")}
              onClick={() => setCakeType(t)}
            >
              {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Egg:</span>
          {EGG_TYPES.map((t) => (
            <Badge
              key={t}
              variant={eggType === t ? "default" : "outline"}
              className={cn("cursor-pointer", eggType === t && "bg-cake-gold text-white")}
              onClick={() => setEggType(t)}
            >
              {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Category:</span>
          {CATEGORIES.map((c) => (
            <Badge
              key={c}
              variant={category === c ? "default" : "outline"}
              className={cn("cursor-pointer", category === c && "bg-cake-gold text-white")}
              onClick={() => setCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredCakes.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No cakes found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCakes.map((cake: any) => (
            <CakeCard key={cake._id} cake={cake} />
          ))}
        </div>
      )}
    </div>
  );
}
