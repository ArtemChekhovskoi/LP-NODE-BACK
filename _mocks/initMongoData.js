/* eslint-disable no-console */
const { execSync } = require("child_process");
const measurements = require("./measurements");
const emotionsConfig = require("./emotions");

const runExec = (cmd) =>
	execSync(cmd, (error) => {
		if (error) {
			console.log(error);
		}
	});

const DB_NAME = "Main";

const URI_LOCAL = `mongodb://localhost:27017,localhost:27018,localhost:27019/${DB_NAME}`;

const COLLECTIONS = [measurements, emotionsConfig];

const createNewDump = () => {
	// eslint-disable-next-line no-restricted-syntax
	for (const collection of COLLECTIONS) {
		const i = COLLECTIONS.indexOf(collection) + 1;
		console.log(`process ${i}/${COLLECTIONS.length}`);

		const collectionBulkWrite = collection.data.map((item) => ({
			insertOne: {
				document: item,
			},
		}));

		runExec(`mongosh ${URI_LOCAL} --eval 'db.${collection.name}.deleteMany({})'`);
		runExec(`mongosh ${URI_LOCAL} --eval 'db.${collection.name}.bulkWrite(${JSON.stringify(collectionBulkWrite)})'`);

		console.log("DONE");
	}
};

createNewDump();
