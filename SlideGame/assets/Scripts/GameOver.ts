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
import { _decorator, Component, Node, director, Label } from 'cc';
import bridge from 'dsbridge-cocos';
import DataController from './common/DataController';
import { GlobalModel } from './global/GlobalModel';
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

    start() {
        this.node.getChildByName("RankScrollView").getComponent(RankScrollView).UpDateRank();

        this.FailNode.active = false;
        this.PassLevelNode.active = false;

        this.InitData();

        console.log("游戏结束 存在方法:", bridge.hasNativeMethod("com.fed.game.stop"));
        if (bridge.hasNativeMethod("com.fed.game.stop")) {
            bridge.call("com.fed.game.stop")
        }
    }

    update(deltaTime: number) {

    }

    InitData() {
        let GameOver = GlobalModel.getInstances().getGameOver();
        if (GameOver == 0) {
            this.FailNode.active = true;
        } else if (GameOver == 1) {
            this.PassLevelNode.active = true;
        }

        let musicName = GlobalModel.getInstances().getMisicNameLevel();
        if (musicName.length > 10) {
            musicName = musicName.slice(0, 10) + "...";
        }
        // this.Music.string = GlobalModel.getInstances().getMisicNameLevel();
        this.Music.string = musicName;

        // this.Duration.string = GlobalModel.getInstances().getTimeLabel();
        this.Duration.string = GlobalModel.getInstances().playTime + '';

        this.SlideGoals.string = GlobalModel.getInstances().getGameNumLabel();

        this.SlideAchievement.string = Math.floor(GlobalModel.getInstances().getGameProgressBar() * 100) + "%";

        this.MaxCOMBO.string = GlobalModel.getInstances().getMaxCOMBO() + "";

        this.MISS.string = GlobalModel.getInstances().getMISS() + "";
    }

    OnReturnBtn() {
        director.preloadScene("start", () => {
            director.loadScene("start");
        });
    }

    OnRestartBtn() {
        console.log("重新开始游戏 com.fed.game.start 存在方法:", bridge.hasNativeMethod("com.fed.game.start"));
        if (bridge.hasNativeMethod("com.fed.game.start")) {
            bridge.call("com.fed.game.start", null, function (ret) {
                console.log("重新开始游戏 com.fed.game.start 收到消息:", JSON.stringify(ret));
                if (JSON.stringify(ret)) {
                    director.preloadScene("game", () => {
                        director.loadScene("game");
                    });
                }
            })
        }
    }
}

