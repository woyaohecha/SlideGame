import { _decorator, Component, Node, Prefab, v3, UITransform, instantiate, math, NodeEventType, EventTouch, CCObject, Vec3, Vec2, tween, JsonAsset, Sprite, SpriteFrame, Label, resources, loader, Texture2D, AudioSource } from 'cc';
import { GameData } from '../global/GameData';
import { GlobalModel } from '../global/GlobalModel';
import HttpUnit from '../NetWork/HttpUnit';
import { Home } from './Home';
import { RankScrollView } from './RankScrollView';
import { StartUI } from './StartUI';
const { ccclass, property } = _decorator;

@ccclass('MusicList')
export class MusicList extends Component {

    @property(Prefab)
    musicItemPrefab: Prefab = null;

    @property(Node)
    musicInfoPanel: Node = null;

    @property(RankScrollView)
    rankScrollView: RankScrollView = null;

    @property(Label)
    totalLabel: Label = null;

    @property(Label)
    indexLabel: Label = null;


    musicListNode: Node = null;
    currentItemIndex: number = 0;
    audioSource: AudioSource = null;

    onLoad() {
        this.musicListNode = this.node.getChildByName("MusicList");
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    }

    start() {
        this.initList();
    }

    //初始化圆盘,一共8个位置
    initList() {
        this.currentItemIndex = 0;
        GameData.currentMusicIndex = 0;

        let musicItem: Node;
        for (let i = 0; i < 8; i++) {
            musicItem = instantiate(this.musicItemPrefab);
            musicItem.on(NodeEventType.TOUCH_END, this.clickChangeMusic, this);
            let pos = v3(0, 0);
            let radius = this.musicListNode.getComponent(UITransform).width / 2;
            let temp = Math.sqrt(radius * radius / 2);
            switch (i) {
                case 0:
                    pos = v3(temp, temp);
                    musicItem.getChildByName("Checked").active = true;
                    break;
                case 1:
                    pos = v3(0, radius);
                    break;
                case 2:
                    pos = v3(-temp, temp);
                    break;
                case 3:
                    pos = v3(-radius, 0);
                    break;
                case 4:
                    pos = v3(-temp, -temp);
                    break;
                case 5:
                    pos = v3(0, -radius);
                    break;
                case 6:
                    pos = v3(temp, -temp);
                    break;
                case 7:
                    pos = v3(radius, 0);
                    break;
            }
            if (i < 3) {
                this.setMusicItem(musicItem, i);
            }
            if (i > 5) {
                this.setMusicItem(musicItem, i + (GameData.musicListConfig.length - 8));
            }
            musicItem.setPosition(pos);
            this.musicListNode.addChild(musicItem);
        }
        this.totalLabel.string = String(GameData.musicListConfig.length);
        this.indexLabel.string = "/ " + (GameData.currentMusicIndex + 1);
        this.setMusicInfoPanel();
        this.rankScrollView.UpDateRank();
        this.audioSource = this.node.parent.getComponent(Home).audioSource;
    }

    setMusicItem(panelItem: Node, musicIndex: number) {
        let image: Sprite = panelItem.getChildByName("Image").getChildByName("Mask").children[0].getComponent(Sprite);
        let locked: Node = panelItem.getChildByName("Locked");
        let name: Label = panelItem.getChildByName("Desc").getChildByName("Name").getComponent(Label);
        let Time: Label = panelItem.getChildByName("Desc").getChildByName("Time").getComponent(Label);
        let star: Label = panelItem.getChildByName("Desc").getChildByName("Star").getComponent(Label);

        resources.load("musicItemImages/image_" + musicIndex + "/spriteFrame", SpriteFrame, (e, asset) => {
            if (e) {
                console.log(e);
                return;
            }
            image.spriteFrame = asset;

        })
        // locked.active = !Boolean(HttpUnit.levelLockedInfo[musicIndex]);
        locked.active = !(musicIndex <= Number(HttpUnit.UserInfo.level_num));
        name.string = GameData.musicListConfig[musicIndex].musicName;
        Time.string = GameData.musicListConfig[musicIndex].duration;
        star.string = "x" + GameData.musicListConfig[musicIndex].difficulty;
    }

    setMusicInfoPanel() {
        let namePanel: Label = this.musicInfoPanel.getChildByName("Name").getComponent(Label);
        let TimePanel: Label = this.musicInfoPanel.getChildByName("Time").getComponent(Label);
        let targetPanel: Label = this.musicInfoPanel.getChildByName("Target").getComponent(Label);
        let costPanel: Label = this.musicInfoPanel.getChildByName("Cost").getComponent(Label);
        let starNum: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("StarsNum").getComponent(Label);
        let bpm: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("Bpm").getComponent(Label);
        let passPanel: Label = this.musicInfoPanel.getChildByName("Pass").getComponent(Label);

        namePanel.string = GameData.musicListConfig[GameData.currentMusicIndex].musicName;
        TimePanel.string = "时长：" + GameData.musicListConfig[GameData.currentMusicIndex].duration;
        targetPanel.string = "滑行目标：" + GameData.musicListConfig[GameData.currentMusicIndex].slideGoals;
        costPanel.string = "预计消耗：" + GameData.musicListConfig[GameData.currentMusicIndex].EstimatedCalories;
        starNum.string = "x" + GameData.musicListConfig[GameData.currentMusicIndex].difficulty;
        bpm.string = "BPM：" + GameData.musicListConfig[GameData.currentMusicIndex].bpm;
        passPanel.string = "通关条件：" + GameData.musicListConfig[GameData.currentMusicIndex].gameConditions;
        this.indexLabel.string = "/ " + (GameData.currentMusicIndex + 1);
    }

