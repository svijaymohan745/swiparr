"use client";

import { BookOpenText, Code, Info, Loader2, AlertCircle, CircleCheck, ExternalLink, FileText, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsSection } from "./SettingsSection";

interface AboutSettingsProps {
    onShowUserGuide: () => void;
}

export function AboutSettings({ onShowUserGuide }: AboutSettingsProps) {
    return (
        <SettingsSection title="About">
            <div className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full justify-between font-normal h-12 px-3 py-7"
                    onClick={onShowUserGuide}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <BookOpenText className="size-4" />
                        </div>
                        <span>User guide</span>
                    </div>
                    <FileText className="size-4 text-muted-foreground" />
                </Button>
            </div>
        </SettingsSection>
    );
}
