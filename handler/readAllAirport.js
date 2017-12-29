'use strict';

module.exports.readAllAirport = (event, context, callback) => {
   
  var AWS = require('aws-sdk'),
  documentClient = new AWS.DynamoDB.DocumentClient(); 

  var params = {
      TableName : process.env.TABLE_NAME
    };
    documentClient.scan(params, function(err, data){
      if(err){
          callback(err, null);
      }else{
          const response = {
             statusCode: 200,
             body: JSON.stringify({
               Myresult: data.Items,
               input: event,
             }),
           };
          callback(null, response);
      }
  });
};