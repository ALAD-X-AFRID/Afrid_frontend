"use client";

import { useState, useRef, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&/01010";

export default function TextScramble({
  text,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: React.ElementType;
}) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);

  const scramble = useCallback(() => {
    let iteration = 0;
    const totalIterations = text.length * 3;
    cancelAnimationFrame(rafRef.current);

    const tick = () => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration / 3) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iteration += 1;
      if (iteration <= totalIterations) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };
    tick();
  }, [text]);

  return (
    <Tag
      className={className}
      onMouseEnter={scramble}
      data-cursor-hover
    >
      {display}
    </Tag>
  );
}
