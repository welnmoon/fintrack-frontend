import { motion } from "motion/react";
import * as React from "react";

export type ColourfulTextProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  text: string;
  interval?: number;
  colors?: string[];
  animationDuration?: number;
  staggerDelay?: number;
};

const defaultColors = [
  "rgb(15, 23, 42)", // slate-900
  "rgb(30, 64, 175)", // blue-800
  "rgb(30, 58, 138)", // blue-900
  "rgb(22, 101, 52)", // green-800
  "rgb(20, 83, 45)", // green-900
  "rgb(71, 85, 105)", // slate-600
];

const ColourfulText = React.forwardRef<HTMLSpanElement, ColourfulTextProps>(
  (
    {
      text,
      interval = 4500,
      colors = defaultColors,
      animationDuration = 0.45,
      staggerDelay = 0.035,
      ...props
    },
    ref,
  ) => {
    const [currentColors, setCurrentColors] = React.useState(colors);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      const intervalId = setInterval(() => {
        const shuffled = [...colors].sort(() => Math.random() - 0.5);
        setCurrentColors(shuffled);
        setCount((prev) => prev + 1);
      }, interval);

      return () => clearInterval(intervalId);
    }, [colors, interval]);

    const characters = React.useMemo(() => text.split(""), [text]);

    return (
      <span ref={ref} data-slot="colourful-text" {...props}>
        {characters.map((char, index) => (
          <motion.span
            key={`${char}-${count}-${index}`}
            className="inline-block whitespace-pre tracking-tight"
            initial={{ y: 0 }}
            animate={{
              color: currentColors[index % currentColors.length],
              y: [0, -1, 0],
              opacity: [1, 0.92, 1],
            }}
            transition={{
              duration: animationDuration,
              delay: index * staggerDelay,
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    );
  },
);

ColourfulText.displayName = "ColourfulText";

export default ColourfulText;