    startPos: Vec2;
    isMoving: boolean = false;
    onTouchStart(e: EventTouch) {
        this.startPos = e.getLocation();
    }

    tweenCallBack(itemIndex, musicIndex) {
        let pos = this.musicListNode.children[itemIndex].position;
        if (pos.x > 0 && pos.y > 0) {
            // GlobalModel.getInstances().setSelectlevel(this.currentIndex);
            this.musicListNode.children[itemIndex].getChildByName("Checked").active = true;
            GameData.loadMusic(musicIndex, (clip) => {
                this.setMusicInfoPanel();
                this.audioSource.stop();
                this.audioSource.clip = clip;
                this.audioSource.play();
                this.rankScrollView.UpDateRank();
            });

        } else {
            this.musicListNode.children[itemIndex].getChildByName("Checked").active = false;
        }
        this.isMoving = false;
    }

    onTouchEnd(e: EventTouch) {
        let len = e.getLocation().y - this.startPos.y;
        if (Math.abs(len) < 100 || this.isMoving) {
            return;
        }
        this.isMoving = true;
        if (len > 0) {  //向上滑动
            let musicIndex = GameData.currentMusicIndex - 1 >= 0 ? GameData.currentMusicIndex - 1 : GameData.musicListConfig.length - 1;
            this.currentItemIndex = this.currentItemIndex - 1 >= 0 ? this.currentItemIndex - 1 : 7;
            let preSetItemIndex = this.currentItemIndex - 1 >= 0 ? this.currentItemIndex - 1 : 7;
            let preSetMusicIndex = musicIndex - 1 >= 0 ? musicIndex - 1 : GameData.musicListConfig.length - 1;
            this.setMusicItem(this.musicListNode.children[preSetItemIndex], preSetMusicIndex);
            let firstPos = new Vec3(this.musicListNode.children[0].position);
            for (let i = 0; i < this.musicListNode.children.length; i++) {
                let targetPos = i == 7 ? firstPos : this.musicListNode.children[i + 1].position;
                tween(this.musicListNode.children[i])
                    .to(0.1, { position: targetPos })
                    .call(() => {
                        this.tweenCallBack(i, musicIndex);
                    })
                    .start();
            }

        } else {        //向下滑动
            let musicIndex = GameData.currentMusicIndex + 1 <= GameData.musicListConfig.length - 1 ? GameData.currentMusicIndex + 1 : 0;
            this.currentItemIndex = this.currentItemIndex + 1 <= 7 ? this.currentItemIndex + 1 : 0;
            let preSetItemIndex = this.currentItemIndex + 1 <= 7 ? this.currentItemIndex + 1 : 0;
            let preSetMusicIndex = musicIndex + 1 <= GameData.musicListConfig.length - 1 ? musicIndex + 1 : 0;
            this.setMusicItem(this.musicListNode.children[preSetItemIndex], preSetMusicIndex);
            let lastPos = new Vec3(this.musicListNode.children[this.musicListNode.children.length - 1].position);
            for (let i = this.musicListNode.children.length - 1; i >= 0; i--) {
                let targetPos = i == 0 ? lastPos : this.musicListNode.children[i - 1].position;
                tween(this.musicListNode.children[i])
                    .to(0.1, { position: targetPos })
                    .call(() => {
                        this.tweenCallBack(i, musicIndex);
                    })
                    .start();
            }
        }
    }

    clickChangeMusic(e: EventTouch) {
        if (e.currentTarget.position.y == 0) {
            this.isMoving = true;
            let musicIndex = GameData.currentMusicIndex - 1 >= 0 ? GameData.currentMusicIndex - 1 : GameData.musicListConfig.length - 1;
            this.currentItemIndex = this.currentItemIndex - 1 >= 0 ? this.currentItemIndex - 1 : 7;
            let preSetItemIndex = this.currentItemIndex - 1 >= 0 ? this.currentItemIndex - 1 : 7;
            let preSetMusicIndex = musicIndex - 1 >= 0 ? musicIndex - 1 : GameData.musicListConfig.length - 1;
            this.setMusicItem(this.musicListNode.children[preSetItemIndex], preSetMusicIndex);
            let firstPos = new Vec3(this.musicListNode.children[0].position);
            for (let i = 0; i < this.musicListNode.children.length; i++) {
                let targetPos = i == 7 ? firstPos : this.musicListNode.children[i + 1].position;
                tween(this.musicListNode.children[i])
                    .to(0.1, { position: targetPos })
                    .call(() => {
                        this.tweenCallBack(i, musicIndex);
                    })
                    .start();
            }
        } else if (e.currentTarget.position.y == this.musicListNode.getComponent(UITransform).width / 2) {
            this.isMoving = true;
            let musicIndex = GameData.currentMusicIndex + 1 <= GameData.musicListConfig.length - 1 ? GameData.currentMusicIndex + 1 : 0;
            this.currentItemIndex = this.currentItemIndex + 1 <= 7 ? this.currentItemIndex + 1 : 0;
            let preSetItemIndex = this.currentItemIndex + 1 <= 7 ? this.currentItemIndex + 1 : 0;
            let preSetMusicIndex = musicIndex + 1 <= GameData.musicListConfig.length - 1 ? musicIndex + 1 : 0;
            this.setMusicItem(this.musicListNode.children[preSetItemIndex], preSetMusicIndex);
            let lastPos = new Vec3(this.musicListNode.children[this.musicListNode.children.length - 1].position);
            for (let i = this.musicListNode.children.length - 1; i >= 0; i--) {
                let targetPos = i == 0 ? lastPos : this.musicListNode.children[i - 1].position;
                tween(this.musicListNode.children[i])
                    .to(0.1, { position: targetPos })
                    .call(() => {
                        this.tweenCallBack(i, musicIndex);
                    })
                    .start();
            }
        }
    }









}

