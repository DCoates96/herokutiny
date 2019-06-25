module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'Question',
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
            text: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            intro: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            statement: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            difficulty: {
                type: DataTypes.TINYINT,
                allowNull: true,
            },
            timesSkipped: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            timesCorrect: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            timesAnswered: {
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
        this.hasMany(models.QuestionTheme, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
            sourceKey: 'uuid',
        });
        this.hasMany(models.Answer, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
            sourceKey: 'uuid',
        });
        this.hasMany(models.AnswerOption, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
            sourceKey: 'uuid',
        });
    };

    return model;
};
