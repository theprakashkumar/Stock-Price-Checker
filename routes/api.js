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
        console.log("its a string");
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
        console.log('its an array');
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

// {"stockData":{"stock":"GOOG","price":1835.74,"likes":3}}
//{"stockData":[{"stock":"GOOG","price":1835.74,"rel_likes":-1},{"stock":"MSFT","price":231.96,"rel_likes":1}]}


// // Look for first company in DB and do the required action for storing likes
        // Company.findOne({company: firstCompany}, (err, foundCompany) => {
        //   if(err){
        //     return console.log("Error while finding stock", err);
        //   }else if(!foundCompany){
        //     Company.create({company: firstCompany, likes: like}, (err, newCompnay) => {
        //       if(err) return console.log("Error while creating stock", err);
        //       if(like == 1){
        //         newCompnay.likeIPs.push(req.ip);
        //         newCompnay.save((err, updatedCompnay) => {
        //           if(err) return console.log("Error while pushing the IP after creating the new stock", err);
        //           // Push data to be returned
        //           returnData.push({stock: firstData.symbol.toUpperCase(),"price":firstData.price});
        //           console.log("1", returnData);
        //         });
        //       }
        //       returnData.push({stock: firstData.symbol.toUpperCase(),"price":firstData.price});
        //       console.log("2", returnData);
        //     })
        //   }else{
        //     if(like == 1){
        //       foundCompany.likes = foundStock.likes++
        //       foundCompany.likeIPs.push(req.ip);
        //       returnData.push({stock: firstData.symbol.toUpperCase(),"price":firstData.price});
        //       console.log("3", returnData);
        //     }
        //     await returnData.push(
        //       {
        //         stock: firstData.symbol.toUpperCase(), price: firstData.price
        //       });
        //     console.log("4", returnData);
        //   }
        // })

        // // Look for second company in DB and do the required action for storing likes
        // Stock.findOne({stock: secondCompany}, (err, foundStock) => {
        //   if(err){
        //     return console.log("Error while finding stock", err);
        //   }else if(!foundStock){
        //     Stock.create({stock: stock, likes: like}, (err, newStock) => {
        //       if(err) return console.log("Error while creating stock", err);
        //       if(like == 1){
        //         newStock.likeIPs.push(req.ip);
        //         newStock.save((err, updatedStock) => {
        //           if(err) return console.log("Error while pushing the IP after creating the new stock", err);
        //           // Push data to be returned
        //           return  returnData.push({stock: secondData.symbol.toUpperCase(),"price":secondData.price});
        //         });
        //       }
        //       return  returnData.push({stock: secondData.symbol.toUpperCase(),"price":secondData.price});
        //     })
        //   }else{
        //     if(like == 1 && !foundStock.likeIPs.includes(req.ip)){
        //       foundStock.likes = foundStock.likes++
        //       foundStock.likeIPs.push(req.ip);
        //       return  returnData.push({stock: secondData.symbol.toUpperCase(),"price":secondData.price});
        //     }
        //     return  returnData.push({stock: secondData.symbol.toUpperCase(),"price":secondData.price});
        //   }
        // });
        // final return


                // // Get the data from the given api
                // let data = await getData(company.toLowerCase());
                // // Look for compnay in our DB
                // Company.findOne({company: company}, (err, foundCompany) => {
                //   // if there is an error
                //   if(err){
                //     return console.log("Error while finding stock", err);
                //   // if there is no record of given company in our db then create one
                //   }else if(!foundCompany){
                //     Company.create({company: company, likes: like}, (err, newCompany) => {
                //       if(err) return console.log("Error while creating stock", err);
                //       // After creating the record if there is like then we have to push to likeIPs array for one like per ip
                //       if(like == 1){
                //         newCompany.likedIPs.push(req.ip);
                //         newCompany.save((err, updatedCompany) => {
                //           if(err) return console.log("Error while pushing the IP after creating the new stock", err);
                //           return res.json({
                //             "stockData":{
                //               "stock": data.symbol,
                //               "price":data.price,
                //               "likes": updatedCompany.likes
                //             }
                //           });
                //         });
                //       }else{
                //         // If there is no like then just return the data
                //         return res.json({
                //           "stockData":{
                //             "stock": data.symbol,
                //             "price":data.price,
                //             "likes": newCompany.likes
                //           }
                //         }); 
                //       }
                //     })
                //   // if record found then
                //   }else{
                //     // There is like then increase the like and push the ip
                //     if(like == 1){
                //       // * Add awit here
                //       let ip = foundCompany.likedIPs.includes(req.ip)
                //       console.log('like is here');
                //       if(!ip){
                //         foundCompany.likes = foundCompany.likes++
                //         foundCompany.likedIPs.push(req.ip);
                //         foundCompany.save((err, savedCompany) => {
                //           if(err) return console.log(err);
                //           return res.json({
                //             "stockData":{
                //               "stock": data.symbol,
                //               "price":data.price,
                //               "likes": savedCompany.likes
                //             }
                //           });
                //         });
                //       }
                //       return res.json({
                //         "stockData":{
                //           "stock": data.symbol,
                //           "price":data.price,
                //           "likes": foundCompany.likes
                //         }
                //       });
                //     }else{
                //       // If there is no like
                //       console.log("its not")
                //       return res.json({
                //         "stockData":{
                //           "stock": data.symbol,
                //           "price":data.price,
                //           "likes": foundCompany.likes
                //         }
                //       });
                //     }
                //   }
                // })