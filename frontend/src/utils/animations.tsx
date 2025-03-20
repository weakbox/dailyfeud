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
        staggerChildren: 0.35,
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
  rest: { x: 0, y: 0 },
  shake: {
    x: [-5, 5, -2, 2, 0],
    y: [-1, 1, 0],
    transition: { type: "keyframes", duration: 0.25 },
  },
};

export const toastVariants = {
  hidden: {
    opacity: 0,
    y: 15,
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
    transition: { delay: 1 },
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren" },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        delay: 0.2,
      },
    },
  },
  modal: {
    transition: { delay: 1 },
    hidden: {
      opacity: 0,
      y: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 },
    },
    exit: { opacity: 0 },
  },
};

export const archiveVariants = {
  container: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  },
};
