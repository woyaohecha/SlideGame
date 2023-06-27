/*
 * @Author: 林武
 * @Date: 2023-04-18 09:34:06
 * @LastEditors: 林武
 * @LastEditTime: 2023-05-18 10:47:31
 * @FilePath: \main\assets\Scripts\GameOver.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */
import { _decorator, Component, Node, director, Label, math } from 'cc';
import bridge from 'dsbridge-cocos';
import DataController from './common/DataController';
import { GameData, OS } from './global/GameData';
import { GlobalModel } from './global/GlobalModel';
import { _window } from './start/Home';
import { RankScrollView } from './start/RankScrollView';
const { ccclass, property } = _decorator;

@ccclass('GameOver')
export class GameOver extends Component {
    @property({ type: Node })
    FailNode: Node = null;

    @property({ type: Node })
    PassLevelNode: Node = null;

    @property({ type: Label })
    Music: Label = null;

    @property({ type: Label })
    Duration: Label = null;

    @property({ type: Label })
    SlideGoals: Label = null;

    @property({ type: Label })
    SlideAchievement: Label = null;

    @property({ type: Label })
    MaxCOMBO: Label = null;

    @property({ type: Label })
    MISS: Label = null;

    onLoad() {
        window["restartCallback"] = this.restartCallback.bind(this);//开始游戏调用原生start后的回调方法
    }

    start() {
        this.node.getChildByName("RankScrollView").getComponent(RankScrollView).UpDateRank();

        this.FailNode.active = false;
        this.PassLevelNode.active = false;

        this.InitData();

        switch (GameData.OS) {
            case OS.ANDROID:
                console.log("游戏结束 存在方法:", bridge.hasNativeMethod("com.fed.game.stop_android"));
                if (bridge.hasNativeMethod("com.fed.game.stop_android")) {
                    bridge.call("com.fed.game.stop_android")
                }
                break;
            case OS.IOS:
                _window.webkit.messageHandlers.stop_ios.postMessage("");
                break;
            default:
                break;
        }
    }

    update(deltaTime: number) {

    }

    InitData() {
        // let GameOver = GlobalModel.getInstances().getGameOver();
        let goals = Number(GameData.musicListConfig[GameData.currentMusicIndex].slideGoals.slice(0, 3));
        console.log("goals-------------:", goals);
        let completedCount = Number(GlobalModel.getInstances().getGameNumLabel().split("/")[0]);

        if (goals <= completedCount) {
            this.FailNode.active = false;
            this.PassLevelNode.active = true;
        } else {
            this.FailNode.active = true;
            this.PassLevelNode.active = false;
        }

        let musicName = GameData.currentMusicName;
        if (musicName.length > 10) {
            musicName = musicName.slice(0, 10) + "...";
        }
        // this.Music.string = GlobalModel.getInstances().getMisicNameLevel();
        this.Music.string = musicName;

        // this.Duration.string = GlobalModel.getInstances().getTimeLabel();
        this.Duration.string = GameData.playTime;

        this.SlideGoals.string = GlobalModel.getInstances().getGameNumLabel();

        this.SlideAchievement.string = Math.floor(GlobalModel.getInstances().getGameProgressBar() * 100) + "%";

        this.MaxCOMBO.string = GlobalModel.getInstances().getMaxCOMBO() + "";

        this.MISS.string = GlobalModel.getInstances().getMISS() + "";
    }

    OnReturnBtn() {
        GameData.loadMusic(0, () => {
            director.loadScene("start");
        });
        // director.preloadScene("start", () => {
        //     // GameData.currentMusicIndex = 0;
        //     director.loadScene("start");
        // });
    }

    OnRestartBtn() {
        let self = this;
        switch (GameData.OS) {
            case OS.ANDROID:
                console.log("重新开始---调用android原生方法---com.fed.game.start_android是否存在:", bridge.hasNativeMethod("com.fed.game.start_android"));
                if (bridge.hasNativeMethod("com.fed.game.start_android")) {
                    bridge.call("com.fed.game.start_android", null, function (ret) {
                        console.log("开始游戏 com.fed.game.start_android 收到消息:", JSON.stringify(ret));
                        if (JSON.stringify(ret)) {
                            self.restartCallback();
                        }
                    })
                }
                break;
            case OS.IOS:
                console.log("重新开始---调用ios原生方法---restart_ios");
                _window.webkit.messageHandlers.restart_ios.postMessage("");
                break;
            default:
                console.log("重新开始---浏览器不调用方法---直接进入")
                self.restartCallback();
                break;
        }
    }

    restartCallback() {
        director.preloadScene("game", () => {
            director.loadScene("game");
        });
    }
}

