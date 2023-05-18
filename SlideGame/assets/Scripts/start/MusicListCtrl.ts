import { _decorator, Component, Node, Prefab, v3, UITransform, instantiate, math, NodeEventType, EventTouch, CCObject, Vec3, Vec2, tween, JsonAsset, Sprite, SpriteFrame, Label, resources, loader, Texture2D, AudioSource } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
import HttpUnit from '../NetWork/HttpUnit';
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

    musicList: Node;
    musicListInfo: object;

    onLoad() {
        this.musicList = this.node.getChildByName("MusicList");
        this.musicListInfo = this.musicListConfig.json;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.initList();
    }

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
                    GlobalModel.getInstances().setSelectlevel(0);
                    // this.node.parent.getComponent(StartUI).MusicEvent();
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
            this.setMusicItem(musicItem, i);
            musicItem.setPosition(pos);
            this.musicList.addChild(musicItem);
        }
        this.setMusicInfoPanel(0);

    }

    setMusicItem(musicItem: Node, index: number) {
        let image: Sprite = musicItem.getChildByName("Image").getChildByName("Mask").children[0].getComponent(Sprite);
        let Locked: Node = musicItem.getChildByName("Locked");
        let name: Label = musicItem.getChildByName("Desc").getChildByName("Name").getComponent(Label);
        let Time: Label = musicItem.getChildByName("Desc").getChildByName("Time").getComponent(Label);
        let star: Label = musicItem.getChildByName("Desc").getChildByName("Star").getComponent(Label);



        resources.load("musicItemImages/image_" + index + "/spriteFrame", SpriteFrame, (e, asset) => {
            if (e) {
                console.log(e);
                return;
            }
            image.spriteFrame = asset;

        })
        Locked.active = !Boolean(HttpUnit.levelLockedInfo[index]);
        name.string = this.musicListInfo[index].musicName;
        Time.string = this.musicListInfo[index].duration;
        star.string = "x" + this.musicListInfo[index].difficulty;
    }

    setMusicInfoPanel(index) {
        let namePanel: Label = this.musicInfoPanel.getChildByName("Name").getComponent(Label);
        let TimePanel: Label = this.musicInfoPanel.getChildByName("Time").getComponent(Label);
        let targetPanel: Label = this.musicInfoPanel.getChildByName("Target").getComponent(Label);
        let costPanel: Label = this.musicInfoPanel.getChildByName("Cost").getComponent(Label);
        let starNum: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("StarsNum").getComponent(Label);
        let bpm: Label = this.musicInfoPanel.getChildByName("Difficulty").getChildByName("Bpm").getComponent(Label);
        let passPanel: Label = this.musicInfoPanel.getChildByName("Pass").getComponent(Label);

        namePanel.string = this.musicListInfo[index].musicName;
        TimePanel.string = "Duration：" + this.musicListInfo[index].duration;
        targetPanel.string = "Slide Goals：" + this.musicListInfo[index].slideGoals;
        costPanel.string = "Estimated Calories：" + this.musicListInfo[index].EstimatedCalories;
        starNum.string = "x" + this.musicListInfo[index].difficulty;
        bpm.string = "BPM：" + this.musicListInfo[index].bpm;
        passPanel.string = "Game Conditions：" + this.musicListInfo[index].gameConditions;
    }

    startPos: Vec2;
    onTouchStart(e: EventTouch) {
        this.startPos = e.getLocation();
    }

    onTouchEnd(e: EventTouch) {
        let len = e.getLocation().y - this.startPos.y;
        if (Math.abs(len) < 100) {
            return;
        }

        if (len > 0) {
            let firstPos = new Vec3(this.musicList.children[0].position);
            for (let i = 0; i < this.musicList.children.length; i++) {
                let songIndex = i > 4 ? 4 : i;
                if (i == 7) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: firstPos })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.setMusicInfoPanel(i);
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i + 1].position })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                }
            }
        } else {
            let lastPos = new Vec3(this.musicList.children[this.musicList.children.length - 1].position);
            for (let i = this.musicList.children.length - 1; i >= 0; i--) {
                let songIndex = i > 4 ? 4 : i;
                if (i == 0) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: lastPos })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i - 1].position })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                }
            }
        }

    }

    clickChangeMusic(e: EventTouch) {
        if (e.currentTarget.position.y == 0) {
            let firstPos = new Vec3(this.musicList.children[0].position);
            for (let i = 0; i < this.musicList.children.length; i++) {
                let songIndex = i > 4 ? 4 : i;
                if (i == 7) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: firstPos })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.setMusicInfoPanel(i);
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i + 1].position })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                }
            }
        } else if (e.currentTarget.position.y == this.musicList.getComponent(UITransform).width / 2) {
            let lastPos = new Vec3(this.musicList.children[this.musicList.children.length - 1].position);
            for (let i = this.musicList.children.length - 1; i >= 0; i--) {
                let songIndex = i > 4 ? 4 : i;
                if (i == 0) {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: lastPos })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                } else {
                    tween(this.musicList.children[i])
                        .to(0.1, { position: this.musicList.children[i - 1].position })
                        .call(() => {
                            let pos = this.musicList.children[i].position;
                            if (pos.x > 0 && pos.y > 0) {
                                this.setMusicInfoPanel(i);
                                GlobalModel.getInstances().setSelectlevel(songIndex);
                                this.musicList.children[i].getChildByName("Checked").active = true;
                                this.node.parent.getComponent(StartUI).MusicEvent();
                            } else {
                                this.musicList.children[i].getChildByName("Checked").active = false;
                            }
                        })
                        .start();
                }
            }
        }
    }







}

