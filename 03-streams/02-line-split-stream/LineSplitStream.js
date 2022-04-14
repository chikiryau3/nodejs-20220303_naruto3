const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.encoding = options.encoding;
    this.str = '';
  }

  _transform(chunk, encoding, callback) {
    for (const char of chunk.toString(this.encoding)) {
      if (char === os.EOL) {
        this.push(this.str);
        this.str = '';
      } else {
        this.str += char;
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.str.length > 0) this.push(this.str);
    callback();
  }
}

module.exports = LineSplitStream;
