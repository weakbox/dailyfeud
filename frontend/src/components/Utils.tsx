import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { toastVariants } from "../utils/animations";

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between border-b-2 border-black bg-white px-4 py-2 text-black dark:bg-zinc-700 dark:text-white">
      <span className="w-1/3 text-left text-sm font-bold text-gray-500">
        WEAKBOX.COM
      </span>
      <span className="w-1/3 text-center font-black">DAILYFEUD</span>
      <i className="fa-solid fa-circle-info w-1/3 text-right"></i>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="sticky top-full mt-8 flex items-center justify-center border-t-2 border-black bg-white px-4 py-2 text-xs text-black dark:bg-zinc-700 dark:text-white">
      <p className="text-zinc-500">
        I'm looking for a job! Want to reach out?{" "}
        <a className="underline" href="mailto:connor@weakbox.com">
          connor@weakbox.com
        </a>{" "}
        <a href="https://www.linkedin.com/in/weakbox/" target="_blank">
          <i className="fa-brands fa-linkedin"></i>
        </a>{" "}
        <a href="https://github.com/weakbox" target="_blank">
          <i className="fa-brands fa-github"></i>
        </a>
      </p>
    </footer>
  );
}

export const showSuccessToast = (message: string) => {
  toast.dismiss();
  toast.custom((t) => (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-row items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-green-300 px-4 py-2 text-center font-bold text-black dark:bg-green-600 dark:text-white"
        >
          <i className="fa-solid fa-check"></i>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  ));
};

export const showErrorToast = (message: string) => {
  toast.dismiss();
  toast.custom((t) => (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-row items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-red-300 px-4 py-2 text-center font-bold text-black dark:bg-red-500 dark:text-white"
        >
          <i className="fa-solid fa-xmark"></i>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  ));
};
