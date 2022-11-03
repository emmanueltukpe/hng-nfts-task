const fs = require("fs");
csv = fs.readFileSync("./HNG.csv");
const crypto = require("node:crypto");

var array = csv.toString().split("\r");

const keys = array[0].split(",");
keys[0] = "SeriesNumber";
array.shift();

for (var i = 0; i < array.length; ++i) {
  array[i] = array[i].replace(/(\n)/gm, "");
  array[i].trim();
}

const teams = array.filter((i) => i.indexOf("TEAM") !== -1);
const values = array.filter(
  (i) => i.indexOf("TEAM") == -1 && i.indexOf(",,,,,,") == -1
);
const splitted = values.map((i) => {
  const q = i.split(",");
  for (let j = 0; j < q.length; j++) {
    if (q[j].startsWith('"')) {
      q[j] = q[j] + "," + q[j + 1];
      q.splice(j + 1, 1);
    }
    if (q[j].startsWith(" ")) {
      q[j - 1] = q[j - 1] + "," + q[j];
      q.splice(j, 1);
      j--;
    }
  }
  return q;
});
const commasRemoved = teams.map((i) => i.replaceAll(",", ""));
const mintingTool = [];

for (let i = 0, k = 1; i < commasRemoved.length; k++) {
  mintingTool.push(commasRemoved[i]);
  if (k % 20 === 0) {
    i++;
  }
}
const arrayOfObjects = [];
for (let index = 0; index < splitted.length; index++) {
  const objects = {};
  keys.forEach((key, i) => (objects[key] = splitted[index][i]));
  arrayOfObjects.push(objects);
}

//console.log(arrayOfObjects);
const nfts = [];
for (let index = 0; index < arrayOfObjects.length; index++) {
  jsonObject = {
    format: "CHIP-0007",
    name: arrayOfObjects[index].Name,
    description: arrayOfObjects[index].Description,
    minting_tool: mintingTool[index],
    sensitive_content: false,
    series_number: arrayOfObjects[index].SeriesNumber,
    series_total: 420,

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
    gender: arrayOfObjects[index].Gender,
    uuid: arrayOfObjects[index].UUID,
  };
  const stringified = JSON.stringify(jsonObject);
  const hash = crypto.createHash("sha256").update(stringified).digest("hex");
  jsonObject["hash"] = hash;
  arrayOfObjects[index]["Hash"] = hash;
  nfts.push(jsonObject);
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

      console.log(index);
    }
  );
}

const csvHeaders = Object.keys(arrayOfObjects[0]);
const csvString = [
  csvHeaders,
  ...arrayOfObjects.map((values) => [
    values.SeriesNumber,
    values.Filename,
    values.Name,
    values.Description,
    values.Gender,
    values.Attributes,
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
