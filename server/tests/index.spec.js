"use strict";

const path = require("path");
global._commonsDir = path.join(__dirname, "../../../common-helpers");
global._projectDir = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(__dirname, "../conf/.env") });

const sinon = require("sinon");
const winstonElasticsearchGenerator = require(`${
  global._commonsDir
  }/logger/winston-elasticsearch-generator`);

// Stub elasticTransport
sinon
  .stub(winstonElasticsearchGenerator, "getWinstonElasticsearchInstance")
  .callsFake(function () {
    return [];
  });
// Do not move ^^ function below databaseHelper or any other import that call logger

const databaseHelper = require("../../../common-helpers/helpers/database.helper");

describe("Everly auth-svc service Test", function () {
  before(function () {
    global.db = databaseHelper.init("development");
  });
  after(function () {
    winstonElasticsearchGenerator.getWinstonElasticsearchInstance.restore();
  });

  describe("Auth Module", function () {
    require("./modules/auth/methods/logout.method.spec");
    require("./modules/auth/methods/login.method.spec");
    require("./modules/auth/methods/authorize.method.spec");
  });
});
