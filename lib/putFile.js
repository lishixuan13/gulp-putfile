const { dirname } = require("path");
const { Client } = require("ssh2");

class PutFile {
  constructor() {
    this.sftp = new Promise((resolve, reject) => {
      this.sftpResolve = resolve;
      this.sftpReject = reject;
    });
  }
  connect(options) {
    const conn = new Client();
    this.conn = conn
      .on("ready", () => {
        conn.sftp((err, sftp) => {
          if (err) {
            this.sftpReject(err);
            throw err;
          }
          this.sftpResolve(sftp);
        });
      })
      .connect(options);
  }

  close() {
    this.conn.end();
  }

  mkdir(remotePath) {
    return new Promise((resolve, reject) => {
      this.sftp.then((sftp) => {
        const dir = dirname(remotePath);
        sftp.stat(dir, (err) => {
          if (err) {
            sftp.mkdir(dir, (err) => {
              if (err) {
                console.log("mkdir err: ", err);
                return reject(err);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });
      }, reject);
    });
  }

  putStream(input, remotePath, options) {
    return new Promise((resolve, reject) => {
      this.sftp.then((sftp) => {
        const stream = sftp.createWriteStream(remotePath, options);

        stream.on("error", (err) => {
          return reject(
            new Error(
              `Failed to upload data stream to ${remotePath}: ${err.message}`
            )
          );
        });

        stream.on("finish", () => {
          return resolve(`Uploaded data stream to ${remotePath}`);
        });
        if (input instanceof Buffer) {
          stream.end(input);
          return false;
        }
        input.pipe(stream);
      });
    });
  }
}

module.exports = PutFile;
