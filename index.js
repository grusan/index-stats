const { MongoClient } = require('mongodb');
const fs = require('fs');
const outputPath = './output/test.txt'

async function measureIndexSize(dbUrl, dbName) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
    const db = client.db(dbName)
    const collections = await db.collections();
    const output = [];
    // loop over collections
    for (const collection of collections) {
        const stats = await collection.stats({indexDetailsKey:true});
        console.log(' - Retrieving indexSizes for collection', collection.collectionName);
        Object.keys(stats.indexSizes).forEach(function(name, _)  {
            const indexSizes = Object.entries(stats.indexSizes).map(([indexName, size]) => ({ indexName, size }));
            output.push({ collectionName: collection.collectionName, indexSizes });
            console.log(indexSizes, "bytes")
        });
    }
    console.log("Writing results to file", outputPath)
    const jsonString = JSON.stringify(output, null, 2);
    fs.writeFileSync(outputPath, jsonString);
    await client.close();
}
// check collection size


async function main() {
    require('dotenv').config();
  
    const db_uri = process.env.DB_URI
    console.log(" * DB_URI", db_uri)

    const db_name = process.env.DB_NAME
    console.log(" * DB_NAME", db_name)

    await measureIndexSize(db_uri, db_name)  
}

if (require.main === module) {
  main();
}
