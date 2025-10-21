import {flushSync} from "react-dom";
import React, {useRef} from "react";
import {Button} from "~/lib/client/components/ui/button";


interface EditableTextProps {
    value: string;
    fieldName: string;
    inputClass?: string;
    buttonClass?: string;
    onChange: (value: string) => void;
    editState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}


export function EditableText({ fieldName, value, inputClass, buttonClass, onChange, editState }: EditableTextProps) {
    const [textEdit, setTextEdit] = editState;
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const onSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        console.log({ onSubmitHandler: inputRef.current!.value });
        onChange(inputRef.current!.value);
        flushSync(() => setTextEdit(false));
        buttonRef.current?.focus();
    }

    const onKeyDownHandler = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === "Escape") {
            flushSync(() => setTextEdit(false));
            buttonRef.current?.focus();
        }
    }

    const onBlurHandler = () => {
        if (inputRef.current?.value !== value && inputRef.current?.value.trim() !== "") {
            onChange(inputRef.current!.value);
        }
        setTextEdit(false);
    }

    const onButtonClickHandler = () => {
        flushSync(() => setTextEdit(true));
        inputRef.current?.select();
    }

    if (textEdit) {
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
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
            }}
        >
            {value}
        </Button>
    );
}
