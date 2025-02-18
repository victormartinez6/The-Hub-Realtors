const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    if (isDev) console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

// Em produção, remover todos os logs exceto erros
if (!isDev) {
  console.debug = () => {};
  console.info = () => {};
}
