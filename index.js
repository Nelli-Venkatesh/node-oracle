"use strict";

const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// oracledb.poolTimeout = 60; // 60 seconds
// oracledb.queueTimeout = 60000; // 60 seconds

module.exports.dbStoredProcedure = async function(
  connectionString,
  sql_query,
  binds = [],
  options = {},
  callback
) {
  await oracledb
    .getConnection(connectionString)
    .then(async connection => {
      let dataTable = [];
      try {
        const result = await connection.execute(sql_query, binds, options);
        const resultSet = result.outBinds.p_cur;
        if (resultSet != undefined) {
          let row;
          while ((row = await resultSet.getRow())) {
            dataTable.push(row);
          }
          await resultSet.close();
          callback(null, dataTable);
          return;
        }
        callback("ResultSet is Undefined", null);
        return;
      } catch (error) {
        console.log(error);
        callback(error, null);
        return;
      } finally {
        if (connection) {
          try {
            await connection.close();
            return;
          } catch (err) {
            console.error(err);
            callback(err, null);
            return;
          }
        }
      }
    })
    .catch(error => {
      callback(error, null);
      return;
    });
};

module.exports.dbQueryExecution = async function(
  connectionString,
  sql_query,
  binds = [],
  options = {},
  callback
) {
  await oracledb.getConnection(connectionString).then(async connection=>{

    try {
      const result = await connection.execute(sql_query, binds, options);
  
      callback(null, result.rows);
    } catch (error) {
      console.log(error);
      callback(error, null);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.log(err);
          callback(err, null);
        }
      }
    }

  })
  .catch(error => {
    callback(error, null);
    return;
  });

};

module.exports.dbInsertionExecution = async function(
  connectionString,
  sql_query,
  binds = [],
  options = {},
  callback
) {
  await oracledb.getConnection(connectionString).then(async connection =>{

    try {
      const result = await connection.executeMany(sql_query, binds, options);
  
      callback(null, result.rowsAffected);
    } catch (error) {
      console.log(error);
      callback(error, null);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.log(err);
          callback(err, null);
        }
      }
    }

  })
  .catch(error => {
    callback(error, null);
    return;
  });

};
