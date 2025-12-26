"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Clock, Star, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { JellyfinItem } from "@/types/swiparr";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Props {
  movieId: string | null;
  onClose: () => void;
}

export function MovieDetailView({ movieId, onClose }: Props) {
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: async () => {
      if (!movieId) return null;
      const res = await axios.get<JellyfinItem>(`/api/jellyfin/item/${movieId}`);
      return res.data;
    },
    enabled: !!movieId,
  });

  const ticksToTime = (ticks?: number) => {
    if (!ticks) return "";
    const minutes = Math.floor(ticks / 600000000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const jellyfinUrl = process.env.NEXT_PUBLIC_JELLYFIN_PUBLIC_URL;

  return (
    <Dialog open={!!movieId} onOpenChange={(open: any) => !open && onClose()}>
      <DialogTitle />
      <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100 max-w-lg p-0 overflow-y-auto max-h-[90vh] flex flex-col">

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-64 w-full rounded-lg bg-neutral-800" />
            <Skeleton className="h-8 w-3/4 bg-neutral-800" />
            <Skeleton className="h-20 w-full bg-neutral-800" />
          </div>
        ) : movie ? (
          <>
            {/* HERO IMAGE */}
            <div className="relative w-full h-64 bg-neutral-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/jellyfin/image/${movie.Id}`}
                className="w-full h-full object-cover opacity-60"
                alt="Backdrop"
              />
              <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
                {/* Poster Thumb */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/jellyfin/image/${movie.Id}`}
                  className="w-24 h-36 rounded-lg shadow-xl shadow-black border border-neutral-700 object-cover"
                  alt="Poster"
                />
                <div className="flex-1 mb-1">
                  <h2 className="text-xl font-bold leading-tight shadow-black drop-shadow-md text-white mb-1">
                    {movie.Name}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
                    {movie.ProductionYear && <Badge variant="secondary" className="bg-neutral-800">{movie.ProductionYear}</Badge>}
                    {movie.OfficialRating && <Badge variant="outline" className="border-neutral-600">{movie.OfficialRating}</Badge>}
                    {movie.RunTimeTicks && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ticksToTime(movie.RunTimeTicks)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 pt-2">

              {/* ACTIONS */}
              <div className="flex gap-2 mb-6">
                <Link href={`${jellyfinUrl}/web/index.html#/details?id=${movie.Id}&context=home`} target="_blank" onClick={e => e.stopPropagation()}>
                  <Button className="flex-1 bg-primary hover:bg-primary/90">
                    <Play className="w-4 h-4 mr-2" /> Play
                  </Button>
                </Link>
                {movie.CommunityRating && (
                  <div className="flex flex-col items-center justify-center px-4 bg-neutral-900 rounded border border-neutral-800">
                    <span className="flex items-center text-white font-bold">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      {movie.CommunityRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* GENRES */}
              {movie.Genres && movie.Genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.Genres.map(g => (
                    <span key={g} className="text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-full border border-neutral-800">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* OVERVIEW */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-neutral-500 uppercase mb-2">Synopsis</h3>
                <p className="text-neutral-200 text-sm leading-relaxed">
                  {movie.Overview || "No overview available."}
                </p>
              </div>

              {/* CAST */}
              {movie.People && movie.People.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Cast
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {movie.People.slice(0, 6).map(person => (
                      <div key={person.Id} className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded border border-neutral-800/50">
                        <div className="text-xs">
                          <div className="font-bold text-neutral-200">{person.Name}</div>
                          <div className="text-neutral-500">{person.Role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}