module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define('Answer', {
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
		//In seconds
		timeTaken: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},

	});

	model.associate = function(models) {
		this.belongsTo(models.Question, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			targetKey: 'uuid',
		});
		this.belongsTo(models.AnswerOption, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: true,
			},
			targetKey: 'uuid',
		});
		this.belongsTo(models.User, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			targetKey: 'uuid',
		});
	};

	return model;
};
