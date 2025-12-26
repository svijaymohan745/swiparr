"use client";
import { CardDeck } from "@/components/deck/CardDeck";
import { SessionManager } from "@/components/session/SessionManager";
import { LikesList } from "@/components/likes/LikesList";
import { Button } from "@/components/ui/button";
import { GalleryHorizontalEnd, Heart, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-950">
      <div className="w-full flex items-top justify-between mb-2 max-w-md px-4 pt-6">
        <SessionManager />
        <Tabs defaultValue="swipe" className="w-full flex flex-col h-full -mx-14">
          <TabsList className="grid mx-auto w-fit h-fit grid-cols-2 mb-4 bg-neutral-900">
            {/* Added 'group' class to the triggers */}
            <TabsTrigger value="swipe" className="h-9 w-13 group">
              <GalleryHorizontalEnd 
                className="text-white fill-none transition-all group-data-[state=active]:fill-white" 
              />
            </TabsTrigger>

            <TabsTrigger value="likes" className="h-9 w-13 group">
              <Heart 
                className="text-white fill-none transition-all group-data-[state=active]:fill-white" 
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swipe" className="w-full mt-0 outline-none">
            <CardDeck />
          </TabsContent>
          <TabsContent value="likes" className=" w-full mt-0 outline-none">
            <LikesList />
          </TabsContent>
        </Tabs>

        <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-600 mr-4">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </main>
  );
}