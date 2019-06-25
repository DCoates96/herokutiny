module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'ChonkInstance',
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
            lessonUUID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            chonkUUID: {
                type: DataTypes.STRING,
                allowNull: false
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
