'use strict';

let Stock = require('../model/stock');
const fetch = require('node-fetch');

async function getData(company){
  try{
    let response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${company}/quote`);
    const { symbol, latestPrice} = await response.json();
    return {symbol, price: latestPrice};
  } catch(err){
    console.log(err);
  }
  
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let stock = req.query.stock;
      let like = req.query.like ? 1 : 0;

      if(typeof stock==='string'){
        let data = await getData('goog');
        Stock.find({stock: stock}, (err, foundStock) => {
          if(err){
            console.log(err);
          }else if(!foundStock){
            Stock.create({stock: stock, like: like}, (err, newStock) => {
              if(err) return console.log(err);
              if(like == 1){
                newStock.likeIPs.push(req.ip);
                newStock.save((err, updatedStock) => {
                  if(err) return console.log(err);
                  res.json({
                    price: updatedStock.price,
                    like: updatedStock.likes
                  })
                });
              }
            })
          }else{
            if(like == 1 && !foundStock.likeIPs.includes(req.ip)){
              foundStock.likes = foundStock.likes++
              foundStock.likeIPs.push(req.ip);
              return res.json({
                price: foundStock.price,
                like: foundStock.likes
              })
            }
            return res.json({
              price: foundStock.price,
              like: foundStock.likes
            })
          }
        })
        res.json(data);
      }else if(Array.isArray(stock)){
        console.log('its array');
      }
      // let da = await getData('goog');
      // console.log(req.query);
    });

};

// {"stockData":{"stock":"GOOG","price":1835.74,"likes":3}}
//{"stockData":[{"stock":"GOOG","price":1835.74,"rel_likes":-1},{"stock":"MSFT","price":231.96,"rel_likes":1}]}