module.exports = function(sequelize, DataTypes) {
	const model = sequelize.define(
		'QuestionTheme',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
		},
		{
			indexes: [
				{
					unique: true,
					fields: ['QuestionId', 'QuestionTypeId'],
				},
			],
		}
	);

	model.associate = function(models) {
		this.belongsTo(models.Question, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			targetKey: 'uuid',
		});
		this.belongsTo(models.QuestionType, {
			onDelete: 'CASCADE',
			foreignKey: {
				allowNull: false,
			},
			targetKey: 'uuid',
		});
	};

	return model;
};
