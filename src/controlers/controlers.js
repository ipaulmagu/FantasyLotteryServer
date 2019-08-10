const { GamesMgr } = require("../GamesMgr");
const log = console.log;

const hSetRespHeaders = function(req, res, next) {
  // Compress if possible
  // res.setHeader("Content-Encoding", "gzip, deflate"); // does not work
  // res.setHeader("Vary", "Accept-Encoding");
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method == "OPTIONS") {
    return res.sendStatus(200);
  }
  // log("Set Response handler");
  next();
};

const hLottoRequests = (req, res, next) => {
  log("hLottoRequests:", req);
  // next();
};

const h404 = function(req, res, next) {
  log("404");
  res.setHeader("content-type", "application/json");
  res.statusCode = 404;
  res.send({ status: 404, statusMsg: "Unknown Request--use Api: i.e. /lotto/game/gameid" });
  // next();
};
const hGetGameData = async (req, res, next) => {
  // res.send(`LottoRequest for ${req.method} ${req.params.gameid} Data`);
  const data = await getGameData(req.params.gameid);
  // const data = await getGameData(req.params.gameid, data => {
  // // log("hGetGameData");
  //   res.setHeader("Content-Type", "text/html");
  //   res.send(JSON.stringify(data));
  //   // return data.status == 200 ? 0 : -1;
  // });
  // if (data){
  // log("hGetGameData:: Respond data ...", JSON.stringify(data).substr(0, 200), "......");
  res.setHeader("Content-Type", "application/json");
  res.send(data);
  // res.send(JSON.stringify(data));
  // }
  // next();
};
async function getGameData(gameid) {
  log(`getGameData ('${gameid}')...`);
  const mgr = new GamesMgr();
  const o = await mgr.getData(gameid); //, o => {
  // log(`getGameData: ${JSON.stringify(o).substr(0, 500)}`);
  if (o.status == 0) {
    log(`getGameData: SUCCESS`);
    return { status: 200, msg: "success", params: { gameid }, data: o.data.map(aline => aline.join(",")).join("\n") };
  } else {
    log(`getGameData: ERROR`);
    let d = { status: o.status, msg: o.msg, params: { gameid }, data: null };
    // log("data:...", JSON.stringify(d).substr(0, 200));
    return d;
  }
  // });
}

const hLottoAdmin = (req, res, next) => {
  res.send("Welcome to admin/manager page");
  log("ServerLotto: /admin, /manager");
  // next();
};
module.exports = {
  hSetRespHeaders,
  hLottoRequests,
  h404,
  hGetGameData,
  getGameData,
  hLottoAdmin
};
