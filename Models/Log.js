
/**
 * Construct a new Model Log function
 * @class Log
 * @classdesc This class provides the Log's Model function
 * @returns {function} This is the function that creates the entity and relations for Log
 * @memberof Models
 */
module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define('Log', {
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		level: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		label: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		meta: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	});

	return model;
};
