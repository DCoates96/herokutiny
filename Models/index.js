'use strict';
const Loader = require('../Loader');
const logger = require('../Logger')(module);
const Umzug = require('umzug');
const SequelizeFactory = require('../SequelizeFactory');
const Util = require('util');
const Op = require('sequelize').Op;

/*
 * typedef Models
 * @namespace Models
 * @type {Object}
 * @property {Sequelize} Sequelize
 * @property {Sequelize#Model} Log
 * @property {Sequelize#Model} Message
 * @property {Sequelize#Model} Profile
 * @property {Sequelize#Model} Session
 * @property {Sequelize#Model} Template
 * @property {Sequelize#Model} Linklog
 * @property {function} sync
 * @property {function} setup
 */
const Models = {
	/**
	 * Setup the Database
	 * @method
	 * @param  {JSON} CONFIG The configuration params to use for setup
	 * @return {class}  To be used to access de database
	 */
	setup: function(CONFIG) {
        console.log('RUNNING SETUP')
		if (CONFIG.SEQUELIZE) {
			const dialect = CONFIG.SEQUELIZE.DIALECT;
			const dialectOptions = {};
			switch (dialect) {
				case 'mssql':
					dialectOptions.charset = CONFIG.SEQUELIZE.CHARSET;
					dialectOptions.requestTimeout = CONFIG.SEQUELIZE.REQUEST_TIMEOUT;
					dialectOptions.encrypt = CONFIG.SEQUELIZE.ENCRYPT;
					break;
				default:
					dialectOptions.charset = CONFIG.SEQUELIZE.CHARSET;
			}
			const SEQUELIZE_OPTIONS = {
				charset: CONFIG.SEQUELIZE.CHARSET,
				collate: CONFIG.SEQUELIZE.COLLATION,
				dialectOptions: dialectOptions,
				dialect: dialect,
				host: CONFIG.SEQUELIZE.HOST,
				port: CONFIG.SEQUELIZE.PORT,
				logging: CONFIG.SEQUELIZE.LOGGING,
				pool: {
					max: CONFIG.SEQUELIZE.MAX_CONNECTIONS,
					min: CONFIG.SEQUELIZE.MIN_CONNECTIONS,
					idle: CONFIG.SEQUELIZE.MAX_IDLETIME,
					acquire: CONFIG.SEQUELIZE.ACQUIRE_TIMEOUT,
					evict: CONFIG.SEQUELIZE.EVICT_INTERVAL,
				},
			};

			logger.silly('Set Sequelizer Logger: %s', CONFIG.SEQUELIZE.LOGGING);
			if (CONFIG.SEQUELIZE.LOGGING) SEQUELIZE_OPTIONS.logging = logger.verbose;

			const SequelizeObj = SequelizeFactory.create({
				database: CONFIG.SEQUELIZE.DATABASE,
				username: CONFIG.SEQUELIZE.USERNAME,
				password: CONFIG.SEQUELIZE.PASSWORD,
				config: SEQUELIZE_OPTIONS,
			});

			const files = Loader.getClassFiles('Models');

			//make global
			files.forEach(modelPath => {
				const Model = SequelizeObj.import(modelPath);
				logger.silly('Register Model %s', Model.name);
				Models[Model.name] = Model; //Attach to Models for Project
			});

			//make associate
			Object.keys(Models).forEach(modelName => {
				if (Models[modelName].associate) {
					logger.silly('Setup Associate for %s', modelName);
					Models[modelName].associate(Models);
				}
			});

			Models.Sequelize = SequelizeObj;
			logger.verbose('Model Setup Finished');
			return true;
		}
		return false;
	},

	/**
	 * Sync the database
	 * @param {boolean} [logging=false] - the logger function.
	 * @param {boolean} [force=false] Force a database sync (DROP and afterwards CREATE)
	 * @param {string} log_level='debug' The logging level to use.
	 * @returns {Promise}
	 */
	sync: function(logging = false, force = false, log_level = 'debug') {
		if (logging === true && typeof logger[log_level] === 'function') logging = logger[log_level];

		if (Models.Sequelize) {
			return Models.Sequelize.sync({force, logging})
				.then(response => {
					logger.info('Sequelize Synced');
					const umzugconfig = {
						storage: 'sequelize',
						storageOptions: {
							sequelize: Models.Sequelize,
						},

						// see: https://github.com/sequelize/umzug/issues/17
						migrations: {
							params: [
								Models.Sequelize.getQueryInterface(), // queryInterface
								Models.Sequelize.constructor, // DataTypes
							],
							pattern: /\.js$/,
						},

						logging: function() {
							const args = Array.prototype.slice.call(arguments);
							logger.info(args.join(' '));
						},
					};

					return Promise.each(Loader.getExistingPaths('Migrations'), path => {
						umzugconfig.migrations.path = path;
						const umzug = new Umzug(umzugconfig);
						return umzug
							.up()
							.then(migrations => {
								logger.info(`Executed ${migrations.length} migrations from ${path}`);
								return true;
							})
							.catch(error => {
								logger.error(Util.inspect(error));
								logger.info('Umzug error', error.message);
								return false;
							});
					});
				})
				.then(() => {
					logger.info('Migrations finished');
					return true;
				})
				.catch(error => {
					if (error.message.indexOf('connect ECONNREFUSED') === 0)
						logger.error(
							'Database connection refused! Potential reasons: Firewall block, Server down etc ... ',
							error.message,
							error
						);
					else logger.error('General DataSync failed', error);

					throw error;
				});
		}
		return Promise.resolve();
	},

	Op: Op,
};
/**
 * Sequelize is a promise-based ORM for Node.js v4 and up.<br> It supports the dialects PostgreSQL, MySQL, SQLite and MSSQL and features solid transaction support, relations, read replication and more.<br>
 * A Model represents a table in the database. Sometimes you might also see it referred to as model, or simply as factory.<br> This class should not be instantiated directly, it is created using sequelize.define , and already created models can be loaded using sequelize.import.
 * @namespace Models
 * @see {@link http://docs.sequelizejs.com/}
 *
 *
 */
module.exports = Models;
