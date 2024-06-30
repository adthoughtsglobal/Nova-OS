var novaos = {
    shrinkString: function(str) {
        return window.parent.shrinkbsf(str)
    },
    unshrinkString: function(str) {
        return window.parent.unshrinkbsf(str)
    },
    ask: function(str) {
        return window.parent.ask(str)
    },
    say: function(str) {
        return window.parent.say(str)
    },
    justConfirm: function(...args) {
        return window.parent.justConfirm(args)
    },
    openFile: function(...args) {
        return window.parent.openfile(args)
    },
    OpenL: function(...args) {
        return window.parent.openlaunchprotocol(args)
    },
    notify: function(...args) {
        return window.parent.notify(args)
    },
    appInstances: function() {
        return window.parent.winds;
    },
    roturConnect: function() {
        var ws = new WebSocket("ws://localhost:8080");
        ws.onopen = function() {
            ws.send("NovaOS connected to Rotur");
        };
        ws.onmessage = function (evt) {
            console.log(evt.data);
        };
        ws.onclose = function() {
            console.log("Connection closed");
        };
        
    }
}