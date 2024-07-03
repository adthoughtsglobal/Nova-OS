// rotur

let username = "nva";
let packets = {}

var novaos = {
  shrinkString: function (str) {
    return window.parent.shrinkbsf(str)
  },
  unshrinkString: function (str) {
    return window.parent.unshrinkbsf(str)
  },
  ask: function (str) {
    return window.parent.ask(str)
  },
  say: function (str) {
    return window.parent.say(str)
  },
  justConfirm: function (...args) {
    return window.parent.justConfirm(args)
  },
  openFile: function (...args) {
    return window.parent.openfile(args)
  },
  OpenL: function (...args) {
    return window.parent.openlaunchprotocol(args)
  },
  notify: function (...args) {
    return window.parent.notify(args)
  },
  appInstances: function () {
    return window.parent.winds;
  },
  genUID: function () {
    return genUID();
  },
  roturConnect: function () {
    var ws = new WebSocket("wss://rotur.milosantos.com");
    ws.onopen = function () {
      ws.send("NovaOS connected to Rotur");
    };
    ws.onmessage = function (evt) {
      console.log("Rotur: recived: " + evt.data);
    };
    ws.onclose = function () {
      console.log("Connection closed");
    };

  },
  createFile: function(...args) {
    return window.parent.createFile(args);
  },
  getFileById: function(...args) {
    return window.parent.getFileById(args);
  },
  getFileByPath: function(...args) {
    return window.parent.getFileByPath(args);
  },
  getFileNamesByFolder: function(...args) {
    return window.parent.getFileNamesByFolder(args);
  }
}

var ws; // rotur ws

var rotur = {
  sendMessage: function (...args) {
    roturJS.sendMessage(args)
  },
  connect: function () {
    qsetsRefresh()
    
    username = "nva-" + genUID();
    try {
      if (qsetscache.roturName) {
        username = "nva-" + qsetscache.roturName;
      }
    } catch(err) {
console.error(err)
    }
    ws = new WebSocket("wss://rotur.milosantos.com");
    var altwssend = ws.send;

    ws.send = function (str) {
      console.log("Rotur: sent: " + str);
      altwssend.call(ws, str);
    };
    ws.onopen = function () {
      roturJS.sendHandshake();

    }
    ws.onmessage = function (event) {
      console.log("Rotur: recived: " + event.data);

      packet = JSON.parse(event.data);
      let client = {};
      if (packet.cmd == "client_ip") {
        client.ip = packet.val;
      } else if (packet.cmd == "client_obj") {
        client.username = packet.val.username;
      } else if (packet.cmd == "ulist") {
        if (packet.mode == "add") {
          client.users.push(packet.val);
        } else if (packet.mode == "remove") {
          client.users = client.users.filter(user => user != packet.val);
        } else if (packet.mode == "set") {
          client.users = packet.val;
        }
      }
      if (packet.cmd == "pmsg") {
        packet.origin = packet.origin.username;
        delete packet.rooms
        delete packet.cmd
        packet.client = packet.val.client
        packet.source = packet.val.source
        packet.payload = packet.val.payload
        if (!packets[packet.target]) {
          packets[packet.val.target] = []
        }
        packets[packet.val.target].push(packet);
        delete packet.val
      }
      if (packet.listener == "handshake_cfg") {
        roturJS.setUsername(username);
      }
      if (packet.listener == "set_username_cfg") {
        client.username = username;
        roturJS.linkRoom(["roturTW"]);
      }
      if (packet.listener == "link_cfg") {
        client.room = packet.val
      }
    };
    ws.onclose = function () {
      console.log("Connection closed");
    };

  }
}

// rotur

var roturJS = {
  sendHandshake: function(){
    msg = {
      "cmd": "handshake",
      "val": {
        "language": "Javascript",
        "version": {
          "editorType": "NovaOS",
          "versionNumber": null
        }
      },
      "listener": "handshake_cfg"
    }
  
    ws.send(JSON.stringify(msg));
  },
  setUsername: function() {
      msg = {
        "cmd": "setid",
        "val": username,
        "listener": "set_username_cfg"
      }
    
      ws.send(JSON.stringify(msg));
    },
    linkRoom:function(room) {
      msg = {
        "cmd": "link",
        "val": room,
        "listener": "link_cfg"
      }
    
      ws.send(JSON.stringify(msg));
    },
    replyToPacket: function(message) {
      msg = {
        "cmd": "pmsg",
        "val": {
          "target": message.source,
          "message": "Hello, " + message.origin + "!"
        },
        "id": message.origin
      }
    
      ws.send(JSON.stringify(msg));
    },
    sendMessage: function(payload, username, target, source) {
      msg = {
        "cmd": "pmsg",
        "val": {
          "target": target,
          "payload": payload,
          "source": source
        },
        "id": username
      }
    
      ws.send(JSON.stringify(msg));
    }
}
function sendHandshake() {
  msg = {
    "cmd": "handshake",
    "val": {
      "language": "Javascript",
      "version": {
        "editorType": "NovaOS",
        "versionNumber": null
      }
    },
    "listener": "handshake_cfg"
  }

  ws.send(JSON.stringify(msg));
}