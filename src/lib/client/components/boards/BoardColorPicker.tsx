import {Input} from "~/lib/client/components/ui/input";


export const DEFAULT_BOARD_COLOR = "#4f46e5";

const BOARD_COLORS = [
    "#4f46e5", "#2563eb", "#0284c7", "#0891b2", "#0f766e", "#059669",
    "#16a34a", "#65a30d", "#ca8a04", "#d97706", "#ea580c", "#dc2626",
    "#e11d48", "#db2777", "#c026d3", "#9333ea", "#7c3aed", "#475569",
];


interface BoardColorPickerProps {
    id: string;
    value: string;
    disabled: boolean;
    onChange: (color: string) => void;
}


export function BoardColorPicker({ id, value, disabled, onChange }: BoardColorPickerProps) {
    return (
        <div className="flex items-center gap-2">
            <Input
                type="color"
                value={value}
                id={id}
                className="h-8 w-12 shrink-0 cursor-pointer p-1"
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {BOARD_COLORS.map((boardColor) =>
                    <button
                        type="button"
                        key={boardColor}
                        aria-label={`Use ${boardColor}`}
                        aria-pressed={value === boardColor}
                        disabled={disabled}
                        onClick={() => onChange(boardColor)}
                        style={{ backgroundColor: boardColor }}
                        className="size-6 rounded-md ring-1 ring-black/20 transition-[transform,box-shadow] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-pressed:ring-2 aria-pressed:ring-foreground"
                    />
                )}
            </div>
        </div>
    );
}
