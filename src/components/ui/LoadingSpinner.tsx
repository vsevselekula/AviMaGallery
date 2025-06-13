'use client';

import { motion } from 'framer-motion';

const circleSize = 30; // Размер каждого круга
const centerOffset = 20; // Расстояние от центра для кругов

const spinnerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1, // Задержка между анимациями дочерних элементов
      repeat: Infinity, // Бесконечный цикл для контейнера
      duration: 1, // Общая длительность одного цикла анимации
    },
  },
};

const circleAnimation = {
  initial: {
    opacity: 0,
    scale: 0,
    x: 0,
    y: 0,
  },
  animate: (i: number) => ({
    opacity: [0, 1, 0], // Появление и исчезновение
    scale: [0, 1, 0], // Изменение размера
    x: [
      0,
      Math.cos((i * 90 * Math.PI) / 180) * centerOffset,
      Math.cos(((i * 90 + 90) * Math.PI) / 180) * centerOffset, // Движение по кругу
      0,
    ],
    y: [
      0,
      Math.sin((i * 90 * Math.PI) / 180) * centerOffset,
      Math.sin(((i * 90 + 90) * Math.PI) / 180) * centerOffset, // Движение по кругу
      0,
    ],
    transition: {
      duration: 1, // Длительность анимации одного круга
      ease: 'easeInOut', // Плавное изменение
      repeat: Infinity, // Бесконечное повторение
      delay: i * 0.1, // Смещение по времени для каждого круга
    },
  }),
};

export function LoadingSpinner() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: circleSize * 4, height: circleSize * 4 }} // Адаптируем размер контейнера
      variants={spinnerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          custom={i}
          variants={circleAnimation}
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: [
              '#00E074', // Green
              '#00BFFF', // Blue
              '#FF456A', // Red
              '#A072FF', // Purple
            ][i],
          }}
        ></motion.div>
      ))}
    </motion.div>
  );
}
