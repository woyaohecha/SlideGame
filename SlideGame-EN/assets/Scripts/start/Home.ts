import { _decorator, Component, Node, AudioSource, Sprite, game, Label, director } from 'cc';
import bridge from 'dsbridge-cocos';
import { GameData } from '../global/GameData';
import HttpUnit from '../NetWork/HttpUnit';
const { ccclass, property } = _decorator;

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

    btnStartGameEvent(): void {
        var self = this;
        console.log("开始游戏 com.fed.game.start 存在方法:", bridge.hasNativeMethod("com.fed.game.start"));
        if (bridge.hasNativeMethod("com.fed.game.start")) {
            bridge.call("com.fed.game.start", null, function (ret) {
                console.log("开始游戏 com.fed.game.start 收到消息:", JSON.stringify(ret));
                if (JSON.stringify(ret)) {
                    self.loadLayer.active = true;
                    self.audioSource.stop();
                    self.audioSource = null;
                    GameData.loadMusicConfig(() => {
                        director.preloadScene("game", () => {
                            director.loadScene("game");
                        });
                    })
                }
            })
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
        console.log("--------------- 准备调用原生api  存在方法", bridge.hasNativeMethod("com.fed.game.quit"));
        if (bridge.hasNativeMethod("com.fed.game.quit")) {
            bridge.call("com.fed.game.quit")
        }
    }

    openRule() {
        this.rule.active = true;
    }

    closeRule() {
        this.rule.active = false;
    }
}

