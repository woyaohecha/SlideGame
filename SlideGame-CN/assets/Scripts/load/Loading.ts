import { _decorator, Component, Node, director, sys, ProgressBar, UITransform, profiler } from 'cc';
import { GameData, OS } from '../global/GameData';
import HttpUnit from '../NetWork/HttpUnit';

const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends Component {

    @property(ProgressBar)
    loadingBar: ProgressBar = null;

    ball: Node = null;
    ballMoveLength: number = 0;

    onLoad() {
        director.preloadScene("start");
        this.ball = this.loadingBar.node.getChildByName("Bar").getChildByName("BallNode");
        profiler.hideStats();
        if (sys.isMobile) {
            if (sys.os === sys.OS.IOS) {
                console.log("当前运行的系统是 iOS");
                GameData.OS = OS.IOS;
            } else if (sys.os === sys.OS.ANDROID) {
                console.log("当前运行的系统是 Android");
                GameData.OS = OS.ANDROID;
            }
        }
    }

    start() {
        this.ballMoveLength = this.ball.parent.getComponent(UITransform).contentSize.width - this.ball.getComponent(UITransform).width;
        this.setBar(0);
        this.loadRes();
    }

    update() {
        this.loadBar();
    }


    loadRes() {
        HttpUnit.getUserInfoByToken();
        GameData.loadMusicListConfig();
    }

    setBar(value) {
        if (value >= 1) {
            value = 1;
        }
        this.loadingBar.progress = value;
        let posX = this.ball.getComponent(UITransform).width / 2 + value * this.ballMoveLength;
        this.ball.setPosition(posX, 0);
    }

    loadBar() {
        if (this.loadingBar.progress >= 1) {
            return;
        }
        if (this.loadingBar.progress <= 0.9) {
            let value = this.loadingBar.progress + 0.05 * Math.random();
            this.setBar(value);
        } else {
            if (GameData.musicListConfig && HttpUnit.UserInfo) {
                let value = this.loadingBar.progress + 0.05 * Math.random();
                this.setBar(value);
            }
        }
        if (this.loadingBar.progress >= 1) {
            director.loadScene("start");
        }
    }
}

