"use client"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
    delay?: number;
    className?: string;
    children: ReactNode;
};

/** Blur-rises its children the first time they scroll into view. Motion lives in globals.css. */
export default function Reveal({ delay = 0, className = "", children }: RevealProps) {
    const element = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const node = element.current;

        if (!node || typeof IntersectionObserver === "undefined") {
            setShown(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "0px 0px -10% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={element}
            data-reveal={shown ? "shown" : "hidden"}
            style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
            className={className}
        >
            {children}
        </div>
    );
}
