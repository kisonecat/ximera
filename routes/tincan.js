var mdb = require("../mdb");
var winston = require("winston");
var snappy = require("snappy");
var path = require("path");
var async = require("async");
var fs = require("fs");
var buffer24 = require("buffer24");
var uint32 = require("uint32");
var crc32 = require("fast-crc32c");
var config = require("../config");
var request = require("request");
var uuid = require("node-uuid");

var lrsRoot = config.repositories.root;

var ximera_root = config.root;

var kuleuven_url = "https://kuleuven.be";

var logFiles = {};
function logFile(name, callback) {
  var filename = path.join(lrsRoot, name + ".git", "learning-record-store");

  if (logFiles[filename]) {
    callback(null, logFiles[filename]);
  } else {
    // BADBAD: this SHOULD be O_DIRECT to ensure atomicity
    fs.open(
      filename,
      fs.constants.O_WRONLY | fs.constants.O_APPEND,
      function (err, fd) {
        if (err) {
          // File doesn't exist, so create it
          fs.open(
            filename,
            fs.constants.O_CREAT |
              fs.constants.O_WRONLY |
              fs.constants.O_APPEND,
            function (err, fd) {
              if (err) {
                callback(err);
              } else {
                // And include the initial chunk that says sNaPpY
                var firstChunk = Buffer.from([
                  0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x59,
                ]);
                fs.write(fd, firstChunk, 0, firstChunk.length, function (err) {
                  if (err) {
                    callback(err);
                  } else {
                    logFiles[filename] = fd;
                    callback(null, fd);
                  }
                });
              }
            }
          );
        } else {
          logFiles[filename] = fd;
          callback(null, fd);
        }
      }
    );
  }
}

function recordStatement(repository, statement, callback) {
  var xapi_url = process.env.XAPI_URL;
  var xapi_username = process.env.XAPI_USERNAME;
  var xapi_password = process.env.XAPI_PASSWORD;
  if (xapi_url && xapi_username && xapi_password) {
    request.post(
      {
        uri: xapi_url + "/xapi/statements",
        body: JSON.stringify(statement),
        auth: {
          user: xapi_username,
          pass: xapi_password,
        },
        headers: {
          "Content-Type": "application/json",
          "X-Experience-API-Version": "1.0.3",
        },
      },
      function (err, response, body) {
        if (err) {
          console.log("Error when posting to xapi server:");
          console.log(err); // TODO?
          callback(err);
        } else {
          if (response.statusCode !== 200) {
            console.log("XAPI Failed??");
            console.log(body);
            callback("Failed with status" + response.statusCode.toString());
          }
        }
      }
    );
  } else {
    recordStatementLocally(repository, statement, callback);
  }
}

function recordStatementLocally(repository, statement, callback) {
  statement.stored = new Date();
  var stringified = JSON.stringify(statement);

  async.parallel(
    [
      function (callback) {
        snappy.compress(stringified, callback);
      },
      function (callback) {
        logFile(repository, callback);
      },
    ],
    function (err, results) {
      if (err) {
        callback(err);
      } else {
        // https://github.com/google/snappy/blob/master/framing_format.txt

        var fd = results[1];
        var buffer = results[0];

        var chunkType = Buffer.from([0x00]);
        // three-byte little-endian length of the chunk in bytes
        var length = Buffer.alloc(3);
        length.writeUInt24LE(buffer.length + 4, 0);

        var checksum = crc32.calculate(stringified, 0);
        var maskedChecksum = uint32.addMod32(
          uint32.rotateRight(checksum, 15),
          0xa282ead8
        );
        var checksumBuffer = Buffer.alloc(4);
        checksumBuffer.writeUInt32LE(maskedChecksum, 0);
        var block = Buffer.concat([chunkType, length, checksumBuffer, buffer]);

        // I'm usually not waiting for the callback before writing
        // more, but I don't care -- these can be appended to the
        // log in ANY order
        fs.write(fd, block, 0, block.length, callback);
      }
    }
  );
}

exports.get = function (req, res) {
  var filename = path.join(
    lrsRoot,
    req.params.repository + ".git",
    "learning-record-store"
  );

  var stream = fs.createReadStream(filename);
  fs.stat(filename, function (err, stat) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.sendSeekable(stream, {
        length: stat.size,
        type: "application/x-snappy-framed",
      });
    }
  });
};

exports.postStatements = function (req, res) {
  if (!req.user) {
    res.status(500).send("");
  } else {
    req.body.forEach(function (data) {
      var statement = {
        id: uuid.v4(),
      };

      if (!req.user.ltiUserId) {
        statement.actor = {
          objectType: "Agent",
          name: req.user.name,
          account: { homePage: ximera_root, name: req.user._id },
        };
      } else {
        // LTI login and data
        statement.actor = {
          objectType: "Agent",
          name: req.user.name,
          account: { homePage: kuleuven_url, name: req.user.ltiUserId },
        };
      }

      statement.verb = data.verb;

      statement.object = data.object;

      if ("result" in data) statement.result = data.result;

      if ("context" in data) statement.context = data.context;

      if ("timestamp" in data) statement.timestamp = data.timestamp;

      // Mongo forbids dots and dollar signs in key names, so we
      // replace them with full width unicode replacements But
      // good news!  Our new backend doesn't have this
      // restriction.
      //
      // escapeKeys( statement );

      var repository = req.params.repository;

      recordStatement(repository, statement, function (err) {
        if (err) {
          // I just ignore whether they are successful or
          // not, in the sense that I don't tell the caller
        }
      });
    });
    res.status(200).json({ ok: true });
  }
};
