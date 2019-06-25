'use strict';

const config = require('./config');
const path = require('path');
const util = require('util');
const winston = require('winston');
const WinstonSequelize = require('./WinstonSequelize');

const MAX_LISTENER = 50;

/**
 * BotBase.Logger is a factory function that returns a logging function. When called, it will send whatever is passed to the logging function to a database, console or other output.
 * @example BotBase.Logger(module).error('Error');
 * @method Logger
 * @param {Object|string} calling_module
 * @type {Object}
 * @returns {Object} loggerFactory
 */
const transports = [
	{
		transport: winston.transports.Console,
		options: {
			level: config.LOG_LEVEL,
			colorize: true, // colorize the output to the console
			prettyPrint: true,
			timestamp: function() {
				return new Date().toString();
			},
			formatter: function(options) {
				// Return string will be passed to logger.
				return (
					`${options.timestamp()} ${options.level.toUpperCase()} ${options.label}\t` +
					(options.message ? options.message : '') +
					(options.meta && Object.keys(options.meta).length
						? '\n\t' + util.inspect(options.meta)
						: '')
				);
			},
		},
	},
	{
		transport: WinstonSequelize,
		options: {
			level: config.LOG_LEVEL || 'silly',
			dialect: config.SEQUELIZE.DIALECT,
			host: config.SEQUELIZE.HOST,
			port: config.SEQUELIZE.PORT,
			database: config.SEQUELIZE.DATABASE,
			username: config.SEQUELIZE.USERNAME,
			password: config.SEQUELIZE.PASSWORD,
			logging: config.SEQUELIZE.LOGGING,
			charset: config.SEQUELIZE.CHARSET,
		},
	},
];

function getLabel(nameOrModule) {
	if (typeof nameOrModule === 'string') return nameOrModule;

	let parts = nameOrModule.filename.replace(__dirname, 'BotBase');

	let project_path = path.dirname(require.main.filename);
	project_path = project_path.replace('node_modules/mocha/bin', '');
	parts = parts.replace(project_path + '/', '');

	return parts
		.replace('/', '.')
		.replace('.js', '')
		.replace('/index', '');
}

function createTransports(label, transports) {
	return transports.map(
		transport => new transport.transport(Object.assign({}, transport.options, {label}))
	);
}

function loggerFactory(nameOrModule) {
	const label = getLabel(nameOrModule);
	const loggerTransports = createTransports(label, transports);
	return winston.loggers.get(label, {transports: loggerTransports});
}

const processLogger = loggerFactory('Process');

process.setMaxListeners(MAX_LISTENER);

process.on('exit', code => {
	let msg = `Exit with code: ${code}`;
	if (code > 0) processLogger.error(msg);
	else processLogger.info(msg);
});

process.on('unhandledRejection', (reason, p) => {
	let msg = `Unhandled Rejection at Promise ${p}, reason:, ${reason}\n\t${reason.stack}`;
	processLogger.error(msg);
});

process.on('uncaughtException', err => {
	let msg = `Uncaught Exception: ${err}\n\t${err.stack}`;
	processLogger.error(msg);
});

module.exports = loggerFactory;

module.exports.addTransports = function(newTransports) {
	transports.push(...newTransports);

	for (const loggerName in winston.loggers.loggers) {
		// add transports to existing loggers

		const logger = winston.loggers.loggers[loggerName];
		newTransports.forEach(transport => {
			logger.add(transport.transport, Object.assign({}, transport.options, {label: logger.id}));
		});
	}
};
