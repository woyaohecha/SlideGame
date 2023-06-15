import { _decorator, Component, Node, AudioClip, AudioSource, resources, JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {

    public static mode: number = 0;//0正常 1只接收  2不校验
    private static isEN: boolean = false;
    public static musicListConfig: any = null;   //首页歌曲配置表
    public static currentMusic: AudioClip = null;   //当前播放的歌曲
    public static currentMusicIndex: number = null;    //当前播放的歌曲index
    public static currentMusicName: string = null;    //当前播放的歌曲name
    public static currentMusicTime: number = null;      //当前播放的歌曲时长
    public static playTime: string = "00:00";
    public static currentMusicConfig: {
        rhythm: any,
        LineIndexList: any,
        speedUp: any,
        slowDown: any
    } = {
            rhythm: [],
            LineIndexList: [],
            speedUp: [],
            slowDown: []
        };   //当前歌曲的配置表

    /**
     * 加载首页歌曲配置表,在loading页需要加载完成
     */
    public static loadMusicListConfig() {
        let url = this.isEN ? "json/MusicListShowConfig_EN" : "json/MusicListShowConfig_CN";
        resources.load(url, JsonAsset, (e, asset: JsonAsset) => {
            if (e) {
                console.log(e);
                return;
            }
            this.musicListConfig = asset.json;
            this.loadMusic(0);
        })
    }


    /**
     * 加载音乐
     */
    public static loadMusic(musicIndex: number, callback?: Function) {
        if (this.currentMusic && this.currentMusicIndex == musicIndex) {
            callback(this.currentMusic);
            return;
        }
        this.currentMusicIndex = musicIndex;
        resources.load("music/main/1_" + musicIndex, AudioClip, (e, asset: AudioClip) => {
            //若index不同，则表示切换了新的音乐
            if (e || this.currentMusicIndex != musicIndex) {
                return;
            }
            this.currentMusic = asset;
            this.currentMusicName = this.musicListConfig[musicIndex].musicName;
            this.currentMusicTime = this.currentMusic.getDuration();
            if (callback) {
                callback(this.currentMusic);
            }
        })
    }


    /**
     * 加载音乐配置表
     */
    public static loadMusicConfig(callback: Function) {
        resources.load("levelConfig/" + this.currentMusicIndex, JsonAsset, (e, asset: JsonAsset) => {
            if (e) {
                return;
            }
            // this.currentMusicConfig = asset.json;
            let config: any = asset.json;

            let TimeList: any = [];
            let LineIndexList: any = [];
            let Notes = config._notes;

            let BPM: number = this.musicListConfig[this.currentMusicIndex].bpm;

            for (var i = 0; i < Notes.length; i++) {
                let time = Notes[i]._time;
                let getTime = time * (60 / BPM);
                TimeList.push(getTime);
                LineIndexList.push(Notes[i]._lineIndex)
            }

            let speedUp = config.speedUp;
            let slowDown = config.slowDown;

            if (speedUp && speedUp.length > 0) {
                for (let i = 0; i < speedUp.length; i++) {
                    speedUp[i] = Math.floor(speedUp[i] * (60 / BPM));
                }
            }
            if (slowDown && slowDown.length > 0) {
                for (let i = 0; i < slowDown.length; i++) {
                    slowDown[i] = Math.floor(slowDown[i] * (60 / BPM));
                }
            }
            this.currentMusicConfig.rhythm = TimeList;
            this.currentMusicConfig.LineIndexList = LineIndexList;
            this.currentMusicConfig.speedUp = speedUp;
            this.currentMusicConfig.slowDown = slowDown;
            callback();
        })
    }
}

