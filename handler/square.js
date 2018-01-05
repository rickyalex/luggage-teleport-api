'use strict';
var unirest = require('unirest');
var base_url = 'https://connect.squareup.com/v2';

module.exports.squareCharge = (data, callback) => {

  var token = require('crypto').randomBytes(64).toString('hex');

  var request_body = {
    card_nonce: data.cardNonce,
    amount_money: {
      amount: data.TotalCost,
      currency: 'USD'
    },
    idempotency_key: token
  }

  var locationId = process.env.LOCATION_ID;

  unirest.post(base_url + '/locations/' + locationId + "/transactions")
    .headers({
      'Authorization': 'Bearer ' + process.env.SQUARE_ACCESS_TOKEN,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
    .send(request_body)
    .end(callback);
};
