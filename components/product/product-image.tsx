"use client";

import Image from "next/image";
import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 180px",
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[110px] w-full items-center justify-center overflow-hidden bg-surface-muted",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain p-3"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full min-h-[110px] w-full flex-col items-center justify-center gap-2 text-muted"
          role="img"
          aria-label={alt + " – kein Produktbild verfügbar"}
        >
          <Leaf className="h-8 w-8 text-forest/60" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[11px]">Kein Produktbild</span>
        </div>
      )}
    </div>
  );
}
