const logger = {
  log: (message, level = 'info') => {
    const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
    logs.push({ timestamp: new Date().toISOString(), level, message });
    localStorage.setItem('appLogs', JSON.stringify(logs));
  },
  error: (message) => logger.log(message, 'error'),
  warn: (message) => logger.log(message, 'warn'),
  info: (message) => logger.log(message, 'info'),
};

export default logger;