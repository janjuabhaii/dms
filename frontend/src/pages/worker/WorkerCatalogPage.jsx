import { useState } from "react";
import { Search, PackageX } from "lucide-react";

import { Input } from "@/components/ui/input";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import ProductCatalogCard from "@/components/worker/ProductCatalogCard";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The worker's home screen — "View products" / "Search products" from the
 * required workflow. Reuses the exact same useProducts hook and /products
 * API built for the admin catalog in Phase 4; workers already have read
 * access to it, so there's no new backend surface here, just a
 * mobile-optimized presentation of the same data.
 */
const WorkerCatalogPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data: products, isLoading, isError, error, refetch } = useProducts(debouncedSearch);

  return (
    <div>
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 p-4 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 border-b border-border p-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6">
          <ErrorState message={error?.message} onRetry={refetch} />
        </div>
      ) : products?.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={PackageX}
            title={search ? "No products match your search" : "No products available"}
            description={search ? "Try a different search term." : "Check back once your admin adds products."}
          />
        </div>
      ) : (
        products.map((product, i) => <ProductCatalogCard key={product._id} product={product} index={i} />)
      )}
    </div>
  );
};

export default WorkerCatalogPage;
