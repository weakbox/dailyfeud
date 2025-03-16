export const answerContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.25,
      delay: 0.5,
      when: "beforeChildren",
    },
  },
};

export const answerVariants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
};

export const strikeVariants = {
  rest: { x: 0 },
  shake: {
    x: [-5, 5, -2, 2, 0],
    transition: { type: "keyframes", duration: 0.25 },
  },
};

export const toastVariants = {
  hidden: {
    opacity: 0,
    y: -50,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
  },
};
