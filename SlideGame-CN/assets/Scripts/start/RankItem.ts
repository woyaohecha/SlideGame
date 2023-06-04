/*
 * @Author: 林武
 * @Date: 2023-04-18 09:34:06
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-18 10:15:42
 * @FilePath: \main\assets\Scripts\start\RankItem.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */
import { _decorator, Component, Node, Label, Sprite, assetManager, ImageAsset, SpriteFrame, Texture2D, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RankItem')
export class RankItem extends Component {
    @property({ type: Node })
    RankImg1: Node = null;

    @property({ type: Node })
    RankImg2: Node = null;

    @property({ type: Label })
    rownum: Label = null;

    @property({ type: Node })
    Avatar: Node = null;

    @property({ type: Label })
    nickname: Label = null;

    @property({ type: Label })
    score: Label = null;
    start() {
        if(this.node.parent.parent.parent.parent.name == "StartUI"){
            this.nickname.color = new Color(125,125,125);
            this.score.color = new Color(255,255,255);
        }
    }

    update(deltaTime: number) {

    }

    InitData(data) {
        if (data.rownum <= 3) {
            this.RankImg2.active = false;
        }

        if (data.rownum > 10) {
            this.RankImg1.active = false;
        }
        this.rownum.string = data.rownum;
        this.nickname.string = data.nickname;
        this.score.string = data.score;

        var self = this;
        var avatarUrl = data.avatar_uri;
        console.log("------------------------- avatarUrl:", avatarUrl);
        if(avatarUrl){
            assetManager.loadRemote(avatarUrl, { ext: '.jpg' }, (err, data: ImageAsset) => {
                if (err) {
                    console.log(err, data);
                    return;
                }
                let sp: SpriteFrame = new SpriteFrame();
                let tx: Texture2D = new Texture2D();
                tx.image = data;
                sp.texture = tx;
                self.Avatar.getComponent(Sprite).spriteFrame = sp;
            });
        }
    }
}

