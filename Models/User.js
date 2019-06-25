module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define(
		'User',
		{
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
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			stripeCustomerId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			role: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'student',
			},
            scoreA: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            scoreB: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            scoreC: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            scoreD: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

		},
		{
			indexes: [
				{
					unique: true,
					fields: ['uuid'],
				},
			],
		}
	);

	model.associate = function(models) {
		this.hasMany(models.Answer, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			sourceKey: 'uuid',
		});
	};

	return model;
};
