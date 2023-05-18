/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-25 11:30:24
 * @FilePath: \main\assets\Scripts\start\CircleScrollview.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */
import { _decorator, Component, Node, CCInteger, EventHandler, EventTouch, UITransform, CCFloat, Vec3, Button, Vec2 } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
import { StartUI } from './StartUI';
import DataController from '../common/DataController';
import { musicItem } from './musicItem';
import { RankScrollView } from './RankScrollView';
const { ccclass, property } = _decorator;
export enum EventType {
    SCROLL_START,
    SCROLL_ING,
    SCROLL_END
}
@ccclass('CircleScrollview')
export class CircleScrollview extends Component {
    // public static EventType = EventType;
    @property(Node)
    content !: Node;

    @property(Node)
    ItemNode !: Node;

    @property({ tooltip: "是否无限翻页" })
    circlePage: boolean = true;
    @property({
        type: Button, tooltip: '左边按钮',
        visible(this: CircleScrollview) {
            return !this.circlePage;
        }
    })
    leftBtn !: Button;
    @property({
        type: Button, tooltip: '右边按钮',
        visible(this: CircleScrollview) {
            return !this.circlePage;
        }
    })
    rightBtn !: Button;

    @property({ type: CCInteger, tooltip: '单个控件之间的距离' })
    deltaY: number = 160; //x间隔距离
    @property({ type: CCFloat, tooltip: '中心点的缩放比例' })
    centerScale: number = 1.0;
    @property({ type: CCFloat, tooltip: '边缘点的缩放比例' })
    minScale: number = 0.7;
    @property({ type: CCFloat, tooltip: '滚动时的速度' })
    scrollSpeed: number = 600;
    @property({ type: EventHandler, tooltip: "选择后的回调" })
    selectEvents: Array<EventHandler> = [];

    private childs: Array<Node> = [];
    private isTouching: boolean = false;
    private isTestY: boolean = false;
    private currentIndex: number = 0;
    private _toMoveY: number = 1; //移动方向
    private moveAim: number = 0;

    private NowNode !: Node;
    private NextNode !: Node;

    private NowNodePosY = null;

    private IsPlayScrollAni: boolean = false;

    private MaxPosY: number = 150;
    private MinPosY: number = -150;
    onLoad() {

    }

