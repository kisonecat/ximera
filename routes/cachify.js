const Redis = require("ioredis");
var config = require('../config');

// create a new redis client and connect to our local redis instance
var client = new Redis({ host: config.redis.url, port: config.redis.port});

// if an error occurs, print it to the console
client.on('error', function (err) {
    console.log("Error " + err);
});

exports.json = function( key, f, callback ) {
    client.getBuffer(key, function(err, result) {
	if (err) {
	    callback(err);
	} else {
	    if (result) {
		callback( null, JSON.parse(result) );
	    } else {
		f( function(err, result) {
		    if (err) {
			callback( err );
		    } else {
			client.setBuffer( key, JSON.stringify(result), "ex", 31557600  );
			callback( null, result );
		    }
		});
	    }
	}
    });
};

exports.string = function( key, f, callback ) {
    client.getBuffer(key, function(err, result) {
	if (err) {
	    callback(err);
	} else {
	    if (result) {
		callback( null, result );
	    } else {
		f( function(err, result) {
		    if (err) {
			callback( err );
		    } else {
			client.setBuffer( key, result, "ex", 31557600 );
			callback( null, result );
		    }
		});
	    }
	}
    });
};
