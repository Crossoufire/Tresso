import {flushSync} from "react-dom";
import {Button} from "~/lib/client/components/ui/button";
import React, {useRef, useState} from "react";


interface EditableTextProps {
    value: string;
    fieldName: string;
    inputClass?: string;
    buttonClass?: string;
    onChange: (value: string) => void;
    editState?: [boolean, (value: boolean) => void];
}


export function EditableText({ fieldName, value, inputClass, buttonClass, onChange, editState }: EditableTextProps) {
    const localEditState = useState(false);
    const [edit, setEdit] = editState || localEditState;
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const onSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        onChange(inputRef.current!.value);
        flushSync(() => setEdit(false));
        buttonRef.current?.focus();
    }

    const onKeyDownHandler = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === "Escape") {
            flushSync(() => setEdit(false));
            buttonRef.current?.focus();
        }
    }

    const onBlurHandler = () => {
        if (inputRef.current?.value !== value && inputRef.current?.value.trim() !== "") {
            onChange(inputRef.current!.value);
        }
        setEdit(false);
    }

    const onButtonClickHandler = () => {
        flushSync(() => setEdit(true));
        inputRef.current?.select();
    }

    if (edit) {
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
        <Button ref={buttonRef} variant="ghost" className={buttonClass} onClick={onButtonClickHandler}>
            {value}
        </Button>
    );
}
