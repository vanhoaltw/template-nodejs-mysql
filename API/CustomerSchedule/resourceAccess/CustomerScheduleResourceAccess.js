"use strict";
require("dotenv").config();

const Logger = require('../../../utils/logging');
const { DB, timestamps } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const tableName = 'CustomerSchedule';

const primaryKeyField = "customerScheduleId";
async function createTable() {
  Logger.info('ResourceAccess', `createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments('customerScheduleId').primary();
          table.string('licensePlates');
          table.string('phone');
          table.string('fullnameSchedule');
          table.string('email');
          table.string('dateSchedule');
          table.string('time');
          table.string('notificationMethod');
          table.integer('stationsId');
          table.integer('CustomerScheduleStatus').defaultTo(0);;
          timestamps(table);
          table.index('customerScheduleId');
          table.index('licensePlates');
          table.index('phone');
          table.index('email');
          table.index('time');
        })
        .then(async () => {
          Logger.info(`${tableName}`, `${tableName} table created done`);
          resolve()
        });
    });
  });
}

async function initDB() {
  await createTable();
}

async function insert(data) {
  return await Common.insert(tableName, data);
}

async function updateById(customerScheduleId, data) {
  let dataId = {};
  dataId[primaryKeyField] = customerScheduleId;
  return await Common.updateById(tableName,dataId,data)
}
async function deleteById(customerScheduleId){
  let dataId = {};
  dataId[primaryKeyField] = customerScheduleId;
  return await Common.deleteById(tableName,dataId)
}

async function findById(id) {
  return await Common.findById(tableName, primaryKeyField, id);
}

async function find(filter, skip, limit, order) {
  return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
  return await Common.count(tableName, primaryKeyField, filter, order);
}

function _makeQueryBuilderByFilter(filter, skip, limit, startDate, endDate, searchText, order) {
  let queryBuilder = DB(tableName);
  let filterData = filter ? JSON.parse(JSON.stringify(filter)) : {};

  if (searchText) {
    queryBuilder.where(function () {
      this.orWhere('licensePlates', 'like', `%${searchText}%`)
        .orWhere('email', 'like', `%${searchText}%`)
        .orWhere('phone', 'like', `%${searchText}%`)
        .orWhere('fullnameSchedule', 'like', `%${searchText}%`)
    })
  } else {
    if (filterData.fullnameSchedule) {
      queryBuilder.where('fullnameSchedule', 'like', `%${filterData.fullnameSchedule}%`)
      delete filterData.fullnameSchedule;
    }

    if (filterData.email) {
      queryBuilder.where('email', 'like', `%${filterData.email}%`)
      delete filterData.email;
    }

    if (filterData.phone) {
      queryBuilder.where('phone', 'like', `%${filterData.phone}%`)
      delete filterData.phone;
    }

    if (filterData.licensePlates) {
      queryBuilder.where('licensePlates', 'like', `%${filterData.licensePlates}%`)
      delete filterData.licensePlates;
    }
  }

  if (startDate) {
    queryBuilder.where('customerRecordCheckDate', '>=', startDate)
  }

  if (endDate) {
    queryBuilder.where('customerRecordCheckDate', '<=', endDate)
  }
  queryBuilder.where(filterData);

  queryBuilder.where({ isDeleted: 0 });

  if (limit) {
    queryBuilder.limit(limit);
  }

  if (skip) {
    queryBuilder.offset(skip);
  }

  if (order && order.key !== '' && order.value !== '' && (order.value === 'desc' || order.value === 'asc')) {
    queryBuilder.orderBy(order.key, order.value);
  } else {
    queryBuilder.orderBy("createdAt", "desc")
  }

  return queryBuilder;
}

async function customSearch(filter, skip, limit, startDate, endDate, searchText, order) {
  let query = _makeQueryBuilderByFilter(filter, skip, limit, startDate, endDate, searchText, order);
  return await query.select();
}
async function customCount(filter, startDate, endDate, searchText, order) {
  let query = _makeQueryBuilderByFilter(filter, undefined, undefined, startDate, endDate, searchText, order);
  return new Promise((resolve, reject) => {
    try {
      query.count(`${primaryKeyField} as count`)
        .then(records => {
          resolve(records[0].count);
        });
    } catch (e) {
      Logger.error("ResourceAccess", `DB COUNT ERROR: ${tableName} : ${JSON.stringify(filter)} - ${JSON.stringify(order)}`);
      Logger.error("ResourceAccess", e);
      reject(undefined);
    }
  });
}

module.exports = {
  insert,
  find,
  findById,
  count,
  updateById,
  initDB,
  modelName: tableName,
  customSearch,
  customCount,
  deleteById
};
