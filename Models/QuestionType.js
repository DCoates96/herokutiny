'use strict';

module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define('QuestionType', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		uuid: {
			type: DataTypes.UUID,
			unique: true,
			defaultValue: sequelize.UUIDV1,
			validate: {
				notEmpty: true,
			},
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	});

	model.associate = function(models) {
		this.hasMany(models.QuestionTheme, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			sourceKey: 'uuid',
		});
	};

	return model;
};
