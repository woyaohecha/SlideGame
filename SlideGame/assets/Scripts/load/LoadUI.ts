/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-20 10:59:00
 * @FilePath: \main\assets\Scripts\load\LoadUI.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node, director, loader, JsonAsset, sys, game, LabelComponent, UITransform, view, macro, Canvas, find, Widget } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
import HttpUnit from '../NetWork/HttpUnit';
const { ccclass, property } = _decorator;

@ccclass('LoadUI')
export class LoadUI extends Component {

    @property({ type: Node })
    labelLoad: Node = null;
    @property({ type: Node })
    loadBar1: Node = null;
    @property({ type: Node })
    loadBar2: Node = null;

    @property({ type: Node })
    BallNode: Node = null;

    start() {
        game.frameRate = 59;
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            this.loadSubpackage();
        } else {
            this.preLoadScene();
        }

        HttpUnit.getUserInfoByToken();
    }

    /**
    * 加载分包资源
    */
    private loadSubpackage(): void {
        this.preLoadScene();
    }

    /**
     * 预加载场景
     */
    private preLoadScene(): void {
        director.preloadScene("game",
            (completedCount: number, totalCount: number, item: any) => {
                this.refreshLoadProgress(Math.floor(completedCount / totalCount * 100), "Scene Loding..." + Math.floor(completedCount / totalCount * 100) + "%");
            }, (error, sceneAsset) => {
                if (error) {
                    console.log(error)
                    return;
                }
                this.initGame();
            }
        );
        // this.initGame();
    }

    /**
     * 初始化
     */
    private initGame(): void {
        this.initPool();
    }

    /**
     * 初始化对象池
     */
    private initPool(): void {
        let self = this;
        let allNum: number = 1;
        let indexNum: number = 0;
        loader.loadRes("levelConfig/level", JsonAsset, (err, jsonRes) => {
            if (err) return;
            GlobalModel.getInstances().setLevelConfig(jsonRes.json);

            self.loadRes();
        });
    }

    loadResIndex = 0;
    loadRes() {
        let self = this;
        let allNum: number = 1;
        let indexNum: number = 0;
        var loadResArr = ["Ariana Grande - positions", "Clairo - Sinking", "Dierks Bentley - What Was I Thinkin'", "Fall Out Boy - Sugar We're Goin' Down", "Tabata Songs - Tabata Wod"];
        if (this.loadResIndex >= loadResArr.length) {
            indexNum++;
            self.checkPoolState(indexNum, allNum);
            return;
        }
        var loadResName = loadResArr[this.loadResIndex];

        console.log("--------------------- loadResName:", loadResName);
        loader.loadRes("levelConfig/" + loadResName, JsonAsset, (err, jsonRes) => {
            if (err) return;
            GlobalModel.getInstances().setLevelConfig_Test(jsonRes.json, loadResName, self.loadResIndex);
            self.loadResIndex++;
            self.loadRes();
        });
    }

    private checkPoolState(num: number, allNum: number): void {
        this.refreshLoadProgress(Math.floor(num / allNum * 100), "Resources Loding..." + Math.floor(num / allNum * 100) + "%");
        if (num >= allNum) {
            director.loadScene("start");
        }
    }

    /**
     * 刷新加载进度
     * progress  百分比
     */
    private refreshLoadProgress(progress: number, msg: string): void {
        this.labelLoad.getComponent(LabelComponent).string = msg;
        this.loadBar1.getComponent(UITransform).width = this.loadBar1.parent.getComponent(UITransform).width / 100 * progress;
        if (this.loadBar1.getComponent(UITransform).width > this.loadBar1.parent.getComponent(UITransform).width) {
            this.loadBar1.getComponent(UITransform).width = this.loadBar1.parent.getComponent(UITransform).width;
        }

        this.loadBar2.getComponent(UITransform).width = this.loadBar2.parent.getComponent(UITransform).width / 100 * progress;
        if (this.loadBar2.getComponent(UITransform).width > this.loadBar2.parent.getComponent(UITransform).width) {
            this.loadBar2.getComponent(UITransform).width = this.loadBar2.parent.getComponent(UITransform).width;
        }

        this.BallNode.getComponent(Widget).updateAlignment();
    }

    update(deltaTime: number) {

    }
}
