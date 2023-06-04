import { _decorator, Component, Node, Prefab, v3, UITransform, instantiate, math, NodeEventType, EventTouch, CCObject, Vec3, Vec2, tween, JsonAsset, Sprite, SpriteFrame, Label, resources, loader, Texture2D, AudioSource } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
import HttpUnit from '../NetWork/HttpUnit';
import { RankScrollView } from './RankScrollView';
import { StartUI } from './StartUI';
const { ccclass, property } = _decorator;

@ccclass('MusicList')
export class MusicList extends Component {

    @property(Prefab)
    musicItemPrefab: Prefab = null;

    @property(JsonAsset)
    musicListConfig: JsonAsset = null;

    @property(Node)
    musicInfoPanel: Node = null;

    @property(RankScrollView)
    rankScrollView: RankScrollView = null;

    musicList: Node;
    musicListInfo: any;
    idleTopIndex: number;
    idleBottomIndex: number;
    currentIndex: number = 0;

    onLoad() {
        this.musicList = this.node.getChildByName("MusicList");
        this.musicListInfo = this.musicListConfig.json;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    }

    start() {
        this.initList();
    }

    //初始化圆盘,一共8个位置
    initList() {
        let musicItem: Node;
        for (let i = 0; i < 8; i++) {
            musicItem = instantiate(this.musicItemPrefab);
            musicItem.on(NodeEventType.TOUCH_END, this.clickChangeMusic, this);
            let pos = v3(0, 0);
            let radius = this.musicList.getComponent(UITransform).width / 2;
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
                this.setMusicItem(musicItem, i + (this.musicListInfo.length - 8));
            }
            musicItem.setPosition(pos);
            this.musicList.addChild(musicItem);
        }
        this.idleTopIndex = 2;
        this.idleBottomIndex = 6;
        this.currentIndex = 0;
        this.setMusicInfoPanel();
        this.rankScrollView.UpDateRank();

    }

    setMusicItem(panelItem: Node, musicIndex: number) {
        let image: Sprite = panelItem.getChildByName("Image").getChildByName("Mask").children[0].getComponent(Sprite);
        let Locked: Node = panelItem.getChildByName("Locked");
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
        Locked.active = !Boolean(HttpUnit.levelLockedInfo[musicIndex]);
        name.string = this.musicListInfo[musicIndex].musicName;
        Time.string = this.musicListInfo[musicIndex].duration;
        star.string = "x" + this.musicListInfo[musicIndex].difficulty;
    }

    setMusicInfoPanel() {
        let namePanel: Label = this.musicInfoPanel.getChildByName("Name").getComponent(Label);
        let TimePanel: Label = this.musicInfoPanel.getChildByName("Time").getComponent(Label);
        let targetPanel: Label = this.musicInfoPanel.getChildByName("Target").getComponent(Label);
        let costPanel: Label = this.musicInfoPanel.getChildByName("Cost").getComponent(Label);
        let starNum: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("StarsNum").getComponent(Label);
        let bpm: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("Bpm").getComponent(Label);
        let passPanel: Label = this.musicInfoPanel.getChildByName("Pass").getComponent(Label);

        namePanel.string = this.musicListInfo[this.currentIndex].musicName;
        TimePanel.string = "Duration：" + this.musicListInfo[this.currentIndex].duration;
        targetPanel.string = "Slide Goals：" + this.musicListInfo[this.currentIndex].slideGoals;
        costPanel.string = "Estimated Calories：" + this.musicListInfo[this.currentIndex].EstimatedCalories;
        starNum.string = "x" + this.musicListInfo[this.currentIndex].difficulty;
        bpm.string = "BPM：" + this.musicListInfo[this.currentIndex].bpm;
        passPanel.string = "Game Conditions：" + this.musicListInfo[this.currentIndex].gameConditions;
        GlobalModel.getInstances().setSelectlevel(this.currentIndex);
    }

    startPos: Vec2;
    onTouchStart(e: EventTouch) {
        this.startPos = e.getLocation();
    }

    tweenCallBack(index) {
        let pos = this.musicList.children[index].position;
        if (pos.x > 0 && pos.y > 0) {
            GlobalModel.getInstances().setSelectlevel(this.currentIndex);
            this.musicList.children[index].getChildByName("Checked").active = true;
            this.setMusicInfoPanel();
            this.node.parent.getComponent(StartUI).MusicEvent();
        } else {
            this.musicList.children[index].getChildByName("Checked").active = false;
        }
        this.rankScrollView.UpDateRank();
    }

    onTouchEnd(e: EventTouch) {
        let len = e.getLocation().y - this.startPos.y;
        if (Math.abs(len) < 100) {
            return;
        }
        if (len > 0) {
            let firstPos = new Vec3(this.musicList.children[0].position);
            this.currentIndex = this.currentIndex - 1 < 0 ? this.musicListInfo.length - 1 : this.currentIndex - 1;

            for (let i = 0; i < this.musicList.children.length; i++) {
                if (i == 7) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: firstPos })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i + 1].position })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                }
            }
        } else {
            let lastPos = new Vec3(this.musicList.children[this.musicList.children.length - 1].position);
            this.currentIndex = this.currentIndex + 1 > this.musicListInfo.length - 1 ? 0 : this.currentIndex + 1;
            for (let i = this.musicList.children.length - 1; i >= 0; i--) {
                if (i == 0) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: lastPos })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i - 1].position })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                }
            }
        }
    }

    clickChangeMusic(e: EventTouch) {
        if (e.currentTarget.position.y == 0) {
            let firstPos = new Vec3(this.musicList.children[0].position);
            this.currentIndex = this.currentIndex + 1 > this.musicListInfo.length - 1 ? 0 : this.currentIndex + 1;
            for (let i = 0; i < this.musicList.children.length; i++) {
                if (i == 7) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: firstPos })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i + 1].position })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                }
            }
        } else if (e.currentTarget.position.y == this.musicList.getComponent(UITransform).width / 2) {
            let lastPos = new Vec3(this.musicList.children[this.musicList.children.length - 1].position);
            this.currentIndex = this.currentIndex - 1 < 0 ? this.musicListInfo.length - 1 : this.currentIndex - 1;
            for (let i = this.musicList.children.length - 1; i >= 0; i--) {
                if (i == 0) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: lastPos })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i - 1].position })
                        .call(() => {
                            this.tweenCallBack(i);
                        })
                        .start();
                }
            }
        }
    }









}

