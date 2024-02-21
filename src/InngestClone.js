const fs = require("fs");
const dedent = require("dedent-js");

const path = __dirname;

class InngestClone {
  constructor() {
    this.functions = {};
  }

  async createFunction(eventId, callback) {
    this.functions[eventId] = callback;

    const funcJS = dedent(`
      const ${eventId} = ${callback};

      module.exports = ${eventId};
    `);

    await fs.writeFile(
      `${path}/functions/${eventId}.js`,
      funcJS,
      function (err) {
        if (err) throw err;
      }
    );
  }

  async createAPI(endpoints) {
    // Remove any existing index.js
    await fs.promises.unlink(`${path}/index.js`, function (err) {
      if (err) throw err;
    });

    // Copy the index template to /src
    await fs.copyFile(
      `${path}/templates/index.js`,
      `${path}/index.js`,
      function (err) {
        if (err) throw err;
      }
    );

    // Initialize an array for keeping track of the code about to be written to /src/index.js
    let routerJS = [];

    await Promise.all(
      Object.keys(endpoints).map(async (ep) => {
        // For each endpoint, split it into its directory and file by splitting on the last slash
        let [epDir, epFile] = ep.split(/\/(?![^\/]*\/)/);
        // Edge case if the endpoint is just a file with no directory
        if (epFile === undefined) {
          [epDir, epFile] = ["", epDir];
        }

        // Push a router into src/index for the newly created route
        routerJS.push(
          `app.use("/api/${ep}", require("./routes/api/${ep}.js"));`
        );

        // Create the directory on the local file system for the file
        await fs.promises.mkdir(`${path}/routes/api/${epDir}`, {
          recursive: true,
        });

        // Initialize imports for the new route file
        let routeJS = dedent(`
          const express = require("express");
          const InnjestClone = require("${path}/index.js");

          const router = express.Router();
        `);

        // For each method passed as a key, create a router endpoint in the
        // route file with that method name and its associated function
        routeJS += Object.keys(endpoints[ep])
          .map((method) => {
            return dedent(`\n\n
            router.${method.toLowerCase()}("/", (req, res) => {
              const func = require("${path}/functions/${
              endpoints[ep][method]
            }.js");
              res.send(func());
            });
          `);
          })
          .join("");

        // Append the necessary router export to the end of the file
        routeJS += "\n\nmodule.exports = router;";

        // Create the file and write the above calculated text to it
        await fs.writeFile(
          `${path}/routes/api/${epDir}/${epFile}.js`,
          routeJS,
          function (err) {
            if (err) throw err;
          }
        );
      })
    );

    // Replace the placeholder comment in src/index.js with the router
    // info for all the new route files
    fs.readFile(`${path}/index.js`, "utf8", function (err, data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/\/\/ Routes go here/g, routerJS.join("\n"));

      fs.writeFile(`${path}/index.js`, result, "utf8", function (err) {
        if (err) return console.log(err);
      });
    });
  }
}

const mockData = {
  example: {
    GET: "exampleGetEvent",
    POST: "thisIsAPostEvent",
    PUT: "putEvent",
  },
  "another/example": {
    GET: "exampleGetEvent",
    DELETE: "deleteEvent",
  },
  "another/example/again": {
    GET: "aDifferentGetEvent",
  },
};

const mockFuncData = {
  exampleGetEvent: () => "exampleGetEvent",
  thisIsAPostEvent: () => "thisIsAPostEvent",
  putEvent: () => "putEvent",
  deleteEvent: () => "deleteEvent",
  aDifferentGetEvent: () => "aDifferentGetEvent",
};

const test = new InngestClone();
Object.keys(mockFuncData).forEach((key) => {
  test.createFunction(key, mockFuncData[key]);
});
test.createAPI(mockData);
