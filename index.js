import { WebSocket } from 'ws';
import { OpenSeaStreamClient } from "@opensea/stream-js";
import axios from 'axios';
import ethers from 'ethers';
import 'dotenv/config';

const client = new OpenSeaStreamClient({
    token: process.env.OPENSEA_TOKEN,
    connectOptions: {
      transport: WebSocket
    }
  });

client.onItemSold(process.env.OPENSEA_SLUG, (event) => {
    const name = event.payload.item.metadata.name;
    const formattedName = name.replace("#", "%23");
    const link = event.payload.item.permalink;
    const currency = event.payload.payment_token.symbol;
    const currencyUSDPrice = event.payload.payment_token.usd_price;
    const decimals = event.payload.payment_token.decimals;
    const pricebn = ethers.BigNumber.from(event.payload.sale_price);
    const price = ethers.utils.formatUnits(pricebn, decimals);
    const unroundedpriceusd = currencyUSDPrice * price;
    const roundedpriceusd = unroundedpriceusd.toFixed(2);
    const tweet = `${formattedName} has been caught for ${price} ${currency} ($${roundedpriceusd})! ${link}`;
    console.log(tweet);
    axios.post(`https://maker.ifttt.com/trigger/${process.env.IFTTT_TRIGGER}/with/key/${process.env.IFTTT_KEY}?value1=${tweet}`);
});

