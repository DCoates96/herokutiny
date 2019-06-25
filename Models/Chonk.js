module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'Chonk', {
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
        content: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        stepID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        timesServed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        timesRejected: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        isEndChunk: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        fValue: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });

    model.associate = function(models) {
        this.belongsTo(models.Lesson, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
            targetKey: 'uuid',
        });
    };

    return model;
};
