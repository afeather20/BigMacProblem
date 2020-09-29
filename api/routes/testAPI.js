const neatCsv = require('neat-csv');
let express = require("express");
let router = express.Router();
let https = require('https');
let ipvigilante = {
    host: 'ipvigilante.com',
    port : 443,
    method : 'GET',
    headers: {'User-Agent': 'request'}
};
//We create a index of countries and their indexes (cacheing for now in an ideal world we would put this into a database and just be able to query)
let countryIndexLatestDate = {};

//File reading csv file into a caches item on the server so we can read from it easily
const fs = require('fs');
let csvData;
fs.readFile('./data/bigMac.csv', async (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    csvData = await neatCsv(data);
});


//We only need a get request to get our country of origin and our 
router.get("/", async function(req, response, next) {

        //Initial check gets your ip address 
        await https.get(ipvigilante, function (res){ 

            var json = '';
     
            res.on('data', function (chunk) {
                
                json += chunk;
                
            });
            res.on('end', function () {
                if (res.statusCode === 200) {
                    try {
                       
                        let result = JSON.parse(json);
                        let userData = findCountry(result.data.country_name);
                        let RandomCountryIndex = csvData[randomInteger(0, csvData.length)].Country;
                        let RandomCountry = findCountry(RandomCountryIndex, userData.Country);
                        let clientRenderedData = {
                            UserData: userData,
                            RandomCountry: RandomCountry,
                            conversionRate: getConverstionRate(userData, RandomCountry)
                        }
                        response.send(clientRenderedData);
                    } catch (e) {
                        console.log("__________________________________________________")
                        console.log(e);
                        console.log('Error parsing JSON!');
                    }
                } else {
                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++")
                    console.log('Status:', res.statusCode);
                }
            });
        
        
        }).on('error', function(err){ 
            console.log(err);
            response.send("Could not resolve country name");
    
        });

   

});

router.get("/getRandomCountry", async function(req, response, next) {

    let userData = findCountry(req.query.UserCountry);
    let RandomCountryIndex = csvData[randomInteger(0, csvData.length)].Country;
    let RandomCountry = findCountry(RandomCountryIndex, userData.Country);
    let clientRenderedData = {
        
        UserData: userData,
        RandomCountry: RandomCountry,
        conversionRate: getConverstionRate(userData, RandomCountry)
    }
    response.send(clientRenderedData);

})

function findCountry(countryName, userCountry) { 
    if(countryName != userCountry){ 
        if(countryIndexLatestDate[countryName] ){ 
      
            return csvData[countryIndexLatestDate[countryName]]
            
        }
        else{ 
            let maxDateCountry = 0;
            let countryIndex = 0;
            let clientRenderData = {};
            for(let i = 0; i < csvData.length; i++) { 
                if(csvData[i].Country == countryName &&  (maxDateCountry < csvData[i].Date || maxDateCountry == 0)) { 
                    maxDateCountry = csvData[i].Date;
                    countryIndex = i;
                    clientRenderData = csvData[i]
    
                }
            }
            countryIndexLatestDate[clientRenderData.Country] = countryIndex;
            return clientRenderData;
        }
    }
    else { 
        return findCountry(csvData[randomInteger(0, csvData.length)].Country,userCountry)
    }
 
}

function randomInteger(min, max) {
    
    let rando =  Math.floor(Math.random() * (max - min + 1)) + min;
    return rando;
  }

  function getConverstionRate(userData, RandomCountry){ 

        return userData['Dollar price'] / RandomCountry['Dollar price'];
  }

module.exports = router;
