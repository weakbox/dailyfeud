export const gameVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export const answerVariants = {
  container: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delay: 0.5,
        when: "beforeChildren",
      },
    },
  },
  content: {
    hidden: {
      y: -10,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  },
};

// Make this shake animation better, it looks cheap right now.
export const strikeVariants = {
  rest: { x: 0, y: 0, },
  shake: {
    x: [-5, 5, -2, 2, 0],
    y: [-1, 1, 0],
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

export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  modal: {
    hidden: { y: -20 },
    visible: { y: 0 },
    exit: { y: -50, transition: { type: "tween", ease: "easeIn" } },
  },
};
