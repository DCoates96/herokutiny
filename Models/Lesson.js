module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'Lesson',
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
            assessmentID: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lessonID: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            timesOpened: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            questionsAnswered: {
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
        this.hasMany(models.Chonk, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
            sourceKey: 'uuid',
        });
    };

    return model;
};
