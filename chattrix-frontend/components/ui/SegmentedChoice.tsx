"use client"
import { useId, useRef, type ReactElement } from "react";

type SegmentedChoiceOption<T extends string> = {
    value: T;
    /** Kept available to assistive technology even when the pill shows only a mark. */
    label: string;
    content: ReactElement;
};

type SegmentedChoiceProps<T extends string> = {
    /** Radio group name, and the prefix of each option's id. */
    name: string;
    legend: string;
    options: SegmentedChoiceOption<T>[];
    value: T;
    /** `origin` is the last pointer position, for the theme reveal; absent for keyboard changes. */
    onChange: (value: T, origin?: { x: number; y: number }) => void;
    /** Pill styling, including its `peer-checked:` selected state. */
    optionClassName: string;
};

/**
 * Native radios in a fieldset, drawn as a segmented control (from Nexus). A radio group is
 * arrow-key operable and announces name, position and state with no ARIA to maintain.
 *
 * Each input/label pair gets its own `contents` wrapper: `peer-checked` is a general-sibling
 * selector, so without it one checked input would style every later label too.
 */
export default function SegmentedChoice<T extends string>({
    name,
    legend,
    options,
    value,
    onChange,
    optionClassName,
}: SegmentedChoiceProps<T>) {
    const pointer = useRef<{ x: number; y: number } | undefined>(undefined);
    // Unique per instance: the header and the profile page can both render one, and radios that
    // share a `name` form one group, so only one of the two could ever show as checked.
    const group = `${name}-${useId()}`;

    return (
        <fieldset onPointerDown={(e) => { pointer.current = { x: e.clientX, y: e.clientY }; }}>
            <legend className="sr-only">{legend}</legend>

            <div className="flex items-center gap-0.5 rounded-control border border-hairline bg-surface p-0.5 shadow-raise">
                {options.map((option) => (
                    <span key={option.value} className="contents">
                        <input
                            id={`${group}-${option.value}`}
                            type="radio"
                            name={group}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => {
                                onChange(option.value, pointer.current);
                                pointer.current = undefined;
                            }}
                            className="peer sr-only"
                        />

                        <label htmlFor={`${group}-${option.value}`} className={optionClassName}>
                            {option.content}
                            <span className="sr-only">{option.label}</span>
                        </label>
                    </span>
                ))}
            </div>
        </fieldset>
    );
}
