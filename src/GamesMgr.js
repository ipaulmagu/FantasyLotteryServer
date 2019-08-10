const File = require("./AMFile");
const DefGames = require("./def-games");
const fs = require("fs");
const fetch = require("node-fetch");
const CfgLotteryUpdater = require("./lottoryUpdaterSchedule");

const log = console.log;

CONSTs = {
  cMin: 60 * 1000,
  cHour: 60 * this.cMin,
  cDay: 24 * this.cHour
};

class LocalStore {
  constructor(app, db) {
    this.app = app;
    this.app.localstore = this;
    this.store = db || localStorage;
  }
  getItem(key, defVal) {
    let ret = defVal || null;
    if (this.store) {
      let o = this.store.getItem(key);
      if (o) ret = o;
    }
    return ret;
  }
  setItem(key, v) {
    if (this.store) return this.store.setItem(key, v);
    return null;
  }
  removeItem(key) {
    if (this.store) return this.store.removeItem(key);
    return null;
  }
  clear() {
    if (this.store) this.store.clear;
  }
}

// var app = {
//   mgrDB: new DBMgr(app),
//   game: {},
//   localstore: new LocalStore(app, db),

//   db: { data, prob },
//   data: {}
// };

class GamesMgr {
  constructor(app) {
    this.DefGames = DefGames;
    // log("Lotteries:", this.DefGames);
    if (app) {
      this.app = app;
      this.app.mgrDB = this;
      this.app.DefGames = DefGames;
    }
    this.cfglu = CfgLotteryUpdater.read();
  }

  findGameById(gameid) {
    return this.DefGames.gamesById.get(gameid.toLowerCase());
  }
  // getDB(game, cb) {
  //   let g = game || this.app.game;
  // }
  // getRangeOfYears(data, saveDates = false) {
  //   let yStart = new Date(data[0][0]).getFullYear(),
  //     yLast = new Date(data[data.length - 1][0]).getFullYear();
  //   if (yStart > yLast) [yLast, yStart] = [yStart, yLast];
  //   if (saveDates) {
  //     app.db.yearFirst = yStart;
  //     app.db.yearLast = yLast;
  //   }
  //   return [yStart, yLast];
  // }
  // _initNewData_(data, cb) {
  //   app.db.data = data;
  //   this.getRangeOfYears(data, true);
  //   new IterLotto(this.app.db);
  //   this.app.db.prob = new Prob(this.app.db).init();
  //   if (cb) setTimeout(cb, 200);
  //   return true;
  // }
  retrieveFromStorage_(game, cb) {
    // retrieve data from storage if available and fresh
    let gameDataStoredObj = JSON.parse(this.app.localstore.getItem(game.id));
    if (gameDataStoredObj && gameDataStoredObj["data"] && gameDataStoredObj.data.length > 0) {
      let dtDif = new Date() - gameDataStoredObj.dt;
      if (dtDif / CONSTs.cHour < 2) return app.mgrDB._initNewData_(gameDataStoredObj.data, cb);
    }
    return false;
  }

  getData(gameid) {
    let need2Download = false;
    log(`getData for ${gameid}`);
    let odt = new Date(),
      dt = +odt;
    if (typeof gameid == "string") {
      need2Download = true;
      //gameid
      let game = this.findGameById(gameid);
      if (game) {
        gameid = game.id;
        if (File.exists(game.fname)) {
          let dtLastUpdate = +this.cfglu.get(gameid);
          let stat = File.stat(game.fname);
          let mt = +Math.floor((dt - stat.mtime) / CONSTs.cMin),
            at = +Math.floor((dt - stat.atime) / CONSTs.cMin),
            ct = +Math.floor((dt - stat.ctime) / CONSTs.cMin),
            lut = +Math.floor((dt - dtLastUpdate) / CONSTs.cMin);
          log(`mt:${mt}, ct:${ct}, at: ${at}, lut: ${lut}`);
          if (mt < 60 /**|| lut < 60 */) {
            log(`[GamesMgr.getData]reading ...${game.fname.substr(game.fname.length - 30, 50)}`);
            //if modified < 60 min ago read it. | redownload once/60 min at most.
            const lines = File.readCSV(game.fname);
            if (lines) {
              need2Download = false;
              return { status: 0, msg: "success", params: { gameid }, data: lines };
            }
          }
        }
      }
    }
    if (need2Download) {
      // log("about 2 download " + gameid);
      const d = this.downloadLottoData(gameid);
      this.cfglu.set(gameid, dt);
      CfgLotteryUpdater.save(this.cfglu); //save lotteryUPdaterScheduler
      return d;
    }
  }

  /**
   *
   * @param {*} gameid
   * return {status: 0|-1, msg: "Message" | ErrorMsg, data: NULL | lines}
   * lines = array of fields. [[f1,f2,...f9], [f1,f2,...f9], ....]
   */
  async downloadLottoData(gameid) {
    // log(`in downloadLottoData (${gameid})...`);
    let game = this.findGameById(gameid);
    // log(`Game: ${game} (${!game})`);
    if (!game || !game.url) {
      log(`Invalid gameid ${gameid}`);
      // if (cb) cb({ status: -1, msg: "Invalid Game", data: null });
      // return;
      return { status: -1, msg: "Invalid Game", data: null };
    }
    let sURL = game.url;
    // sURL = "/imr/eoddata/lottery/daily3.txt";
    log(`Downloading ... ${sURL.substr(sURL.length - 50, 50)}`);
    const resp = await fetch(sURL);
    // log("Fetched");
    const txt = await resp.text();
    // log(".text()", txt.substr(0, 500));
    // .then(res => {
    //   // log(`Fetch Received data`);
    //   // log(res)
    //   return res.text();
    // })
    // .then(txt =>{
    log("parsing...", txt.substr(0, 500));
    let iStartPos = -1,
      iCntFields = -1;
    let lines = [];
    txt.split("\n").forEach((aline, idx) => {
      if (iStartPos < 0) {
        let i = aline.indexOf("-------- ");
        if (i >= 0) {
          iStartPos = i + 11;
          iCntFields = aline.trim().split(/\s+/g).length;
        }
        return;
      }
      aline = aline.trim();
      if (aline.length < 1) return; //skip empty lines
      var fields = aline.split(/\s{2,}/g).filter((v, i) => i > 0); //[date, n, n, n, ...]
      fields = fields.map((n, i) => Number.parseInt(i == 0 ? +Date.parse(n) : n));
      lines.push(fields);
    });
    log("Saving to: ... " + game.fname.substr(game.fname.length - 30, 50) + " (" + lines.length + " lines)");
    File.savecsv(game.fname, lines);
    return { status: 0, msg: "success", params: { gameid }, data: lines };
    // if (cb) cb({ status: 0, msg: "success", params: { gameid }, data: lines });
    // log(`Fetched ${sURL}`);

    // })
    // .catch(err => {
    //   log(`catch():Error Fetching ${sURL}`);
    // });
  }
}

module.exports = {
  CONSTs,
  LocalStore,
  GamesMgr
};
