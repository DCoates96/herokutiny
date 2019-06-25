module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'BubblesQuestion',
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
            simpleAnswer: {
                type: DataTypes.REAL,
                allowNull: true,
            },
            difficulty: {
                type: DataTypes.TINYINT,
                allowNull: true,
            },
            type: {
                type: DataTypes.TINYINT,
                allowNull: true,
            },
            timesPopped: {
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

    return model;
};
