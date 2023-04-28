import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type ScrollUpButtonProps = {
  accent?: string;
};

export const ScrollUpButton = ({ accent }: ScrollUpButtonProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);
  }, []);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setIsVisible(true);
    } else if (scrolled <= 300) {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="w-12 h-12 fixed bottom-14 right-1 lg:bottom-6 lg:right-6 border border-accent-alpha-60 hover:border-accent rounded-xl backdrop-blur-md bg-secondary-dark-30  hover:bg-secondary-dark-60 shadow-sm shadow-black cursor-pointer flex justify-center items-center transition z-40"
            onClick={scrollToTop}
            onKeyDown={scrollToTop}
            role="button"
            tabIndex={0}
            initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10}}
            viewport={{ once: false }}
						transition={{ duration: 0.5 }}
          >
            <div className="tooltip tooltip-left tooltip-accent" data-tip="Scroll to top">
              <Icon
                icon="mdi:weather-sunset-up"
                color={`var(--${accent ?? 'projectAccent'})`}
                width="35px"
                height="35px"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
