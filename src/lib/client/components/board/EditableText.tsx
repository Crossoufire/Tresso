import {flushSync} from "react-dom";
import React, {useRef} from "react";
import {Button} from "~/lib/client/components/ui/button";


interface EditableTextProps {
    value: string;
    fieldName: string;
    inputClass?: string;
    multiline?: boolean;
    buttonClass?: string;
    onChange: (value: string) => void;
    editState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}


export function EditableText({ fieldName, value, inputClass, buttonClass, multiline = false, onChange, editState }: EditableTextProps) {
    const [textEdit, setTextEdit] = editState;
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const getCurrentValue = () => {
        return multiline ? textAreaRef.current!.value : inputRef.current!.value;
    }

    const onSubmitHandler = (ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        onChange(getCurrentValue());
        flushSync(() => setTextEdit(false));
        buttonRef.current?.focus();
    }

    const onKeyDownHandler = (ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (ev.key === "Escape") {
            flushSync(() => setTextEdit(false));
            buttonRef.current?.focus();
        }

        if (multiline && ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) {
            ev.currentTarget.form?.requestSubmit();
        }
    }

    const onBlurHandler = () => {
        const currentValue = getCurrentValue();
        if (currentValue !== value && currentValue.trim() !== "") {
            onChange(currentValue);
        }
        setTextEdit(false);
    }

    const onButtonClickHandler = () => {
        flushSync(() => setTextEdit(true));
        if (multiline) {
            textAreaRef.current?.select();
            return;
        }
        inputRef.current?.select();
    }

    if (textEdit) {
        if (multiline) {
            return (
                <form onSubmit={onSubmitHandler}>
                    <textarea
                        required={true}
                        name={fieldName}
                        ref={textAreaRef}
                        defaultValue={value}
                        className={inputClass}
                        onBlur={onBlurHandler}
                        onKeyDown={onKeyDownHandler}
                    />
                </form>
            );
        }

        return (
            <form onSubmit={onSubmitHandler}>
                <input
                    type="text"
                    ref={inputRef}
                    required={true}
                    name={fieldName}
                    defaultValue={value}
                    className={inputClass}
                    onBlur={onBlurHandler}
                    onKeyDown={onKeyDownHandler}
                />
            </form>
        );
    }

    return (
        <Button
            ref={buttonRef}
            variant="ghost"
            className={buttonClass}
            onClick={onButtonClickHandler}
            style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: multiline ? "pre-wrap" : "normal",
            }}
        >
            {value}
        </Button>
    );
}
