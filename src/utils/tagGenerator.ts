export const generateTagCode = (): string => {
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LIB-${number}`;
};
