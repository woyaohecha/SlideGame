/*
 * @Author: 林武
 * @Date: 2023-05-18 10:19:28
 * @LastEditors: 林武
 * @LastEditTime: 2023-05-18 10:21:46
 * @FilePath: \main\assets\Scripts\common\core\SoundManager.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, AudioSource, game, assetManager, AudioClip, director } from 'cc';
import { ResourcesMgr } from './ResourcesMgr';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {

    @property(AudioSource)
    private musicSource: AudioSource = null;

    @property(AudioSource)
    private soundSource: AudioSource = null;

    private static _instance: SoundManager;

    static get Instance() {
        return this._instance;
    }

    onLoad() {

        SoundManager._instance = this;

        director.addPersistRootNode(this.node);
    }

    /**
   * 播放音乐
   * @param {Boolean} loop 是否循环播放
   */
    playMusic(loop: boolean) {

        this.musicSource.loop = loop;
        let self = this;
        this.scheduleOnce(() => {
            ResourcesMgr.Get<AudioClip>(SoundName.背景音乐, "Sound").then((res) => {
                self.musicSource.clip = res;
                self.musicSource.play();
            });
        }, 1);
    }


    loadBundle(bundle, remote, cb?) {
        assetManager.loadBundle(bundle, function (err, bundle) {
            if (err) {
                return console.log(err);
            }
            bundle.load(remote, (err2, prefab) => {
                if (err2) {
                    return console.log(err2);
                }
                cb && cb(prefab)
            })
        }.bind(this))
    }


    /**
    * 播放音效
    * @param  name 音效名称
    */
    playSound(name: string) {
        // 注意：第二个参数 “volumeScale” 是指播放音量的倍数，最终播放的音量为 “audioSource.volume * volumeScale”

        let self = this;
        ResourcesMgr.Get<AudioClip>(name, "Sound").then((res) => {
            self.soundSource.playOneShot(res);
        })
    }
    /** 音效是否在播放*/
    public GetSoundIsPlay(): boolean {
        return this.soundSource.playing;
    }

    public PlayClickSound() {
        if (ResourcesMgr.IsLoadEndAssest) {
            this.playSound(SoundName.按键);
        }
    }
}

export enum SoundName {
    按键 = "anjian",
    背景音乐 = "bgm",
    弹开 = "tankai",
    滑落 = "hualuo",
    获得纸钞 = "addGold",
    命中 = "mingzhong",
}