const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            phone:{
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            create_time: {
                type: 'TIMESTAMP',
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName: 'user',
            tableName: 'user',
            paranoid: false,
            charset:'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
    }
}