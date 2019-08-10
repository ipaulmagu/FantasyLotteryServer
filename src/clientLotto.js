const socket = require("socket.io-client")("http://localhost:4000", { forceNew: false });
let sid = "Client: ";
const log = console.log;

socket.on("init", data => {
  log(sid + "[init]= ", data.statusMsg);
});

socket.on("connect", () => {
  log(sid + "[Connect]");
  // log("------------Sending Request for twit subscription --------- ");
  log(sid + "Requesting Lotto data...");
  socket.emit("req", { op: "Get.Lotto.Game.Data", ver: "2", params: { gameid: "PowerBall-ca-us" } });
});
socket.on("Get.Lotto.Game.Data", data => {
  // log(sid + ` Recieved ${data},...`);
  log(sid + ` Recieved ${JSON.stringify(data).substr(0, 100)},...`);
  // log(
  //   sid +
  //     ` Recieved ${JSON.stringify({
  //       status: data.status,
  //       msg: data.msg,
  //       params: data.params
  //       d: data.data.substr(0, 200)
  //     }).substr(0, 100)},...`
  // );
});
socket.on("data", data => {
  log(sid + "[data]= ", data, data.length);
});
