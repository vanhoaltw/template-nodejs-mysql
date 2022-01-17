"use strict";
require("dotenv").config();
const { DB, timestamps } = require("../../../config/database")
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const tableName = "UserDepositTransactionView";

const rootTableName = 'AppUser';
const primaryKeyField = "appUserId";
async function createUserDepositTransactionView() {
  const depositTableName = 'PaymentDepositTransaction';
  let fields = [
    `${rootTableName}.appUserId`,
    `${rootTableName}.createdAt`,
    `${rootTableName}.firstName`,
    `${rootTableName}.lastName`,
    `${rootTableName}.email`,
    `${rootTableName}.memberLevelName`,
    `${rootTableName}.active`,
    `${rootTableName}.ipAddress`,
    `${rootTableName}.phoneNumber`,
    `${rootTableName}.telegramId`,
    `${rootTableName}.facebookId`,
    `${rootTableName}.appleId`,
    `${rootTableName}.username`,
    `${rootTableName}.isHidden`,
    `${rootTableName}.isDeleted`,
    `${depositTableName}.paymentMethodId`,
    `${depositTableName}.paymentAmount`,
    `${depositTableName}.paymentRewardAmount`,
    `${depositTableName}.paymentUnit`,
    `${depositTableName}.paymentStatus`,
    `${depositTableName}.paymentRef`,
    `${depositTableName}.paymentNote`,
    `${depositTableName}.paymentApproveDate`,
    `${depositTableName}.paymentPICId`,
  ];

  var viewDefinition = DB.select(fields)
  .from(depositTableName)
  .sum('paymentAmount as sumPaymentDepositTransactionAmount')
  .groupBy(`${rootTableName}.appUserId`)
  .groupBy(`${depositTableName}.paymentStatus`)
  .leftJoin(rootTableName, function () {
    this.on(`${rootTableName}.appUserId`, '=', `${depositTableName}.appUserId`)
  })
  Common.createOrReplaceView(tableName, viewDefinition)
}

async function initViews() {
  createUserDepositTransactionView();
}

async function insert(data) {
  return await Common.insert(tableName, data);
}

async function updateById(id, data) {
  let dataId = {};
  dataId[primaryKeyField] = id;
  return await Common.updateById(tableName, dataId, data);
}

async function find(filter, skip, limit, order) {
  return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
  return await Common.count(tableName, primaryKeyField, filter, order);
}

async function sum(field, filter, order) {
  return await Common.sum(tableName, field, filter, order);
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  initViews,
  sum,
  modelName: tableName,
};
