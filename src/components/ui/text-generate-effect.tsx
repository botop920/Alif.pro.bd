"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
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
          y: 0,
        },
        {
          duration: duration ? duration : 0.8,
          delay: stagger(0.04), // Faster stagger for smoother "flow"
          ease: [0.16, 1, 0.3, 1], // "easeOutExpo" - very smooth
        }
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="flex flex-wrap gap-x-[0.25em]">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn("opacity-0 translate-y-1", filter ? "blur(8px)" : "none")} // Reduced blur and translation
              style={{
                display: "inline-block",
                willChange: "transform, opacity, filter",
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
    <div className={cn("font-sans", className)}>
      <div className="mt-4">
        <div className="leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
