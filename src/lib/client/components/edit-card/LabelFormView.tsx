import {Loader2} from "lucide-react";
import {cn} from "~/lib/utils/utils";
import {CardLabel} from "~/lib/types/types";
import React, {useEffect, useState} from "react";
import {Label} from "~/lib/client/components/ui/label";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";


const LABEL_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];


interface LabelFormViewProps {
    onBack: () => void;
    isPending: boolean;
    mode: "create" | "edit";
    initialLabel: CardLabel | null;
    onSubmit: (data: { name: string; color: string }) => void;
}


export function LabelFormView({ mode, initialLabel, onSubmit, onBack, isPending }: LabelFormViewProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(LABEL_COLORS[0]);

    useEffect(() => {
        if (mode === "edit" && initialLabel) {
            setName(initialLabel.name);
            setColor(initialLabel.color);
            return;
        }

        setName("");
        setColor(LABEL_COLORS[0]);
    }, [mode, initialLabel]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), color });
    };

    return (
        <div className="flex flex-col gap-4 p-3">
            <h4 className="text-sm font-medium">
                {mode === "edit" ? "Edit Label" : "Create Label"}
            </h4>
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="label-name" className="text-xs">Name</Label>
                    <Input
                        value={name}
                        maxLength={25}
                        id="label-name"
                        placeholder="e.g. Urgent"
                        onChange={(ev) => setName(ev.target.value)}
                        onKeyDown={(ev) => ev.key === "Enter" && handleSubmit()}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-3">
                        <div className="size-7 shrink-0 rounded-lg ring-1 ring-black/20" style={{ backgroundColor: color }}/>
                        <div className="grid flex-1 grid-cols-9 gap-1">
                            {LABEL_COLORS.map((c) =>
                                <button
                                    key={c}
                                    type="button"
                                    aria-label={`Use ${c}`}
                                    aria-pressed={color === c}
                                    onClick={() => setColor(c)}
                                    style={{ backgroundColor: c }}
                                    className={cn(
                                        "size-4 rounded-sm ring-1 ring-black/20 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        color === c ? "scale-110" : "hover:scale-105",
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 border-t pt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={onBack}>
                    Back
                </Button>
                <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!name.trim() || isPending}>
                    {isPending && <Loader2 data-icon="inline-start" className="animate-spin"/>}
                    {mode === "edit" ? "Update" : "Create"}
                </Button>
            </div>
        </div>
    );
}
