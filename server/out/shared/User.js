"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserType = exports.OnlineStatus = void 0;
var OnlineStatus;
(function (OnlineStatus) {
    OnlineStatus[OnlineStatus["online"] = 0] = "online";
    OnlineStatus[OnlineStatus["offline"] = 1] = "offline";
})(OnlineStatus = exports.OnlineStatus || (exports.OnlineStatus = {}));
var UserType;
(function (UserType) {
    UserType[UserType["Player"] = 0] = "Player";
    UserType[UserType["Spectator"] = 1] = "Spectator";
})(UserType = exports.UserType || (exports.UserType = {}));
//# sourceMappingURL=User.js.map