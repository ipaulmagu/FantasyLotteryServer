const express = require("express");
const path = require("path");

// const bodyparser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const { hSetRespHeaders, h404, hGetGameData, hLottoAdmin, getGameData } = require("./controlers/controlers");
const graphqlHttp = require("express-graphql");
const { HelloWorldSchema, LottoSchema } = require("./graphql/schema");
const ResHello = require("./graphql/resolvers");
// const CfgLotteryUpdater = require("./lottoryUpdaterSchedule");
// cfglu = CfgLotteryUpdater.read();
var app = express();

var log = console.log;
// app.use(express.urlencoded());
// app.use(bodyparser.urlencoded());
// app.use(helmet());
app.use(compression({ level: 6 }));

// log("app:after raed::", JSON.stringify([...cfglu.entries()]));
// CfgLotteryUpdater.save(cfglu);
// return;

var serverLottery = express.Router();

app.use("/", hSetRespHeaders);

// log(path.join(__dirname, "/public"));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/src", express.static(path.join(__dirname, "../src")));
app.use("/src/css", express.static(path.join(__dirname, "../src", "/css")));
app.use("/admin", hLottoAdmin);
serverLottery.use(["/admin", "/manager"], hLottoAdmin);
serverLottery.use("/game/:gameid", hGetGameData); // "lotto/game/daily3-ca-us"
// serverLottery.use("/", h404);
app.use("/lotto", serverLottery);

app.use(
  "/graphql",
  graphqlHttp({
    schema: HelloWorldSchema,
    rootValue: ResHello,
    graphiql: true
  })
);
// app.use(
//   "/graphql",
//   graphqlHttp({
//     schema: LottoSchema,
//     rootValue: ResHello
//   })
// );
console.log("[Server] GRAphQL @ localhost:1000/graphql");
app.get("/", h404);

const server = app.listen(1000);
console.log("[Server] Rest @ localhost:1000/lotto/game/:gameid");

/**
 * Lottery Server Via WebSockets
 */
const io = require("./socketGame").init(app.listen(4000));
io.on("connection", socket => {
  const serverid = "WebSockets:4000=>";
  log(`${serverid} user '${socket.id}' Connected`);
  socket.on("disconnect", function() {
    log(`${serverid} user '${socket.id}' disconnected`);
  });
  socket.on("req", async reqSoc => {
    log(`${serverid} Request ${JSON.stringify(reqSoc)}`);
    switch (reqSoc.op) {
      case "Get.Lotto.Game.Data":
        let data = await getGameData(reqSoc.params.gameid);
        // , data => {
        // log(`${serverid} Sending ${JSON.stringify(data).substr(0, 100)} ....`);
        sendMsg(socket, "Get.Lotto.Game.Data", data);
        //});
        break;
    }
  });
});
console.log("[Server] WebSockets @ localhost:4000 {event:'req', {op:'Get.Lotto.Game.Data', params:{gameid:''}}}");

function sendMsg(socket, event, data) {
  socket.emit(event, data);
}

/**
 * GraphQL
 */
