const { getGameData } = require("../controlers/controlers");
const log = console.log;

module.exports = {
  hello() {
    log("Hello()");
    return { text: "Hello World!", views: 1234 };
  },

  async getLottoData({ gameid }, req) {
    log(`graphQLResolver.getLottoData ('${gameid}')`);
    const data = await getGameData(gameid);
    // log("typeof data:" + typeof data.data);
    // log("data:" + JSON.stringify(data).substr(0, 200));
    return data; //{ status: 0, msg: "success", params: { gameid }, data: data.data };
  }
};
