"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  highlightWords = [],
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  highlightWords?: string[];
}) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { margin: "-100px" });
  let wordsArray = words.split(" ");

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.2),
        }
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="flex flex-wrap gap-[0.35em]">
        {wordsArray.map((word, idx) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
          const isHighlight = highlightWords.some((hw) =>
            cleanWord.includes(hw.toLowerCase())
          );

          return (
            <motion.span
              key={word + idx}
              className={cn(
                "opacity-0 inline-block",
                isHighlight
                  ? "bg-brandRed text-white px-2 py-0.5 rounded-md"
                  : "dark:text-white text-white"
              )}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-serif tracking-tight", className)}>
      <div className="mt-4">
        <div className="leading-snug">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
