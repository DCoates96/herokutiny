module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'LessonInstance',
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
            lessonID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            chonkOne: {
                type: DataTypes.STRING,
                allowNull: false
            },
            chonkTwo: {
                type: DataTypes.STRING,
                allowNull: false
            },
            chonkThree: {
                type: DataTypes.STRING,
                allowNull: false
            },
            chonkFour: {
                type: DataTypes.STRING,
                allowNull: false
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            questionsAnswered:{
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
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
