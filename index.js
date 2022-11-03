const fs = require("fs");
csv = fs.readFileSync("./HNG.csv");
const crypto = require("node:crypto");

var array = csv.toString().split("\r");

const keys = array[0].split(",");
keys[1] = "SeriesNumber";
keys[0] = "TeamNames";
//console.log(keys);
array.shift();

for (var i = 0; i < array.length; ++i) {
  array[i] = array[i].replace(/(\n)/gm, "");
}

const teamUnsorted = array.filter((i) => i.indexOf("TEAM") !== -1);
const teams = [];
for (let i = 0; i < teamUnsorted.length; i++) {
  const teamsArr = teamUnsorted[i].split(",");
  teams.push(teamsArr[0]);
}
//console.log(array);
const mintingTool = [];

for (let i = 0, k = 1; i < teams.length; k++) {
  mintingTool.push(teams[i]);
  if (k % 20 === 0) {
    i++;
  }
}
for (let j = 0; j < array.length; j++) {
  array[j] = array[j].split(",");
  array[j][0] = mintingTool[j];
}

const arrayOfObjects = [];
for (let index = 0; index < array.length; index++) {
  const objects = {};
  keys.forEach((key, i) => (objects[key] = array[index][i]));
  arrayOfObjects.push(objects);
}

const dir = "./nfts";

if (!fs.existsSync(dir)){
  fs.mkdir(dir, (err) => {
    if (err) {
      throw err;
    }
    console.log("Directory is created.");
  });
}

for (let index = 0; index < arrayOfObjects.length; index++) {
  const attributes = arrayOfObjects[index].attributes.split(";");
  for (let q = 0; q < attributes.length; q++) {
    attributes[q] = attributes[q].trim().split(":");
  }
  const attributesObject = Object.fromEntries(attributes);
  jsonObject = {
    format: "CHIP-0007",
    name: arrayOfObjects[index].Name,
    description: arrayOfObjects[index].Description,
    minting_tool: mintingTool[index],
    sensitive_content: false,
    series_number: arrayOfObjects[index].SeriesNumber,
    series_total: 420,
    attributes: [
      { trait_type: "gender", value: arrayOfObjects[index].Gender },
      { trait_type: "Hair", value: attributesObject.hair },
      { trait_type: "Eyes", value: attributesObject.eyes },
      { trait_type: "Teeth", value: attributesObject.teeth },
      { trait_type: "Clothing", value: attributesObject.clothings },
      { trait_type: "Accessories", value: attributesObject.accessories },
      { trait_type: "Expression", value: attributesObject.expression },
      { trait_type: "Strength", value: attributesObject.strength },
      { trait_type: "Weakness", value: attributesObject.weakness },
    ],
    collection: {
      name: "Zuri NFT Tickets for Free Lunch",
      id: "b774f676-c1d5-422e-beed-00ef5510c64d",
      attributes: [
        {
          type: "description",
          value: "Rewards for accomplishments during HNGi9",
        },
      ],
    },
  };
  const stringified = JSON.stringify(jsonObject);
  const hash = crypto.createHash("sha256").update(stringified).digest("hex");
  jsonObject["hash"] = hash;
  arrayOfObjects[index]["Hash"] = hash;
  const jsonContent = JSON.stringify(jsonObject);
  fs.writeFile(
    `./nfts/${arrayOfObjects[index].Filename}.json`,
    jsonContent,
    "utf8",
    function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    }
  );
}
const csvHeaders = Object.keys(arrayOfObjects[0]);
const csvString = [
  csvHeaders,
  ...arrayOfObjects.map((values) => [
    values.TeamNames,
    values.SeriesNumber,
    values.Filename,
    values.Name,
    values.Description,
    values.Gender,
    values.attributes,
    values.UUID,
    values.Hash,
  ]),
]
  .map((e) => e.join(","))
  .join("\n");
fs.writeFile("filename.output.csv", csvString, "utf8", function (err) {
  if (err) {
    console.log("An error occured while writing .csv to File.");
    return console.log(err);
  }

  console.log("File created successfully");
});
