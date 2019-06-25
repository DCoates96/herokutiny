'use strict';
/*eslint-disable no-console*/
const Sequelize = require('sequelize');
const _ = require('lodash');

class SequelizeFactory {
	static checkPreviousConfigs(config) {
		for (let index in SequelizeFactory.previousConfigs) {
			if (_.isEqual(SequelizeFactory.previousConfigs[index], config)) return index;
		}
		return false;
	}

	static create(config) {
		let instanceIndex = SequelizeFactory.checkPreviousConfigs(config);
		if (instanceIndex !== false) return SequelizeFactory.previousInstances[instanceIndex];
		SequelizeFactory.previousConfigs.push(config);
		console.log(
			new Date().toLocaleTimeString() +
				' DEBUG\tCreating new Sequelize Connection, total connections:',
			SequelizeFactory.previousConfigs.length
		);
		if (config.config.dialect === 'mysql') {
			delete config.config.dialectOptions.requestTimeout;
		}
		let newInstance = new Sequelize(
			config.database,
			config.username,
			config.password,
			config.config
		);
		SequelizeFactory.previousInstances.push(newInstance);
		return newInstance;
	}
}

SequelizeFactory.previousConfigs = [];
SequelizeFactory.previousInstances = [];

module.exports = SequelizeFactory;
