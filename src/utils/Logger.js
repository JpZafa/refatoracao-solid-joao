class Logger {
  constructor(output = console) { this.output = output; }
  info(message) {
    this.output.log(`[INFO] ${message}`);
  }

  warn(message) {
    this.output.log(`[WARN] ${message}`);
  }

  error(message) {
    this.output.log(`[ERROR] ${message}`);
  }
}

module.exports = Logger;
