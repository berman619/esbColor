const axios = require('axios');
const cheerio = require('cheerio');

const handler = (event, context, callback) => {
  axios.get('https://www.esbnyc.com/', { timeout: 15000 })
    .then(res => {
      const $ = cheerio.load(res.data);
      $('.tonights_lights-wrapper').each((index, element) => {
        const lightColor = $(element).find('a').text();
        axios.get('https://www.esbnyc.com/about/tower-lights', { timeout: 15000 })
          .then(res => {
            const $ = cheerio.load(res.data);
            let lightColorReason = $('div.page-content').find(`[data-color="${lightColor.toLowerCase()}"]`).find('.field_description p').text().trim();
            if (lightColor === "Signature White") {
              lightColorReason = "which is the building's standard color";
            }
            const outputText = `The Empire State Building lights are ${lightColor} tonight, ${lightColorReason}.`;
            callback(null, { response: { outputSpeech: { type: 'PlainText', text: outputText } } });
          })
          .catch(err => {
            console.error(err);
            const errorText = 'Sorry, there was an error retrieving the Empire State Building light color reason.';
            callback(null, { response: { outputSpeech: { type: 'PlainText', text: errorText } } });
          });
      });
    })
    .catch(err => {
      console.error(err);
      const errorText = 'Sorry, there was an error retrieving the Empire State Building light color.';
      callback(null, { response: { outputSpeech: { type: 'PlainText', text: errorText } } });
    });
};

module.exports = { handler };