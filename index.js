"use strict";
const { join } = require("path");
const through = require("through2");
const PutFile = require("./lib/putFile");

module.exports = function gulpPutFile(options) {
  options || (options = {});
  options.host = options.host || "localhost";
  options.username = options.username || "admin";
  options.dest = options.dest || "/home/" + options.username;

  const putFile = new PutFile();

  putFile.connect(options);

  return through.obj(
    function transform(file, enc, callback) {
      if (file.isStream()) {
        return callback(new Error("Streaming not supported."));
      }

      if (file.stat.isDirectory()) {
        return callback();
      }

      const path = fixWinPath(join(options.dest, file.relative));

      putFile.mkdir(path).then(
        () => {
          putFile.putStream(file.contents, path).then(
            () => {
              callback();
            },
            () => {
              callback(new Error("write file：" + path));
            }
          );
        },
        () => {
          callback(new Error("mkdir fail：" + path));
        }
      );
    },
    function flush(callback) {
      putFile.close();
      callback();
    }
  );
};

function fixWinPath(str) {
  return str.replace(/\\/g, "/");
}
