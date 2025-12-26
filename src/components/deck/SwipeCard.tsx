"use client";
import React, { forwardRef } from "react";
import { JellyfinItem } from "@/types/swiparr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Direction, FramerTinderCard, TinderCardHandle } from "./FrameTinderCard";

export type { TinderCardHandle };

interface SwipeCardProps {
  item: JellyfinItem;
  index: number;
  onSwipe: (id: string, direction: "left" | "right") => void;
  onCardLeftScreen: (id: string) => void;
}

export const SwipeCard = forwardRef<TinderCardHandle, SwipeCardProps>(
  function SwipeCard({ item, index, onSwipe, onCardLeftScreen }, ref) {
    const isFront = index === 0;

    return (
      // 1. Outer Container: Positions the slot in the center of the deck
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 100 - index }}
      >
        {/* 2. Motion Component: Needs to be absolute to stack perfectly */}
        <FramerTinderCard
          ref={ref}
          preventSwipe={["up", "down"]}
          swipeThreshold={100}
          onSwipe={(dir) => {
            // Filter out 'up'/'down' before calling parent
            if (dir === "left" || dir === "right") {
              onSwipe(item.Id, dir);
            }
          }}
          onCardLeftScreen={() => onCardLeftScreen(item.Id)}
          // 3. Important: absolute positioning + width constraint
         className={`absolute w-full max-w-sm h-[65vh] ${isFront ? "cursor-grab pointer-events-auto" : ""}`}
        >
          {/* 4. Scale Wrapper: Handles the background card "stack" effect */}
          <div
            className={`w-full h-full transition-transform duration-300 ${isFront ? "scale-100" : "scale-95"
              }`}
          >
            <Card className="relative h-full w-full overflow-hidden rounded-3xl border-0 shadow-2xl select-none">
              <div className="absolute inset-0 bg-neutral-900 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/jellyfin/image/${item.Id}`}
                  alt={item.Name}
                  className="h-full w-full object-cover"
                  draggable={false} // Native drag must be disabled
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 p-6 text-white w-full select-none pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-md">
                    {item.Name}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.ProductionYear && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      {item.ProductionYear}
                    </Badge>
                  )}
                  {item.CommunityRating && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3" />
                      {item.CommunityRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-3 text-sm text-neutral-300">
                  {item.Overview}
                </p>
              </div>
            </Card>
          </div>
        </FramerTinderCard>
      </div>
    );
  }
);