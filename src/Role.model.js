import {DataTypes, Model} from "sequelize";
import {sequelize} from "./dbconfig.js";

class Role extends Model {
}

Role.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'roles',
    timestamps: true,
    underscored: true,
})

export default Role;