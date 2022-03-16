const { Op } = require("sequelize");
const {
  product: ProductModel,
  stock: StockModel,
  sequelize,
} = require("../models");

const { STOCK_ADD_REMOVE_TYPES } = require("../constants/stock");

class Stock {
  static async getInventory(departmentId) {
    const totalInventoryStock = await StockModel.findAll({
      where: { departmentId },
      include: [
        {
          model: ProductModel,
          required: true,
        },
      ],
      nest: true,
      raw: true,
    });

    return totalInventoryStock;
  }
  static async AddOrRemoveStocks(transfers, type = "ADD") {
    const t = await sequelize.transaction();
    try {
      if (!transfers.length) {
        return {};
      }
      const [ADD] = STOCK_ADD_REMOVE_TYPES;
      const products = transfers.map(({ productId, amount }) => ({
        productId,
        amount,
      }));
      const productIds = products.map(({ productId }) => ({ productId }));
      const [transfer] = transfers;
      const departmentId = transfer.departmentIdTo;
      const stocks = await StockModel.findAll({
        where: {
          productId: {
            [Op.in]: productIds,
          },
          departmentId,
        },
      });
      const promises = [];
      for (let index = 0; index < products.length; index++) {
        const { productId, amount } = products[index];
        const stockModel = stocks.find(
          (stock) => +stock.productId === +productId
        );
        if (stockModel) {
          if (type === ADD) {
            stockModel.amount = stockModel.amount + amount;
          } else {
            stockModel.amount = stockModel.amount - amount;
          }
          promises.push(stockModel.save({ transaction: t }));
        } else {
          if (type === ADD) {
            const stockData = {
              departmentId,
              productId,
              amount,
            };
            promises.push(StockModel.create(stockData, { transaction: t }));
          }
        }
      }
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error(error, "------------error");
      await t.rollback();
      throw error;
    }
  }
}

module.exports = Stock;
