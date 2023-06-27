/*
 * @Author: 林武
 * @Date: 2023-04-18 10:20:42
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-18 11:17:50
 * @FilePath: \main\assets\Scripts\start\PlayerInfoView.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */
import { _decorator, Component, Node, Label, assetManager, ImageAsset, Sprite, SpriteFrame, Texture2D } from 'cc';
import HttpUnit from '../NetWork/HttpUnit';
const { ccclass, property } = _decorator;

@ccclass('PlayerInfoView')
export class PlayerInfoView extends Component {
    @property({ type: Node })
    Avatar: Node = null;

    @property({ type: Label })
    nickname: Label = null;

    @property({ type: Label })
    music_num: Label = null;

    @property({ type: Label })
    level_num: Label = null;

    @property({ type: Label })
    rank_max: Label = null;

    @property({ type: Label })
    pace_max: Label = null;

    @property({ type: Label })
    pace_av: Label = null;

    inited: boolean = false;

    protected onEnable(): void {
        var self = this;
        // HttpUnit.getUserInfoByToken();
        if (!this.inited) {
            this.initInfo();
        }
    }

    start() {
        // if (HttpUnit.UserInfo) {
        //     var self = this;
        //     this.nickname.string = HttpUnit.UserInfo.nickname;
        //     this.music_num.string = HttpUnit.UserInfo.music_num;
        //     this.level_num.string = HttpUnit.UserInfo.level_num;
        //     this.rank_max.string = HttpUnit.UserInfo.rank_max;
        //     this.pace_max.string = HttpUnit.UserInfo.pace_max + "%";
        //     this.pace_av.string = HttpUnit.UserInfo.pace_av + "%";

        //     var avatarUrl = HttpUnit.UserInfo.avatar_uri;
        //     console.log("加载个人信息头像");
        //     if (avatarUrl) {
        //         assetManager.loadRemote(avatarUrl, { ext: '.jpg' }, (err, data: ImageAsset) => {
        //             if (err) {
        //                 console.log(err, data);
        //                 return;
        //             }
        //             let sp: SpriteFrame = new SpriteFrame();
        //             let tx: Texture2D = new Texture2D();
        //             tx.image = data;
        //             sp.texture = tx;
        //             self.Avatar.getComponent(Sprite).spriteFrame = sp;
        //         });
        //     }
        // } else {
        //     this.node.active = false;
        // }
    }

    initInfo() {
        if (HttpUnit.UserInfo) {
            var self = this;
            this.nickname.string = HttpUnit.UserInfo.nickname;
            this.music_num.string = HttpUnit.UserInfo.music_num;
            this.level_num.string = HttpUnit.UserInfo.level_num;
            this.rank_max.string = HttpUnit.UserInfo.rank_max;
            this.pace_max.string = HttpUnit.UserInfo.pace_max + "%";
            this.pace_av.string = HttpUnit.UserInfo.pace_av + "%";
            if (HttpUnit.userProfile) {
                self.Avatar.getComponent(Sprite).spriteFrame = HttpUnit.userProfile;
            }
        } else {
            this.node.active = false;
        }
    }

    update(deltaTime: number) {

    }
}

