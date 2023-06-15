/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-05-20 10:34:48
 * @FilePath: \SlideGame\assets\Scripts\game\GameUI.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node, instantiate, Vec2, Vec3, AudioClip, loader, JsonAsset, Prefab, EventTouch, tween, AudioSourceComponent, director, Input, input, EventKeyboard, EventMouse, Label, game, Game, ProgressBar, AudioSource, ParticleSystem, v3, CCObject, Size, view, math, profiler, animation, SkeletalAnimation, CurveRange, easing, debug, FogInfo, SkyboxInfo } from 'cc';
import { IGameUI } from './GameContract';
import { GamePresenter } from './GamePresenter';
import { GlobalModel } from '../global/GlobalModel';

import HttpUnit from '../NetWork/HttpUnit';
import bridge from 'dsbridge-cocos';
import { GameData } from '../global/GameData';

const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component implements IGameUI {

    @property({ type: Node })
    cameraNode: Node = null;
    @property({ type: Node })
    gameNode: Node = null;
    @property({ type: Node })
    playerNode: Node = null;
    @property({ type: Node })
    PauseNode: Node = null;
    @property({ type: Node })
    GameStartNode: Node = null;
    @property({ type: Label })
    TimeLabel: Label = null;
    @property({ type: Label })
    PlsyScoreLabel: Label = null;
    @property({ type: ProgressBar })
    GameProgressBar: ProgressBar = null;
    @property({ type: Label })
    GameNumLabel: Label = null;
    @property({ type: Node })
    DemonstrationNode: Node = null;
    @property({ type: Node })
    MissNode: Node = null;
    @property({ type: Node })
    GreatNode: Node = null;
    @property({ type: Node })
    PerfectNode: Node = null;
    @property({ type: Node })
    S_PerfectNode: Node = null;
    @property({ type: Node })
    ComboNode: Node = null;
    @property({ type: Node })
    SpeedNode: Node = null;
    @property({ type: Node })
    SlowNode: Node = null;
    @property(ParticleSystem)
    snow: ParticleSystem = null;

    private mGamePresenter: GamePresenter = null;
    /**
     * 相机个玩家的x,y,z轴 的坐标
     */
    private xPos: number = 0;
    private yPos: number = 0;
    private zPos: number = 5;
    /**
     * 玩家跳动速度
     */
    private playerJumpSpeed: number = 0.025;
    /**
     * 创建场景物体的y轴
     */
    private createEnvZ: number = 0;

    /**
    * 点击屏幕坐标
    */
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    /**
     * 存储台子
     */
    private stageArr: Array<Node> = null;

    /**
     * 开始游戏的时间
     */
    private StartGetTime: number = 0;

    /**
     * 当前游戏的时间
     */
    private NowGetTime: number = 0;

    /**
     * 暂停的时间
     */
    private PauseGetTime: number = 0;

    /**
     * 速度
     */
    private Speed: number = 1 / 10;

    /**
     * 开始游戏倒计时
     */
    private GameStarTime: number = 3;

    /**
     * 最后一个点的时间
     */
    private LastPointData: number = 0;

    private IsStart: boolean = false;

    private PlsyScore: number = 0;

    private PointDataLength: number = 0;

    @property({ type: Node })
    prefab: Node = null;
    @property({ type: Prefab })
    sea0: Prefab = null;
    @property({ type: Prefab })
    sea1: Prefab = null;
    @property({ type: Prefab })
    sea2: Prefab = null;
    @property({ type: Prefab })
    sea3: Prefab = null;

    @property(Node)
    leftHit: Node = null;
    @property(Node)
    rightHit: Node = null;

    private audioSource: AudioSourceComponent = null;

    missPos: Vec3;
    comboPos: Vec3;
    timeCount: number;

    onLoad() {
        var self = this;
        game.on(Game.EVENT_HIDE, this.GameHide, this);
        // game.on(Game.EVENT_SHOW, function () {
        //     // self.OnContinueBtn();
        // });

        bridge.register("notifySlide", () => {
            let DateTime = new Date();
            let Time = DateTime.toLocaleDateString() + "-" + DateTime.toLocaleTimeString('chinese', { hour12: false }) + ":" + DateTime.getMilliseconds();
            console.error("收到native消息:" + Time);
            if (GameData.mode == 0 || GameData.mode == 1) {
                self.notifySlide();
            }
            // self.notifySlide();
        })

        bridge.register("disconnect", (code) => {
            console.log("蓝牙断开链接 disconnect");
            self.audioSource.stop();
            let Progress = Math.floor(GlobalModel.getInstances().getGameProgressBar() * 100);

            HttpUnit.saveUesrRecord(GameData.currentMusicIndex, Progress, this.PlsyScore, GameData.currentMusicName);

            GlobalModel.getInstances().setGameOver(1);
            director.preloadScene("GameOver", () => {
                director.loadScene("GameOver");
            });
        })
        this.missPos = this.MissNode.getPosition();
        this.comboPos = this.ComboNode.getPosition();
    }

    start() {
        // profiler.showStats();
        let self = this;
        this.audioSource = this.node.getComponent(AudioSourceComponent);
        // loader.loadRes("music/main/" + GlobalModel.getInstances().getMisicKeyLevel(), AudioClip, (err, audioClip) => {
        //     if (err) { console.log(err); return; }
        //     self.audioSource.clip = audioClip;
        //     GlobalModel.getInstances().currentMusicTime = audioClip.getDuration();
        //     self.init();
        // });
        GameData.loadMusic(GameData.currentMusicIndex, () => {
            self.audioSource.clip = GameData.currentMusic;
            GlobalModel.getInstances().currentMusicTime = GameData.currentMusicTime;
            self.init();
        })

        this.MissNode.active = false;
        this.PerfectNode.active = false;
        this.ComboNode.active = false;
        this.GreatNode.active = false;
        this.S_PerfectNode.active = false;
        this.SlowNode.active = false;
        this.SpeedNode.active = false;

        this.missPos.y = this.MissNode.position.y;


    }

    onDestroy() {
        var self = this;
        game.off(Game.EVENT_HIDE, this.GameHide, this);
    }

    GameHide() {
        this.OnPauseBtn();
    }

    /**
     * 初始化
     */
    init(): void {
        this.initData();
        this.initUI();
        this.initEvent();

        this.MissNode.active = false;
        this.PerfectNode.active = false;
        this.ComboNode.active = false;
        this.GreatNode.active = false;
        this.S_PerfectNode.active = false;
        this.SlowNode.active = false;
        this.SpeedNode.active = false;

        this.PerfectNode.setPosition(this.missPos);
        this.GreatNode.setPosition(this.missPos);
        this.S_PerfectNode.setPosition(this.missPos);
        this.MissNode.setPosition(this.missPos);
        this.ComboNode.setPosition(this.comboPos);

        switch (GameData.mode) {
            case 1:
            case 3:
                this.snow.node.active = false;
                this.node.scene.globals.fog.enabled = false;
                break;
            case 4:
                this.snow.node.active = false;
                this.node.scene.globals.fog.enabled = false;
                this.node.parent.parent.getChildByName("gamePanel").active = false;
                break;
        }
    }

    /**
     * 初始化数据
     */
    initData(): void {
        this.xPos = 0;
        this.yPos = 0;
        this.zPos = 70;
        this.stageArr = new Array();

        this.playerJumpSpeed = 0.025;
        this.mGamePresenter = new GamePresenter(this);
        this.mGamePresenter.init();

        GlobalModel.getInstances().setMaxCOMBO(0);
        GlobalModel.getInstances().setMISS(0);
    }

    /**
     * 初始化UI
     */
    initUI(): void {
        this.cameraNode.position = new Vec3(this.xPos, this.yPos, this.zPos);
        this.playerNode.position = new Vec3(this.xPos, this.yPos, this.zPos);
        this.DemonstrationNode.position = new Vec3(this.xPos, this.DemonstrationNode.position.y, this.zPos);
        this.initStageNode();
        this.initEnvNode();

        let index: number = this.mGamePresenter.getPlayerStageIndex();
        let stageNode: Node = this.stageArr[index];
        let distance: number = Math.abs(this.zPos - 0);
        let Time = 5;
        this.Speed = (distance / Time) / 60;

        this.ShowGameStartNode();
        this.ShowTimeLabel();

        let point: Array<number> = this.mGamePresenter.getRhythmPointData();
        this.PointDataLength = point.length;

        this.PlsyScoreLabel.string = "0";
        this.GameProgressBar.progress = index / this.PointDataLength;
        this.GameNumLabel.string = index + " / " + this.PointDataLength;

        GlobalModel.getInstances().setGameProgressBar(this.GameProgressBar.progress);
        GlobalModel.getInstances().setGameNumLabel(this.GameNumLabel.string);

        this.speedUpIndex = 0;
        this.slowDownIndex = 0;
        this.timeCount = 0;
    }

    //
    initEvent(): void {
        input.on(Input.EventType.KEY_DOWN, (eve: EventKeyboard) => {
            let DateTime = new Date();
            let Time = DateTime.toLocaleDateString() + "-" + DateTime.toLocaleTimeString('chinese', { hour12: false }) + ":" + DateTime.getMilliseconds();
            console.error("收到input消息:" + Time);
            if (GameData.mode == 0 || GameData.mode == 1 || GameData.mode == 5) {
                this.notifySlide();
            }
        }, this);

    }

    //
    initStageNode(): void {
        this.mGamePresenter.initStageNode();
    }

    //
    createStageNode(x: number, y: number, z: number, scale: number): void {
        // console.log("----------------------------- x:", x + ",y:", y + ",z:", z + ",scale:", scale);
        let node: Node = instantiate(this.prefab);
        node.position = new Vec3(x, y, z);
        node.scale = new Vec3(scale, scale, scale);
        this.gameNode.addChild(node)
        this.stageArr.push(node);
    }

    //
    initEnvNode(): void {
        for (let i = 0; i <= 4; i++) {
            this.createEnvNode();
        }
    }

    //
    createEnvNode(): void {
        // let z: number = this.createEnvZ;
        // let x1: number = -0.626;
        // let x2: number = 0.626;
        // let aa: Array<Prefab> = new Array();
        // aa.push(this.sea0);
        // aa.push(this.sea1);
        // aa.push(this.sea2);
        // aa.push(this.sea3);


        // let node1: Node = instantiate(aa[Math.floor(Math.random() * aa.length)]);
        // node1.position = new Vec3(x1, 0, z);
        // this.gameNode.addChild(node1)


        // let node2: Node = instantiate(aa[Math.floor(Math.random() * aa.length)]);
        // node2.position = new Vec3(x2, 0, z);
        // this.gameNode.addChild(node2);


        // this.createEnvZ -= 1.4;
    }

    private ShowGameStartNode() {
        this.GameStartNode.active = true;
        this.GameStarTime = 3;
        let Time = this.GameStartNode.getChildByName("Time").getComponent(Label) as Label;
        Time.string = String(this.GameStarTime);

        let soundSource = this.node.parent.getChildByName("CountDown").getComponent(AudioSource) as AudioSource;
        soundSource.play();

        this.GameStartNodeAni();
        this.schedule(this.GameStartNodeAni, 1);
    }

    private GameStartNodeAni() {
        if (this.GameStarTime <= 0) {
            this.GameStartNode.active = false;
            this.GameStart();
            this.unschedule(this.GameStartNodeAni);
            return;
        }
        let Time = this.GameStartNode.getChildByName("Time").getComponent(Label) as Label;
        Time.string = String(this.GameStarTime--);
    }

    private GameStart() {
        if (this.mGamePresenter.getGameState() == 0 && this.audioSource.clip) {
            this.mGamePresenter.startGame();
            // this.audioSource.currentTime = 0;
            // this.audioSource.play();

            this.StartGetTime = new Date().getTime();
        }

        if (this.mGamePresenter.getGameState() == 2 && this.audioSource.clip) {
            let getTime = new Date().getTime();
            this.StartGetTime = getTime - this.PauseGetTime + this.StartGetTime;
            this.mGamePresenter.startGame();
            this.audioSource.play();
        }

        this.UpdateTimeLabel();
        this.schedule(this.UpdateTimeLabel, 1);
    }

    private ShowTimeLabel() {
        // let musicTime = GlobalModel.getInstances().currentMusicTime;
        // let min = Math.ceil(musicTime / 60) > 10 ? Math.ceil(musicTime / 60) : "0" + Math.ceil(musicTime / 60);
        // let sec = Math.ceil(musicTime % 60);
        // let time = min + ":" + sec;
        // console.log("timeLabel:", time);
        // this.TimeLabel.string = time;
        // this.LastPointData = Math.floor(this.mGamePresenter.getLastPointData());
        this.TimeLabel.string = this.formatTime(this.LastPointData);


        GlobalModel.getInstances().setTimeLabel(GameData.currentMusicTime);
    }

    private UpdateTimeLabel() {
        // let LastPointData = this.LastPointData--;
        // if (LastPointData <= 0) {
        //     LastPointData = 0;
        // }
        // this.TimeLabel.string = this.formatTime(LastPointData);
        this.timeCount++;
        let time;
        if (this.timeCount >= GameData.currentMusicTime) {
            time = 0;
        } else {
            time = GameData.currentMusicTime - this.timeCount;
        }
        this.TimeLabel.string = this.formatTime(time);
        GameData.playTime = this.formatTime(this.timeCount);
    }

    private formatTime(seconds: number): string {
        const minutes: number = Math.floor(seconds / 60);
        const remainingSeconds: number = Math.floor(seconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    private touchStartEvent(event: EventTouch): void {
        this.touchStartX = event.getLocationX();
        this.touchStartY = event.getLocationY();
    }

    private touchMoveEvent(event: EventTouch): void {
        if (this.mGamePresenter.getGameState() == 1) {
            let _x = event.getLocationX();
            let xOffset: number = this.touchStartX - _x;
            this.xPos -= xOffset * 0.015;

            if (this.xPos <= -1.5) {
                this.xPos = -1.5;
            } else if (this.xPos >= 1.5) {
                this.xPos = 1.5;
            }
            this.touchStartX = event.getLocationX();
            this.touchStartY = event.getLocationY();
        }
    }

    private touchEndEvent(event: EventTouch): void {

    }

    //
    update(dt: number) {
        if (this.mGamePresenter) {
            this.mGamePresenter.update(dt);
        }
        this.cameraNode.position = new Vec3(0, 0, this.zPos);
        this.playerNode.position = new Vec3(this.xPos, this.yPos, this.zPos);
        this.DemonstrationNode.position = new Vec3(0, this.DemonstrationNode.position.y, this.zPos);

        if (!this.IsStart && this.zPos <= 0) {
            this.IsStart = true;
            this.audioSource.currentTime = 0;
            this.audioSource.play();

            this.StartGetTime = new Date().getTime();

            let index: number = this.mGamePresenter.getPlayerStageIndex();
            let stageNode: Node = this.stageArr[index];
            let distance: number = Math.abs(this.zPos - stageNode.position.z);
            let Time = Math.abs(stageNode.position.z / 5);
            this.Speed = (distance / Time) / 60;

            this.playerJumpSpeed = - 0.025;
        }
    }

    refreshPlayerAndCamera(): void {
        this.zPos -= this.Speed;
        this.refreshEnvNode();
    }

    private nowtime = 0;
    private Isnowtime = false;
    speedUp = GameData.currentMusicConfig.speedUp;
    slowDown = GameData.currentMusicConfig.slowDown;
    speedUpIndex = 0;
    slowDownIndex = 0;
    lastTime = 0;
    refreshPlayer(index: number, middleZ: number, nextZ: number): void {
        // if (this.playerJumpSpeed > 0) {
        //     // this.yPos = this.yPos + this.playerJumpSpeed;
        //     if (this.zPos <= middleZ) {
        //         this.playerJumpSpeed = - 0.025;
        //     }
        // } else if (this.playerJumpSpeed < 0) {
        // this.yPos = this.yPos + this.playerJumpSpeed;
        let currentTime = Math.floor((new Date().getTime() - this.StartGetTime) / 1000);
        if (this.lastTime != currentTime && this.speedUp != undefined && this.speedUp[this.speedUpIndex] && this.speedUp[this.speedUpIndex] == currentTime) {
            console.error("显示加速");
            this.showSpeed();
            this.lastTime = currentTime;
            this.speedUpIndex++;
        }

        if (this.lastTime != currentTime && this.slowDown != undefined && this.slowDown[this.slowDownIndex] && this.slowDown[this.slowDownIndex] == currentTime) {
            console.error("显示减速");
            this.showSlow();
            this.lastTime = currentTime;
            this.slowDownIndex++;
        }
        let stageNode1: Node = this.stageArr[index];
        let distance1: number = Math.abs(this.zPos - stageNode1.position.z);

        if (distance1 < 2) {
            if (!this.Isnowtime) {
                this.Isnowtime = true;
                this.nowtime = new Date().getTime();
            }
            if (stageNode1.position.x == -1 && !this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Hit").active) {
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Tips").active = true;
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Idle").active = false;
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Hit").active = false;
            } else if (stageNode1.position.x == 1 && !this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Hit").active) {
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Tips").active = true;
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Idle").active = false;
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Hit").active = false;
            }
        } else {
            if (this.Isnowtime) {
                this.Isnowtime = false;
                this.nowtime = new Date().getTime() - this.nowtime;

                // console.log("判定的时间:", this.nowtime / 1000);
            }
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Tips").active = false;
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Tips").active = false;

            if (!this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Hit").active) {
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Idle").active = true;
            }

            if (!this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Hit").active) {
                this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Idle").active = true;
            }
        }

        if (this.zPos <= nextZ - 0.5) {

            let stageNode: Node = this.stageArr[index];
            let treadState: number = this.checkTreadIsStage(stageNode);
            // if (treadState != 0) {

            this.zPos = nextZ - 0.5;

            let stageNode1: Node = this.stageArr[index + 1];
            this.NowGetTime = (new Date().getTime() - this.StartGetTime) / 1000;
            let distance: number = Math.abs(this.zPos - stageNode1.position.z);
            let Time = Math.abs(this.stageArr[index + 1].position.z / 5) - this.NowGetTime;
            this.Speed = (distance / Time) / 60;

            // if (SpeedUp != undefined && (SpeedUp >= Math.abs(Math.floor(this.stageArr[index].position.z / 5)) && SpeedUp <= Math.abs(Math.floor(this.stageArr[index + 1].position.z / 5)))) {
            //     console.error("显示加速");
            //     this.showSpeed();
            // }

            // if (SlowDown != undefined && (SlowDown >= Math.abs(Math.floor(this.stageArr[index].position.z / 5)) && SlowDown <= Math.abs(Math.floor(this.stageArr[index + 1].position.z / 5)))) {
            //     console.error("显示减速");
            //     this.showSlow();
            // }

            // console.log("----------------------------- this.NowGetTime:", this.NowGetTime + ",Time:", Math.abs(this.stageArr[index].position.z / 5));

            this.mGamePresenter.addPlayerStageIndex();
            // if (treadState == 0) {   //播放Miss踩踏效果
            //     console.error("Miss");
            //     this.ShowMiss();
            // } else if (treadState == 1) {   //Great
            //     console.error("Great");
            //     this.PlsyScore += 10;
            //     this.ShowGreat();
            // } else if (treadState == 2) {   //Perfect
            //     console.error("Perfect");
            //     this.PlsyScore += 20;
            //     this.ShowPerfect();
            // } else if (treadState == 3) {   //S-Perfect
            //     console.error("S-Perfect");
            //     this.PlsyScore += 30;
            //     this.ShowS_Perfect();
            // }

            if (treadState == 0) {   //播放Miss踩踏效果
                console.error("Miss");
                this.ShowMiss();

                let soundSource = this.node.parent.getChildByName("miss").getComponent(AudioSource) as AudioSource;
                soundSource.play();
            } else {
                this.ShowComboNode();

                let soundSource = this.node.parent.getChildByName("hit").getComponent(AudioSource) as AudioSource;
                soundSource.play();
            }

            this.PlsyScoreLabel.string = String(this.PlsyScore);

            if (treadState != 0) {
                this.playTreadStageEffect(stageNode);
                this.playTreadStageAnim(stageNode);
            }
            this.playerJumpSpeed = 0.025;
            this.yPos = 0;
            if (this.mGamePresenter.checkIsPass()) {
                this.gamePassLevel();
            } else {
                this.mGamePresenter.addStageNode();
            }
            // } else {
            //     this.yPos = 0;
            //     // this.gameFailLevel();
            // }
            // }

            this.xPos = 0;
        }
    }


    ShowMiss() {
        let MISS = GlobalModel.getInstances().getMISS();
        let MISSNum = MISS + 1;
        GlobalModel.getInstances().setMISS(MISSNum);

        this.MaxCOMBO = 0;
        this.MissNode.active = true;

        tween(this.MissNode)
            .by(0.1, { position: new Vec3(300, 0, 0) })
            .call(() => {
                this.scheduleOnce(() => {
                    this.MissNode.active = false;
                    this.MissNode.setPosition(this.missPos);
                }, 0.9);
            })
            .start();
    }

    private MaxCOMBO: number = 0;
    private NoMiss: number = 0;
    ShowPerfect() {
        this.NoMiss += 1;
        this.MaxCOMBO += 1;
        let MaxCOMBO = GlobalModel.getInstances().getMaxCOMBO();

        this.GameNumLabel.string = this.NoMiss + " / " + this.PointDataLength;
        GlobalModel.getInstances().setGameNumLabel(this.GameNumLabel.string);

        this.GameProgressBar.progress = this.NoMiss / this.PointDataLength;

        GlobalModel.getInstances().setGameProgressBar(this.GameProgressBar.progress);

        if (this.MaxCOMBO > MaxCOMBO) {
            GlobalModel.getInstances().setMaxCOMBO(this.MaxCOMBO);
        }

        this.PerfectNode.active = true;
        tween(this.PerfectNode)
            .by(0.1, { position: new Vec3(300, 0, 0) })
            .call(() => {
                this.scheduleOnce(() => {
                    this.PerfectNode.active = false;
                    this.PerfectNode.setPosition(this.missPos);
                }, 0.9);
            })
            .start();

        if (this.MaxCOMBO > 1) {
            this.ShowComboNode();
        }
    }

    ShowGreat() {
        this.NoMiss += 1;
        this.MaxCOMBO += 1;
        let MaxCOMBO = GlobalModel.getInstances().getMaxCOMBO();

        this.GameNumLabel.string = this.NoMiss + " / " + this.PointDataLength;
        GlobalModel.getInstances().setGameNumLabel(this.GameNumLabel.string);

        this.GameProgressBar.progress = this.NoMiss / this.PointDataLength;

        GlobalModel.getInstances().setGameProgressBar(this.GameProgressBar.progress);

        if (this.MaxCOMBO > MaxCOMBO) {
            GlobalModel.getInstances().setMaxCOMBO(this.MaxCOMBO);
        }

        this.GreatNode.active = true;
        tween(this.GreatNode)
            .by(0.1, { position: new Vec3(300, 0, 0) })
            .call(() => {
                this.scheduleOnce(() => {
                    this.GreatNode.active = false;
                    this.GreatNode.setPosition(this.missPos);
                }, 0.9);
            })
            .start();

        if (this.MaxCOMBO > 1) {
            this.ShowComboNode();
        }
    }

    ShowS_Perfect() {
        this.NoMiss += 1;
        this.MaxCOMBO += 1;
        let MaxCOMBO = GlobalModel.getInstances().getMaxCOMBO();

        this.GameNumLabel.string = this.NoMiss + " / " + this.PointDataLength;
        GlobalModel.getInstances().setGameNumLabel(this.GameNumLabel.string);

        this.GameProgressBar.progress = this.NoMiss / this.PointDataLength;

        GlobalModel.getInstances().setGameProgressBar(this.GameProgressBar.progress);

        if (this.MaxCOMBO > MaxCOMBO) {
            GlobalModel.getInstances().setMaxCOMBO(this.MaxCOMBO);
        }

        this.S_PerfectNode.active = true;
        tween(this.S_PerfectNode)
            .by(0.1, { position: new Vec3(300, 0, 0) })
            .call(() => {
                this.scheduleOnce(() => {
                    this.S_PerfectNode.active = false;
                    this.S_PerfectNode.setPosition(this.missPos);
                }, 0.9);
            })
            .start();

        if (this.MaxCOMBO > 1) {
            this.ShowComboNode();
        }
    }

    ShowComboNode() {
        this.setSnow();
        this.NoMiss += 1;
        this.MaxCOMBO += 1;
        let MaxCOMBO = GlobalModel.getInstances().getMaxCOMBO();

        this.GameNumLabel.string = this.NoMiss + " / " + this.PointDataLength;
        GlobalModel.getInstances().setGameNumLabel(this.GameNumLabel.string);

        this.GameProgressBar.progress = this.NoMiss / this.PointDataLength;

        GlobalModel.getInstances().setGameProgressBar(this.GameProgressBar.progress);

        if (this.MaxCOMBO > MaxCOMBO) {
            GlobalModel.getInstances().setMaxCOMBO(this.MaxCOMBO);
        }

        if (this.MaxCOMBO >= 100) {
            this.PlsyScore += 10 * 3;
        } else {
            this.PlsyScore += (Math.floor(this.MaxCOMBO / 5) * 0.1 + 1) * 10
        }

        let startPos = new Vec3(this.comboPos.x, this.comboPos.y + 400);
        this.ComboNode.setPosition(startPos);
        this.ComboNode.getChildByName("Label").getComponent(Label).string = this.MaxCOMBO + "";
        this.ComboNode.active = true;
        tween(this.ComboNode)
            .to(0.1, { position: this.comboPos })
            .call(() => {
                this.scheduleOnce(() => {
                    this.ComboNode.active = false;
                }, 0.9);
            })
            .start();


        let tweenNode: Node;
        if (this.MaxCOMBO <= 4) {//great
            tweenNode = this.GreatNode;
        } else if (this.MaxCOMBO >= 5 && this.MaxCOMBO <= 14) {//perfect
            tweenNode = this.PerfectNode;
        } else {//s-perfect
            tweenNode = this.S_PerfectNode;
        }
        tweenNode.active = true;
        tween(tweenNode)
            .by(0.1, { position: new Vec3(300, 0, 0) })
            .call(() => {
                this.scheduleOnce(() => {
                    tweenNode.active = false;
                    tweenNode.setPosition(this.missPos);
                }, 0.9);
            })
            .start();
    }

    showSpeed() {
        console.log("show-SpeedUp");
        this.SpeedNode.active = true;
        this.scheduleOnce(() => {
            this.SpeedNode.active = false;
        }, 1.9);
    }

    showSlow() {
        console.log("show-SlowDown");
        this.SlowNode.active = true;
        this.scheduleOnce(() => {
            this.SlowNode.active = false;
        }, 1.9);
    }

    //
    refreshCamera(): void {

    }

    //
    refreshEnvNode(): void {
        if (this.zPos - this.createEnvZ <= 1.4 * 4) {
            this.createEnvNode();
        }
    }

    //
    checkTreadIsStage(stageNode: Node): number {
        let type: number = 0;
        let scale: number = stageNode.scale.z;

        let z: number = stageNode.position.z;

        let distance: number = Math.abs(this.zPos - z);

        let x: number = stageNode.position.x;

        let distancex: number = Math.abs(this.xPos - x);

        if (distance <= 0.52 && distancex != 1) {
            type = 3;
        } else if (distance < 0.54 && distancex != 1) {
            type = 2;
        } else if (distance > 0.54 && distance < 0.6 && distancex != 1) {
            type = 1;
        }
        return type;
    }

    //
    playTreadStageAnim(stageNode: Node): void {
        // let stageNode: Node = this.stageArr[index + 1];
        let nowPos: Vec3 = new Vec3(0, 0, 0);
        Vec3.copy(nowPos, stageNode.position)
        let middlePos: Vec3 = new Vec3(nowPos.x, nowPos.y - 0.07, nowPos.z);


        let nowScale: Vec3 = new Vec3(0, 0, 0);
        Vec3.copy(nowScale, stageNode.scale)
        let middleScale: Vec3 = new Vec3(nowScale.x * 0.9, nowScale.y * 0.9, nowScale.z * 0.9);
        tween(stageNode)
            .to(0.1, { position: middlePos, scale: middleScale })
            .to(0.1, { position: nowPos, scale: nowScale })
            .start();
    }

    //
    playTreadStageEffect(stageNode: Node): void {
        if (stageNode.position.x == -1) {
            this.leftHit.active = true;
            let startScale = new Vec3(this.leftHit.scale);
            let targetScale = new Vec3(this.leftHit.scale.x * 1.4, this.leftHit.scale.y * 1.4, this.leftHit.scale.z * 1.4);
            tween(this.leftHit)
                .to(0.3, { scale: targetScale })
                .call(() => {
                    this.leftHit.active = false;
                    this.leftHit.setScale(startScale);
                })
                .start();

            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Hit").active = true;   //ddddddddd
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Idle").active = false;
        } else if (stageNode.position.x == 1) {
            this.rightHit.active = true;
            let startScale = new Vec3(this.rightHit.scale);
            let targetScale = new Vec3(this.rightHit.scale.x * 1.4, this.rightHit.scale.y * 1.4, this.rightHit.scale.z * 1.4);
            tween(this.rightHit)
                .to(0.3, { scale: targetScale })
                .call(() => {
                    this.rightHit.active = false;
                    this.rightHit.setScale(startScale);
                })
                .start();

            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Hit").active = true;//ddddddddd
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Idle").active = false;
        }

        this.scheduleOnce(() => {
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Hit").active = false;
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Hit").active = false;
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Left").getChildByName("Idle").active = true;
            this.DemonstrationNode.getChildByName("HitNode").getChildByName("Right").getChildByName("Idle").active = true;

        }, 0.5)
    }

    //
    gameFailLevel(): void {
        this.yPos = -0.025;
        this.audioSource.pause();
        this.mGamePresenter.setGameState(2);

        GlobalModel.getInstances().setGameOver(0);

        director.preloadScene("GameOver", () => {
            director.loadScene("GameOver");
        });
    }

    //
    reviveGameLevel(): void {
        let index: number = this.mGamePresenter.getPlayerStageIndex();
        let stageNode: Node = this.stageArr[index];
        this.yPos = 0;
        this.xPos = stageNode.position.x;
        this.mGamePresenter.setGameState(1);
        this.audioSource.play();
    }

    //
    gamePassLevel(): void {
        this.unschedule(this.UpdateTimeLabel);
        this.mGamePresenter.setGameState(3);
        this.scheduleOnce(this.showPassUI, 0.5);
    }

    //
    showPassUI(): void {
        this.audioSource.stop();
        let Progress = Math.floor(GlobalModel.getInstances().getGameProgressBar() * 100);

        HttpUnit.saveUesrRecord(GameData.currentMusicIndex, Progress, this.PlsyScore, GameData.currentMusicName);

        GlobalModel.getInstances().setGameOver(1);
        director.preloadScene("GameOver", () => {
            director.loadScene("GameOver");
        });
    }

    OnSureBtn(): void {
        director.loadScene("start");
    }

    OnPassLevelBtn(): void {
        director.loadScene("start");
    }

    OnPauseBtn() {
        if (this.PauseNode.active || this.GameStartNode.active) {
            return;
        }
        // this.GameStartNode.active = false;
        // this.unschedule(this.GameStartNodeAni);

        this.node.parent.getChildByName("PauseBtn").getChildByName("ico_pause").active = false;
        this.node.parent.getChildByName("PauseBtn").getChildByName("ico_ play").active = true;

        this.unschedule(this.UpdateTimeLabel);
        this.PauseGetTime = new Date().getTime();
        this.PauseNode.active = true;
        this.audioSource.pause();
        this.mGamePresenter.setGameState(2);
    }

    OnContinueBtn() {
        this.PauseNode.active = false;
        this.ShowGameStartNode();

        this.node.parent.getChildByName("PauseBtn").getChildByName("ico_pause").active = true;
        this.node.parent.getChildByName("PauseBtn").getChildByName("ico_ play").active = false;
    }

    OnExitBtn() {
        this.showPassUI();
    }

    notifySlide() {
        let index: number = this.mGamePresenter.getPlayerStageIndex();
        let stageNode: Node = this.stageArr[index];
        let distance: number = Math.abs(this.zPos - stageNode.position.z);
        // console.log("-------------------------- nextZ:", nextZ, ",distance:", distance, "stageNode:", stageNode.position.x);

        this.xPos = stageNode.position.x;

        if (distance > 2) {
            this.xPos = 0;
        }

        // let DateTime = new Date();
        // let Time = DateTime.toLocaleDateString() + "-" + DateTime.toLocaleTimeString('chinese', { hour12: false }) + ":" + DateTime.getMilliseconds();
        // console.error("收到消息:" + Time);
    }

    setSnow() {
        let value = new CurveRange();
        if (this.MaxCOMBO != 0) {
            switch (this.MaxCOMBO % 20) {
                case 0:
                    value.constant = 1000;
                    break;
                case 5:
                    value.constant = 400;
                    break;
                case 10:
                    value.constant = 600;
                    break;
                case 15:
                    value.constant = 800;
                    break;
                default:
                    value.constant = 200;
            }
            if (this.snow.enabled) {
                this.snow.rateOverTime = value;
            }
        }


    }

    OnRightBtn() {
        this.xPos = 1;
    }
}
