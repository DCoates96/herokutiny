'use strict';

const config = require('./config');
const SequelizeFactory = require('./SequelizeFactory');
const util = require('util');
const winston = require('winston');

/**
 * Constructor for the Sequelize transport object.
 * @param {Object} options sequelize config options
 * @return {Object} Sequelize
 * @constructor
 */
// eslint-disable-next-line complexity
const SequelizeTransport = function(options = {}) {
	winston.Transport.call(this, options);

	// Winston options
	this.name = 'Sequelize';
	this.level = options.level || 'info';
	this.label = options.label || null;

	// Sequelize options
	this.dialect = options.dialect || 'mysql';
	this.host = options.host || 'localhost';
	// eslint-disable-next-line no-magic-numbers
	this.port = options.port || 3306;
	this.database = options.database || 'log';
	this.username = options.username || null;
	this.password = options.password || null;
	this.logging = options.logging || false;
	this.charset = options.charset || 'utf8mb4';

	this.sequelize = SequelizeFactory.create({
		database: this.database,
		username: this.username,
		password: this.password,
		config: {
			charset: this.charset,
			dialectOptions: {
				charset: this.charset,
			},
			dialect: this.dialect,
			host: this.host,
			port: this.port,
			logging: this.logging,
			pool: {
				max: config.SEQUELIZE.MAX_CONNECTIONS,
				min: config.SEQUELIZE.MIN_CONNECTIONS,
				idle: config.SEQUELIZE.MAX_IDLETIME,
				acquire: config.SEQUELIZE.ACQUIRE_TIMEOUT,
			},
		},
	});

	this.Model = this.sequelize.import('./Models/Log.js');

	return this;
};

//
// Inherit from `winston.Transport`.
//
util.inherits(SequelizeTransport, winston.Transport);

//
// Define a getter so that `winston.transports.Sequelize`
// is available and thus backwards compatible.
//
winston.transports.Sequelize = SequelizeTransport;

/**
 * Core logging method exposed to Winston. Metadata is optional.
 * @param {String} level at which to log the message.
 * @param {String} msg Message to log
 * @param {Object} [meta] Additional metadata to attach
 * @param {Function} callback Continuation to respond to when complete.
 * @return {*} callback
 */
// eslint-disable-next-line max-params
SequelizeTransport.prototype.log = function(level, msg, meta, callback) {
	if (this.silent) {
		return callback(null, true);
	}

	if (typeof meta !== 'object' && meta !== null) {
		meta = {meta: meta};
	}

	//Here we want false|true|null to render as meta
	//This will only happen if it's null, because of the if above it if (meta === true) meta = 'true';
	if (meta === false) meta = 'false';
	if (meta === null) meta = 'null';
	meta = util.inspect(meta);
	let metaString = meta ? JSON.stringify(meta) : null;

	let options = {
		level: level,
		label: this.label,
		message: msg,
		meta: metaString,
	};

	if (this.sequelize) {
		this.Model.create(options)
			.then(log => {
				return callback(null, log);
			})
			.catch(err => {
				return callback(err);
			});
	} else {
		throw new Error('Sequelize not defined in Logger');
	}
	return null;
};

//
// ### function close ()
// Cleans up resources (streams, event listeners) for
// this instance (if necessary).
//
SequelizeTransport.prototype.close = function() {
	this.sequelize.connectorManager.disconnect();
};

module.exports = SequelizeTransport;
