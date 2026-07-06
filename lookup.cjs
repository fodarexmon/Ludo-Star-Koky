const fs = require('fs');
const sourceMap = require('source-map');

async function lookup() {
  const rawSourceMap = JSON.parse(fs.readFileSync('./dist/assets/index-DVBUqfnS.js.map', 'utf8'));
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);
  
  const pos = consumer.originalPositionFor({
    line: 36,
    column: 92881
  });
  
  console.log("Original position:", pos);
  consumer.destroy();
}

lookup().catch(console.error);