    initUI() {
        this.MaxPosY = this.ItemNode.position.x;
        this.childs = [];

        for (let i = 0; i < this.content.children.length; i++) {
            this.childs[i] = this.content.children[i];
            this.childs[i].position = new Vec3(this.MaxPosY, this.deltaY * (i - 1), 0);
        }
        this.isTouching = false;
        this.isTestY = false;

        let SelectLevel = DataController.getSelectLevel();

        this.scrollTo(SelectLevel, false);

        this.content.on(Node.EventType.TOUCH_START, this._onTouch, this);
        this.content.on(Node.EventType.TOUCH_MOVE, this._onTouch, this);
        this.content.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.content.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    start() {

    }

    /** 滚动到指定节点
     * @param idy
     * @param anim 是否带移动动画
     */
    scrollTo(idy: number, anim: boolean = true) {
        this.MovePosY1 = this.MinPosY;
        this.MovePosY2 = this.MaxPosY;
        if (idy < 0 && idy >= this.childs.length) {
            return console.error(this.node.name + '->移动超出边界面');
        }

        if (idy < 0) {
            idy = this.childs.length - 1;
        }

        if (idy >= this.childs.length) {
            idy = 0;
        }

        this.currentIndex = idy;
        this.moveAim = idy;

        let currentIndex = this.currentIndex;

        GlobalModel.getInstances().setSelectlevel(currentIndex);
        this.node.parent.getComponent(StartUI).MusicEvent();
        this.node.parent.getChildByName("musicItem").getComponent(musicItem).UpdateLabel();
        this.node.parent.getChildByName("RankScrollView").getComponent(RankScrollView).UpDateRank();
        
        if (!anim) {
            this.NowNode = this.childs[this.currentIndex];
            this.NextNode = this.childs[this.currentIndex + 1];
            if (this.circlePage) {
                if (this.currentIndex + 1 >= this.childs.length) {
                    this.NextNode = this.childs[0];
                }
            }
            // this.MovePosY = 10;

            this.NowNodePosY = this.NowNode.position.clone();

            for (let i = 0; i < this.childs.length; i++) {
                this._checkChildY(this.childs[i], (i - idy) * this.deltaY);
            }
        } else {
            this.isTestY = true;
            EventHandler.emitEvents(this.selectEvents, {
                target: this,
                type: EventType.SCROLL_START,
                index: this.currentIndex
            });
        }
    }

    /** 向下滚一个点 */
    scrollToBottom() {
        if (this.isTestY) {
            return;
        }
        this._toMoveY = -1;

        this.NowNode = this.childs[this.currentIndex];
        this.NextNode = this.childs[this.currentIndex + 1];

        this.MovePosY = -50;
        if (this.circlePage) {
            if (this.currentIndex + 1 >= this.childs.length) {
                this.NextNode = this.childs[0];
            }

            if (this.currentIndex - 1 < 0) {
                this.NowNodePosY = this.childs[this.childs.length - 1].position.clone();
            } else {
                this.NowNodePosY = this.childs[this.currentIndex - 1].position.clone();
            }
        }

        console.log("向下滚一个点", this.NextNode.position.y);


        GlobalModel.getInstances().setSelectlevel(this.currentIndex + 1);

        const isRightEdge: boolean = this.currentIndex >= this.childs.length - 1;
        if (!this.circlePage && isRightEdge) {
            console.log("已经到了最右边", this.currentIndex);
        } else {
            this.currentIndex++;
            this.scrollTo(this.currentIndex);
        }
        this.updateButton();
    }

    /** 向上滚一个点 */
    scrollToTop() {
        if (this.isTestY) {
            return;
        }
        this._toMoveY = 1;

        this.NowNode = this.childs[this.currentIndex];
        this.NextNode = this.childs[this.currentIndex - 1];
        this.MovePosY = -50;
        if (this.circlePage) {
            if (this.currentIndex - 1 < 0) {
                this.NextNode = this.childs[this.childs.length - 1];
            }

            if (this.currentIndex + 1 >= this.childs.length) {
                this.NowNodePosY = this.childs[0].position.clone();
            } else {
                this.NowNodePosY = this.childs[this.currentIndex + 1].position.clone();
            }
        }

        const isLeftEdge: boolean = this.currentIndex <= 0;
        if (!this.circlePage && isLeftEdge) {
            console.log("已经到了最左边", this.currentIndex);
        } else {
            this.currentIndex--;
            this.scrollTo(this.currentIndex);
        }
        this.updateButton();
    }

    updateButton() {
        const isRightEdge: boolean = this.currentIndex >= this.childs.length - 1;
        if (!this.circlePage && isRightEdge) {
            console.log("已经到了最右边", this.currentIndex);
            if (this.leftBtn) this.leftBtn.node.active = false;
        } else {
            if (this.leftBtn) this.leftBtn.node.active = true;
        }

        const isLeftEdge: boolean = this.currentIndex <= 0;
        if (!this.circlePage && isLeftEdge) {
            console.log("已经到了最左边", this.currentIndex);
            if (this.rightBtn) this.rightBtn.node.active = false;
        } else {
            if (this.rightBtn) this.rightBtn.node.active = true;
        }
    }

    MovePosY1: number = this.MinPosY;
    MovePosY2: number = this.MaxPosY;
    MovePosY: number = 30;
    _checkChildY(child: Node, y: number) {
        if (this.circlePage) {
            if (y > this.childs.length / 2 * this.deltaY) {
                y -= this.childs.length * this.deltaY;
            } else if (y < -this.childs.length / 2 * this.deltaY) {
                y += this.childs.length * this.deltaY;
            }
        }

        y = Math.floor(y);

        let dy = Math.min(Math.abs(y), this.deltaY);
        let scale: number = (1 - dy / this.deltaY) * (this.centerScale - this.minScale) + this.minScale;

        if (scale >= 0.9) {
            scale = 1;
        }
        child.scale = new Vec3(scale, scale, 1);

        if (this.NowNode == child) {
            this.MovePosY2 += this.MovePosY;
            if (this.MovePosY2 <= this.MinPosY) {
                this.MovePosY2 = this.MinPosY;
            }

            if (this.MovePosY2 >= this.MaxPosY) {
                this.MovePosY2 = this.MaxPosY;
            }

            if (Math.abs(this.NowNodePosY.y) - Math.abs(y) <= 10) {
                y = this.NowNodePosY.y;
            }
            child.position = new Vec3(this.MovePosY2, y, child.position.z);
            return;
        }

        if (this.NextNode == child) {
            this.MovePosY1 -= this.MovePosY;
            if (this.MovePosY1 <= this.MinPosY) {
                this.MovePosY1 = this.MinPosY;
            }

            if (this.MovePosY1 >= this.MaxPosY) {
                this.MovePosY1 = this.MaxPosY;
            }

            child.position = new Vec3(this.MovePosY1, y, child.position.z);
            return;
        }

        child.position = new Vec3(this.MinPosY, y, child.position.z);
    }

    _onTouch(event: EventTouch) {

    }

    _onTouchEnd(event: EventTouch) {
        if (!this.node.parent.getComponent(StartUI).isCutMusic || this.IsPlayScrollAni) {
            return;
        }
        this.isTouching = false;
        this.IsPlayScrollAni = true;

        if (!this.circlePage) {
            let edge = this._isMoveEdge();
            if (edge.right) {
                console.log("最右边 无法动");
                return;
            }
            if (edge.left) {
                console.log("最左边 无法动");
                return;
            }
        }


        let deltaY = event.getUILocation().y - event.getUIStartLocation().y;
        if (deltaY >= 0) {
            this.scrollToTop();
        } else {
            this.scrollToBottom();
        }
    }

    _move(dt: number) {
        if (dt === 0) return;
        if (!this.circlePage) {
            let edge = this._isMoveEdge();
            if (dt < 0 && edge.right) {
                console.log("最右边 无法动");
                return;
            }
            if (dt > 0 && edge.left) {
                console.log("最左边 无法动");
                return;
            }
        }

        for (let i = 0; i < this.childs.length; i++) {
            this._checkChildY(this.childs[i], this.childs[i].position.y + dt);
        }
    }

    /**
     * 是否到达左右边缘
     * @returns {{left: boolean, right: boolean}}
     */
    _isMoveEdge() {
        const leftEdge = this.childs[0].position.y >= 0;
        const rightEdge = this.childs[this.childs.length - 1].position.y <= 0;
        return {
            left: leftEdge,
            right: rightEdge
        };
    }

    update(dt: number) {
        if (this.isTouching || !this.isTestY) {
            return;
        }
        let stepy = this._toMoveY * dt * this.scrollSpeed;

        if (this.childs.length < 0) return;
        if (this.circlePage) {
            if (this.moveAim >= this.childs.length) {
                this.moveAim -= this.childs.length + 1;
            }
            if (this.moveAim < 0) {
                this.moveAim += this.childs.length + 1;
            }
        }
        if (this.moveAim < 0 || this.moveAim >= this.childs.length) return;

        let ly = this.childs[this.moveAim].position.y;
        for (let i = 0; i < this.childs.length; i++) {
            this._checkChildY(this.childs[i], this.childs[i].position.y + stepy);
        }

        let y = this.childs[0].position.y;
        let idy = Math.round(y / this.deltaY);
        let toy = this.deltaY * idy;
        let cy = this.childs[this.moveAim].position.y;
        if ((Math.abs(cy) - 0) < 50) {
            for (let i = 0; i < this.childs.length; i++) {
                if (Math.abs(this.childs[i].position.y) <= Math.abs(stepy)) {
                    this.currentIndex = i;
                    break;
                }
            }
            for (let i = 0; i < this.childs.length; i++) {
                this._checkChildY(this.childs[i], this.childs[i].position.y + toy - y);
            }
            let event = {
                target: this,
                type: EventType.SCROLL_END,
                index: this.currentIndex
            }
            EventHandler.emitEvents(this.selectEvents, event);

            this.isTestY = false;
            this.IsPlayScrollAni = false;
        }
    }
}
