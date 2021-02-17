'use strict';

const Company = require('../model/company');
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
      let company = req.query.stock ;
      let like = req.query.like;

      let data = await getData(company);

      let companyName = data.symbol;
      let companyPrice = data.price;

      // Single price request
      if(typeof company === 'string'){
        let companyFromDB = await Company.findOne({company: companyName}).exec();
        if(!companyFromDB){
          companyFromDB = new Company({
            company: companyName,
            likes: 0
          });
        }

        await companyFromDB.save(function(err){
          if(err) return console.log(err);
        });

        if(like){
          if(!companyFromDB.likedIPs.includes(req.ip)){
            companyFromDB.likes++
            companyFromDB.likedIPs.push(req.ip)

            await companyFromDB.save(function(err){
              if(err) return console.log(err);
            })
          }
        }

        res.send({
          stockData:{
            stock: companyName,
            price: companyPrice,
            likes: companyFromDB.likes
          }
        })

        // Compare price and relative like request
      }else if(Array.isArray(company)){
        //Extract company names for query
        let firstCompany = company[0].toLowerCase();
        let secondCompany = company[1].toLowerCase();

        // Fetch data of respective companies
        let firstData = await getData(firstCompany);
        let secondData = await getData(secondCompany);

        // Data variables
        let firstCompanyName = firstData.symbol;
        let secondCompanyName = secondData.symbol;

        let firstCompanyPrice = firstData.price;
        let secondCompanyPrice= secondData.price;

        // Look for company in DB
        let firstCompanyFromDB = await Company.findOne({ company: firstCompanyName}).exec();

        let secondCompanyFromDB = await Company.findOne({ company: secondCompanyName}).exec();

        // if no coumpany found then make one
        if(!firstCompanyFromDB){
          firstCompanyFromDB = new Company({
            company: firstCompanyName,
            likes: 0
          });

          await firstCompanyFromDB.save(function(err){
            if(err) return console.log(err);
          });
        }

        if(!secondCompanyFromDB){
          secondCompanyFromDB = new Company({
            company: secondCompanyName,
            likes: 0
          });

          await secondCompanyFromDB.save(function(err){
            if(err) return console.log(err);
          });
        }

        // if like

        if(like){

          if(!firstCompanyFromDB.likedIPs.includes(req.ip)){
            firstCompanyFromDB.likedIPs.push(req.ip);
            firstCompanyFromDB.likes++;
          }
          

          if(!secondCompanyFromDB.likedIPs.includes(req.ip)){
            secondCompanyFromDB.likedIPs.push(req.ip);
            secondCompanyFromDB.likes++;
          }
        }

         return res.send({
            stockData:[
              {
                stock:firstCompanyName,
                price: firstCompanyPrice,
                rel_likes: firstCompanyFromDB.likes-secondCompanyFromDB.likes
              },
              {
                stock:secondCompanyName,
                price: secondCompanyPrice,
                rel_likes: secondCompanyFromDB.likes-firstCompanyFromDB.likes
              }
            ]
          })
      }
    });

};