import { _decorator, Component, Node, sys } from 'cc';
import bridge from 'dsbridge-cocos';
const { ccclass, property } = _decorator;

export class BridgeManager {
    public static callStart(success: Function) {
        switch (sys.os) {
            case sys.OS.ANDROID:
                if (bridge.hasNativeMethod("com.fed.game.start")) {
                    bridge.call("com.fed.game.start", null, function (ret) {
                        console.log("开始游戏 com.fed.game.start 收到消息:", JSON.stringify(ret));
                        if (JSON.stringify(ret)) {
                            success();
                        }
                    })
                }
                break;
            case sys.OS.IOS:
                window[""]
                break;
            case sys.OS.WINDOWS:
                break;
        }
    }

}

