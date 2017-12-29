use strict;

module.exports.readAllAirline = (event, context, callback) => {

  var AWS = require('aws-sdk'),
  documentClient = new AWS.DynamoDB.DocumentClient(); 

  var params = {
      TableName : process.env.TABLE_NAME
    };
    documentClient.scan(params, function(err, data){
      if(err){
          callback(err, null);
      }else{
          callback(null, data.Items);
      }
  });
};