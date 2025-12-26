"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Play, Plus, UserPlus2, Copy, Share2, Check, UserPlus } from "lucide-react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { MovieListItem } from "../movie/MovieListItem";
import { cn } from "@/lib/utils";

export function SessionManager() {
    const [inputCode, setInputCode] = useState("");
    const [isOpen, setIsOpen] = useState(false); // Control sheet open state
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();

    // -- 1. CHECK CURRENT STATUS --
    const { data: sessionStatus, isSuccess } = useQuery({
        queryKey: ["sessionStatus"],
        queryFn: async () => {
            const res = await axios.get<{ code: string | null }>("/api/session");
            return res.data;
        }
    });

    const activeCode = sessionStatus?.code;

    // -- 2. HANDLE MATCHES --
    const { data: matches } = useQuery({
        queryKey: ["matches"],
        queryFn: async () => {
            const res = await axios.get("/api/session/matches");
            return res.data;
        },
        // Only poll if we are actually in a session
        enabled: !!activeCode,
        refetchInterval: 5000
    });

    // -- 3. MUTATIONS --
    const createSession = useMutation({
        mutationFn: async () => axios.post("/api/session", { action: "create" }),
        onSuccess: (res) => {
            queryClient.setQueryData(["sessionStatus"], { code: res.data.code });
            toast("Session created", { description: "Waiting for friends..." });
        }
    });

    const joinSession = useMutation({
        mutationFn: async (codeToJoin: string) => axios.post("/api/session", { action: "join", code: codeToJoin }),
        onSuccess: (res, variables) => {
            queryClient.setQueryData(["sessionStatus"], { code: variables }); // Optimistic update
            queryClient.invalidateQueries({ queryKey: ["deck"] });
            toast.success("Connected!", { description: `You are in session ${variables}` });

            // Remove query param from URL so refresh doesn't trigger again
            router.replace("/");
        },
        onError: () => {
            toast.error("Invalid Code", { description: "Could not find that session." });
        }
    });

    const leaveSession = useMutation({
        mutationFn: async () => axios.delete("/api/session"),
        onSuccess: () => {
            queryClient.setQueryData(["sessionStatus"], { code: null });
            queryClient.setQueryData(["matches"], []);
            toast("Left session");
        }
    });

    // -- 4. AUTO-JOIN LOGIC --
    useEffect(() => {
        const joinParam = searchParams.get("join");
        // If we have a param, we aren't in a session yet, and session check loaded
        if (joinParam && isSuccess && !activeCode) {
            setIsOpen(true); // Open the sheet so they see what's happening
            joinSession.mutate(joinParam);
        }
    }, [searchParams, isSuccess, activeCode]);


    // -- 5. SHARE LOGIC --
    const handleShare = async () => {
        if (!activeCode) return;

        // Construct the URL: https://swiparr.com/?join=ABCD
        const shareUrl = `${window.location.origin}/?join=${activeCode}`;

        const shareData = {
            title: 'Join my Swiparr Session',
            text: `Let's pick a movie! Join code: ${activeCode}`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Opened share menu");
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="z-1">
                <Button variant="ghost" size="icon" className={cn(activeCode ? "text-neutral-400" : "text-neutral-300", "ml-4")}>
                    <Users className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-neutral-900 z-101 border-neutral-800 text-neutral-100 sm:max-w-md w-full px-4">
                <SheetHeader>
                    <SheetTitle className="text-neutral-100 mb-4 flex items-center gap-2">
                        {activeCode ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-500"></span>
                                </span>
                                Session
                            </>
                        ) : "Session"}
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6 px-1 mt-4">

                    {/* --- UNIFIED CONTAINER --- */}
                    <div className="w-full p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 flex flex-col min-h-40 justify-between">

                        {/* --- TOP SECTION (Labels) --- */}
                        <div className="h-6 flex items-center justify-center mb-2">
                            {!activeCode ? (
                                <span className="text-sm text-neutral-400">Enter code or create session</span>
                            ) : (
                                <span className="text-xs uppercase tracking-widest text-neutral-400">Session Active</span>
                            )}
                        </div>

                        {/* --- MIDDLE SECTION (Input vs Display) --- */}
                        {/* We set a fixed height here (e.g., h-12) so the buttons below never move */}
                        <div className="flex items-center justify-center mb-4 h-12">
                            {!activeCode ? (
                                <Input
                                    placeholder="Code"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                    className="bg-neutral-950 border-neutral-700 font-mono tracking-widest text-center uppercase h-10 w-full"
                                    maxLength={4}
                                />
                            ) : (
                                <div className="text-4xl font-black font-mono tracking-[0.2em] text-neutral-100">
                                    {activeCode}
                                </div>
                            )}
                        </div>

                        {/* --- BOTTOM SECTION (Buttons) --- */}
                        <div className="flex gap-3">
                            {!activeCode ? (
                                <>
                                    <Button
                                        onClick={() => joinSession.mutate(inputCode)}
                                        className="flex-1 h-10 bg-neutral-100 text-neutral-900 hover:bg-white"
                                        disabled={inputCode.length !== 4}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Join
                                    </Button>
                                    <Button
                                        onClick={() => createSession.mutate()}
                                        variant="outline"
                                        className="flex-1 h-10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleShare}
                                        className="flex-1 h-10"
                                        variant="default"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button
                                        onClick={() => leaveSession.mutate()}
                                        variant="outline"
                                        className="flex-1 h-10"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Leave
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* MATCHES LIST */}
                    <div className="mt-4">
                        <h3 className="font-bold mb-3 flex items-center justify-between text-neutral-400 uppercase tracking-wider text-xs">
                            Matches Found
                            {matches?.length > 0 && <Badge className="bg-neutral-600 hover:bg-neutral-700">{matches.length}</Badge>}
                        </h3>

                        <ScrollArea className="h-[45vh] pr-4 -mr-4">
                            {!activeCode ? (
                                <div className="text-center text-neutral-600 text-sm py-8">
                                    Join a session to find matches.
                                </div>
                            ) : (
                                <>
                                    {matches?.map((movie: any) => (
                                        <MovieListItem
                                            key={movie.Id}
                                            movie={{ ...movie, isMatch: true }} // Matches are always matches here
                                            onClick={() => setSelectedId(movie.Id)}
                                        />
                                    ))}
                                    {matches?.length === 0 && (
                                        <div className="text-center text-neutral-600 text-sm py-8">
                                            No matches found yet.
                                        </div>
                                    )}
                                </>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}