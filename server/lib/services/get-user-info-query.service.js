'use strict';

((getUserInfoService) => {
  // const databaseQueryHandler = require(`${global._commonsDir}/helpers/database-handler.helper`);
  // const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);

  getUserInfoService.getInfo = async ({ call, debug }) => {
    try {
      return Promise.resolve([{
        type: 1,
        password: "password",
        status: 1,
        userId: "338512f2-2eea-11eb-9f32-7759926e4923",
        uuid: "422a8b06-2ee6-11eb-9b9a-7be013da2dc7",
        id: 1
      }])
    } catch (err) {
      throw new Error(err);
    }
  };
})(module.exports);
