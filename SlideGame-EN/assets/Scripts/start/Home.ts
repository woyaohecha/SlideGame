import { _decorator, Component, Node, AudioSource, Sprite, game, Label, director } from 'cc';
import bridge from 'dsbridge-cocos';
import { GameData, OS } from '../global/GameData';
import HttpUnit from '../NetWork/HttpUnit';
const { ccclass, property } = _decorator;

export const _window = window as any;

@ccclass('Home')
export class Home extends Component {

    @property(Sprite)
    userProfile: Sprite = null;

    @property(Label)
    userName: Label = null;

    @property(Node)
    playerInfo: Node = null;

    @property(Node)
    rule: Node = null;

    @property(Node)
    loadLayer: Node = null;

    audioSource: AudioSource = null;


    onLoad() {
        this.audioSource = this.getComponent(AudioSource);
        window["startCallback"] = this.startCallback.bind(this);//开始游戏调用原生start后的回调方法
    }

    start() {
        this.initHome();
    }

    initHome() {
        GameData.loadMusic(0, (clip) => {
            this.audioSource.clip = clip;
            this.audioSource.play();
        })

        this.userName.string = HttpUnit.UserInfo.nickname;
        HttpUnit.loadUserProfile(() => {
            this.userProfile.spriteFrame = HttpUnit.userProfile;
        })
    }

    openPlayerInfo() {
        this.playerInfo.active = true;
    }

    closePlayerInfo() {
        this.playerInfo.active = false;
    }

    //原生回调,开始游戏
    startCallback() {
        this.loadLayer.active = true;
        this.audioSource.stop();
        this.audioSource = null;
        GameData.loadMusicConfig(() => {
            director.preloadScene("game", () => {
                director.loadScene("game");
            });
        })
    }

    btnStartGameEvent(): void {
        var self = this;
        if (GameData.OS == OS.ANDROID) {
            console.log("开始游戏 com.fed.game.start_android 存在方法:", bridge.hasNativeMethod("com.fed.game.android"));
            if (bridge.hasNativeMethod("com.fed.game.start_android")) {
                bridge.call("com.fed.game.start", null, function (ret) {
                    if (JSON.stringify(ret)) {
                        self.startCallback();
                    }
                })
            }
        } else {
            _window.webkit.messageHandlers.start_ios.postMessage("");
        }


        // self.loadLayer.active = true;
        // self.audioSource.stop();
        // self.audioSource = null;
        // GameData.loadMusicConfig(() => {
        //     director.preloadScene("game", () => {
        //         director.loadScene("game");
        //     });
        // })
    }

    btnQuitGameEvent(): void {
        if (GameData.OS == OS.ANDROID) {
            console.log("--------------- 准备调用原生api  存在方法", bridge.hasNativeMethod("com.fed.game.quit_android"));
            if (bridge.hasNativeMethod("com.fed.game.quit_android")) {
                bridge.call("com.fed.game.quit_android")
            }
        } else {
            _window.webkit.messageHandlers.quit_ios.postMessage("");
        }

    }

    openRule() {
        this.rule.active = true;
    }

    closeRule() {
        this.rule.active = false;
    }
}

