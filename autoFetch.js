import fs from 'fs';

const apikeys = ["3ed5521e315d4912bd2cd2b15031424e","c80e6da472ae4cfb97a6724283e183ef","61ec63e127f349babba338d5057eebc2"];
let currentKeyIndex = 0;
const filePath = 'BACKEND/apiStock.json';

async function getDataFromApi() {
    try {
        let apiKey = apikeys[currentKeyIndex];
        let urlAPI = `https://api.twelvedata.com/time_series?symbol=AAPL,META,TSLA,NVDA,AMZN,GOOGL,INTC,AMD&interval=1h&apikey=${apiKey}`;
        
        console.log(`Using API Key: ${apiKey}`);
        const response = await fetch(urlAPI);
        const data = await response.json();

        // if the api returns error 429 (credit limit) we try the following API key
        if (data.code === 429) {
            console.warn("API limit reached - switching to the next API key...");
            currentKeyIndex = (currentKeyIndex + 1) % apikeys.length;
            // call again with the next apikey
            return getDataFromApi(); 
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { flag: 'w' });
        console.log(`[${new Date().toISOString()}] Data saved in ${filePath}`);
    } catch (error) {
        console.error(`Error getting data:`, error);
    }
}

// run every 1 minute
setInterval(getDataFromApi, 60000);

// run immediately at startup
getDataFromApi();
