'use strict';
const logger = require('./Logger')(module);
const fs = require('fs');
const path = require('path');

/**
 *
 * @type {{registerGlobals: Loader.registerGlobals, getClassFiles: Loader.getClassFiles, registerClasses: Loader.registerClasses}}
 */
let Loader = {
	registerGlobals: function() {
		let toRegister = {
			Promise: 'bluebird',
		};

		for (let r in toRegister) {
			//this.logger.silly("Register %s in global from %s", r, toRegister[r]);
			global[r] = require(toRegister[r]); //eslint-disable-line global-require
		}
	},

	_additionalDirectories: [],

	get additionalDirectories() {
		const returnArray = [...new Set(Loader._additionalDirectories)];
		returnArray.push = this._additionalDirectories.push.bind(this._additionalDirectories);
		return returnArray;
	},

	/**
	 * Fix directories for test mode.
	 * @returns {String} the path file corrected for mocha
	 */
	correctFilePathForTestMode: function() {
		if (require.main.filename.indexOf('mocha/bin/') > -1) {
			return path.dirname(
				require.main.filename.substring(0, require.main.filename.indexOf('mocha/bin/'))
			);
		}
		return path.dirname(require.main.filename);
	},

	/**
	 * Returns for a subdirectory all paths that exist
	 * Tests for Paths in botbase directory and project directory in that order
	 * @param {String} subdir Subdirectory to be searched
	 * @returns {Array} Array of searched subdirectories
	 */
	getExistingPaths: function(subdir) {
		let paths = [
			...Loader.additionalDirectories.map(directory => `${directory}/${subdir}/`),
			`${__dirname}/${subdir}/`, //BotBase Files
			`${this.correctFilePathForTestMode()}/${subdir}/`, //Project Files;
		];
		return paths
			.filter(path => {
				if (!fs.existsSync(path)) {
					logger.warn('Path does not exist: %s', path);
					return false;
				}
				return true;
			})
			.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
	},

	getClassFiles: function(subdir, useSubdirectories = false) {
		const paths = this.getExistingPaths(subdir);

		const classFiles = [];

		for (let p of paths) {
			logger.silly('Read Classes in Folder %s', p);

			//Read Files
			fs
				.readdirSync(p)
				.filter(file => {
					return useSubdirectories
						? fs.statSync(path.join(p, file)).isDirectory() &&
								fs.existsSync(path.join(p, file, 'index.js'))
						: path.extname(file) === '.js' && file !== 'index.js';
				})
				.forEach(file => {
					classFiles.push(path.join(p, file));
				});
		}
		return classFiles;
	},

	registerClasses: function(classes) {
		if (classes.length === 0) throw new Error('No classes found to register');

		let Classes = {};
		classes.forEach(filepath => {
			let Class = require(filepath); //eslint-disable-line global-require
			logger.silly('Attach Class %s', Class.name);
			Classes[Class.name] = Class;
		});
		return Classes;
	},
};
module.exports = Loader;
