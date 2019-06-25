module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define('AnswerOption', {
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
		text: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		timesPicked: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	});

	model.associate = function(models) {
		this.hasMany(models.Answer, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			sourceKey: 'uuid',
		});
		this.belongsTo(models.Question, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			targetKey: 'uuid',
		});
	};

	return model;
};
