import {Loader2} from "lucide-react";
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(initialLabel.name);
            setColor(initialLabel.color);
        }
    }, [mode, initialLabel]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit({ name, color });
    };

    return (
        <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">
                {mode === "edit" ? "Edit Label" : "Create Label"}
            </h4>
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="label-name" className="text-xs">Name</Label>
                    <Input
                        value={name}
                        maxLength={25}
                        id="label-name"
                        placeholder="Enter label name..."
                        onChange={(ev) => setName(ev.target.value)}
                        onKeyDown={(ev) => ev.key === "Enter" && handleSubmit()}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border-2 border-gray-200 shrink-0" style={{ backgroundColor: color }}/>
                        <div className="mb-1">{" "}|{" "}</div>
                        <div className="grid grid-cols-9 gap-1 flex-1">
                            {LABEL_COLORS.map((c) =>
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{ backgroundColor: c }}
                                    className={`w-4 h-4 rounded border transition-all ${
                                        color === c ? "border-gray-400 scale-110" : "hover:border-gray-300 border-transparent"
                                    }`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1" onClick={onBack}>
                    Back
                </Button>
                <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!name.trim() || isPending}>
                    {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1"/>}
                    {mode === "edit" ? "Update" : "Create"}
                </Button>
            </div>
        </div>
    );
}
