"use strict";
module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define(
    "stock",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      departmentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: 'department',
            schema: 'public'
          },
          key: 'id'
        },
      },
      productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: 'product',
            schema: 'public'
          },
          key: 'id'
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  Stock.associate = function (models) {
    // associations can be defined here
    Stock.belongsTo(models.product, {
      targetKey: "id",
      foreignKey: "product_id",
    });
    Stock.belongsTo(models.department, {
      targetKey: "id",
      foreignKey: "department_id",
    });
  };
  return Stock;
};
