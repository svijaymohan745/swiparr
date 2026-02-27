import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function WizarrAccessButton({ className, variant, size, children, ...props }: React.ComponentProps<typeof Button>) {
    const [showWizarrDialog, setShowWizarrDialog] = React.useState(false);
    const [wizLoading, setWizLoading] = React.useState(false);
    const [wizSuccess, setWizSuccess] = React.useState<{ url: string } | null>(null);
    const [wizError, setWizError] = React.useState("");

    const handleWizarrSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setWizLoading(true);
        setWizError("");
        try {
            const res = await fetch("/api/wizarr", {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setWizError(data.error || "Failed to generate invitation");
            } else {
                setWizSuccess({ url: data.link });
            }
        } catch (err: any) {
            setWizError(err.message || "An error occurred");
        } finally {
            setWizLoading(false);
        }
    };

    return (
        <>
            <Button
                className={className}
                variant={variant}
                size={size}
                onClick={() => setShowWizarrDialog(true)}
                {...props}
            >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {children || "Get H-TV Access"}
            </Button>

            <Dialog open={showWizarrDialog} onOpenChange={(open: boolean) => {
                setShowWizarrDialog(open);
                if (!open) {
                    setWizSuccess(null);
                    setWizError("");
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{wizSuccess ? "Invitation Generated!" : "Get H-TV Access"}</DialogTitle>
                        <DialogDescription>
                            {wizSuccess
                                ? "Your invitation link has been generated. Click the link below to create your 2-day guest account on the portal."
                                : "Create a temporary guest account to watch movies. This account will expire in 2 days and does not include download privileges."}
                        </DialogDescription>
                    </DialogHeader>

                    {wizSuccess ? (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border bg-muted p-4">
                                <div className="font-semibold mb-2">Your Invite Link</div>
                                <div className="text-sm">
                                    <a href={wizSuccess.url} target="_blank" className="text-primary font-bold hover:underline break-all">
                                        {wizSuccess.url}
                                    </a>
                                </div>
                            </div>
                            <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowWizarrDialog(false)}>Cancel</Button>
                                <a href={wizSuccess.url} target="_blank" rel="noreferrer">
                                    <Button onClick={() => setShowWizarrDialog(false)}>Open Portal</Button>
                                </a>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {wizError && (
                                <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">
                                    {wizError}
                                </div>
                            )}
                            <p className="text-sm text-foreground/80 pb-4">
                                Click the button below to generate a unique invitation link. You will be redirected to the account registration portal.
                            </p>
                            <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowWizarrDialog(false)}>Cancel</Button>
                                <Button onClick={() => handleWizarrSubmit()} disabled={wizLoading}>
                                    {wizLoading ? "Generating..." : "Generate Invite Link"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
