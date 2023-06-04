/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-05-18 10:44:28
 * @FilePath: \main\assets\Scripts\start\StartUI.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node, AudioClip, loader, Vec2, Vec3, instantiate, UIModelComponent, UITransformComponent, AudioSourceComponent, LabelComponent, director, Label, game, assetManager, ImageAsset, Sprite, SpriteFrame, Texture2D, AudioSource, profiler } from 'cc';

import { GlobalModel } from '../global/GlobalModel';
import { IStartUI } from './StartContract';
import { StartModel } from './StartModel';
import { CircleScrollview } from './CircleScrollview';
import DataController from '../common/DataController';
import HttpUnit from '../NetWork/HttpUnit';
import bridge from 'dsbridge-cocos';
const { ccclass, property } = _decorator;

@ccclass('StartUI')
export class StartUI extends Component implements IStartUI {

    @property({ type: Node })
    btnLastMusic: Node = null;
    @property({ type: Node })
    btnNextMusic: Node = null;


    @property({ type: Node })
    Transition: Node = null;
    @property({ type: Node })
    RuleView: Node = null;
    @property({ type: Node })
    PlayerInfoView: Node = null;
    @property({ type: Node })
    Avatar: Node = null;
    @property({ type: Label })
    Name: Label = null;

    private mStartMode: StartModel = null;
    private audioSource: AudioSource = null;
    /**
     * 是否可以切换音乐
     */
    public isCutMusic: boolean = false;
    start() {
        director.preloadScene("game");
        this.init();

    }
    //
    init(): void {
        this.initData();
        this.initUI();
        this.initEvent();
        // this.playSelectMusic();
    }

    //
    initData(): void {
        this.audioSource = this.node.getComponent(AudioSource);
        this.audioSource.loop = true;
        this.mStartMode = new StartModel();

        let selectMode = DataController.getSelectMode();
        let SelectLevel = DataController.getSelectLevel();
        console.log("selectMode,selectLevel:", selectMode, SelectLevel)
        GlobalModel.getInstances().setSelectMode(selectMode);
        let selectLevelID: number = this.mStartMode.getSelectLevel();
        GlobalModel.getInstances().setSelectlevel(SelectLevel);
        console.log(SelectLevel, "----------------------")
        this.isCutMusic = true;
    }

    //
    initUI(): void {

        this.Transition.active = false;
        let SelectModeNum = GlobalModel.getInstances().getSelectModeNum();
        // for (var i = 0; i < SelectModeNum; i++) {
        //     let musicListItem = instantiate(this.musicListItem);
        //     this.MusicListContent.addChild(musicListItem);
        //     musicListItem.active = true;

        //     let key = "1_" + i;
        //     musicListItem.getChildByName("labelMusic").getComponent(Label).string = GlobalModel.getInstances().getLevelConfig()[key]['name'];

        // }

        // this.MusicList.getComponent(CircleScrollview).initUI();

        var self = this;
        if (HttpUnit.UserInfo) {
            this.Name.string = HttpUnit.UserInfo.nickname;
            var avatarUrl = HttpUnit.UserInfo.avatar_uri;
            if (avatarUrl) {
                assetManager.loadRemote(avatarUrl, { ext: '.jpg' }, (err, data: ImageAsset) => {
                    if (err) {
                        console.log(err, data);
                        return;
                    }
                    if (self.Avatar) {
                        let sp: SpriteFrame = new SpriteFrame();
                        let tx: Texture2D = new Texture2D();
                        tx.image = data;
                        sp.texture = tx;
                        self.Avatar.getComponent(Sprite).spriteFrame = sp;
                    }
                });
            }
        }
    }

    //
    initEvent(): void {
        this.MusicEvent();
    }

    MusicEvent() {
        this.playSelectMusic();
    }

    //
    playSelectMusic(): void {
        let self = this;
        this.isCutMusic = false;
        this.audioSource.stop();
        loader.loadRes("music/main/" + GlobalModel.getInstances().getMisicKeyLevel(), AudioClip, (err, audioClip) => {
            if (err) { console.log(err); return; }
            if (self.audioSource) {
                if (audioClip['_name'] == GlobalModel.getInstances().getMisicKeyLevel()) {
                    self.audioSource.clip = audioClip;
                    self.audioSource.play();
                    self.isCutMusic = true;
                }
            }
        });
    }

    btnStartGameEvent(): void {
        var self = this;
        console.log("开始游戏 com.fed.game.start 存在方法:", bridge.hasNativeMethod("com.fed.game.start"));
        if (bridge.hasNativeMethod("com.fed.game.start")) {
            bridge.call("com.fed.game.start", null, function (ret) {
                console.log("开始游戏 com.fed.game.start 收到消息:", JSON.stringify(ret));
                if (JSON.stringify(ret)) {
                    self.Transition.active = true;
                    self.audioSource.stop();
                    self.audioSource = null;
                    director.preloadScene("game", () => {
                        director.loadScene("game");
                    });
                }
            })
        }

        // self.Transition.active = true;
        // self.audioSource.stop();
        // self.audioSource = null;
        // director.preloadScene("game", () => {
        //     director.loadScene("game");
        // });
    }

    btnQuitGameEvent(): void {
        console.log("--------------- 准备调用原生api  存在方法", bridge.hasNativeMethod("com.fed.game.quit"));
        if (bridge.hasNativeMethod("com.fed.game.quit")) {
            bridge.call("com.fed.game.quit")
        }
    }

    btnLastMusicEvent(): void {
        if (!this.isCutMusic) return;
        let nowLevelID: number = GlobalModel.getInstances().getSelectlevel();
        if (nowLevelID <= 0) return;
        nowLevelID--;
        GlobalModel.getInstances().setSelectlevel(nowLevelID);
        this.initUI();
        this.playSelectMusic();
    }

    btnNextMusicEvent(): void {
        if (!this.isCutMusic) return;
        let nowLevelID: number = GlobalModel.getInstances().getSelectlevel();
        if (nowLevelID >= GlobalModel.getInstances().getSelectModeNum() - 1) return;
        nowLevelID++;
        GlobalModel.getInstances().setSelectlevel(nowLevelID);
        this.initUI();
        this.playSelectMusic();
    }

    update(deltaTime: number) {

    }

    OnRule() {
        this.RuleView.active = true;
    }

    OnPlayerInfo() {
        this.PlayerInfoView.active = true;
    }

    OnBackBtn() {
        this.RuleView.active = false;
        this.PlayerInfoView.active = false;
    }
}