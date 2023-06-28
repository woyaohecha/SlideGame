/*
 * @Author: 林武
 * @Date: 2022-02-11 13:50:11
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-20 11:48:21
 * @FilePath: \main\assets\Scripts\NetWork\HttpUnit.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by 林武, All Rights Reserved. 
 */

import { assetManager, ImageAsset, SpriteFrame, Texture2D } from "cc";
import HttpRequest from "./HttpRequest";
import NetConfig from "./NetConfig";

export default class HttpUnit {

    public static token = "GCZ+KlOB6TNvJgT5il7hKrEDY25QKbd9rfctQ0PM0tUBsF9OVFskJaut+G/EGve2VWos52EfA/YqkFmbeznYdsQn5oIeszxggUj5G/XP9iAmAvUMjUDnnCFInXdBCEYYDsmLautwxAhlufnZqWltVaukXnfogaRL+A9pduXXbc+MZxOH2l3OPc0fIyc+6NYN";

    public static uid = "";

    public static userProfile: SpriteFrame = null;

    public static UserInfo = null;

    public static levelLockedInfo = [1, 1, 1, 1, 1, 0, 0, 0];

    public static Requset(url: string, data: any, caller: any, completed: Function, error: (...args) => void, method: string, responseType: string = "json", headers: [] = null): void {
        let xhr: HttpRequest = new HttpRequest();
        xhr.once(HttpRequest.COMPLETE, (data) => {
            if (data.code != 200 && data.code != 1000) {
                this.Error(xhr, data);
                error && error.call(data);
                return;
            }
            completed && completed.call(caller, data);
        }, null);
        xhr.once(HttpRequest.ERROR, error, caller);
        xhr.once(HttpRequest.ERROR, this.Error, HttpUnit);
        xhr.send(url, data, method, responseType, headers);
    }

    public static Post(url: string, data: any, caller: any, completed: Function, error: (...args) => void, responseType: string = "json", headers: [] = null): void {
        this.Requset(url, data, caller, completed, error, "post", responseType, headers);
    }

    public static Get(url: string, data: any, caller: any, completed: Function, error: (...args) => void, responseType: string = "json", headers: [] = null): void {
        this.Requset(url, data, caller, completed, error, "get", responseType, headers);
    }

    public static PostJson(url: string, data: any, caller: any, completed: Function, error: (...args) => void) {
        this.Post(url, data, caller, completed, error, "json");
    }

    private static Error(xhr: HttpRequest, message: any): void {
        console.log("Requset Error, Url:" + xhr.url + ", Error Message:" + JSON.stringify(message));
    }

    public static JsonToKeyValue(param: any): string {
        let res = ["?"];
        for (var key in param) {
            res.push(key + '=' + param[key]);
        }
        return res.join('&');
    }

    /**
     * 加载用户信息
     */
    public static getUserInfoByToken() {
        var url = NetConfig.RootPath + NetConfig.getUserInfoByToken;
        let paramsObj: any = {};
        paramsObj.token = HttpUnit.token;
        HttpUnit.Post(url, paramsObj, this, (res) => {
            console.log("------------------------ HttpUnit 加载用户信息 res:", res);
            if (res.data) {
                HttpUnit.uid = res.data.uid;
                HttpUnit.UserInfo = res.data;
            }
        }, null);
    }

    /**
     * 获取用户运动记录
     */
    public static getRecordByUid(callback?) {
        var url = NetConfig.RootPath + NetConfig.getRecordByUid;
        let paramsObj: any = {};
        paramsObj.uid = HttpUnit.uid;
        let KeyValue = HttpUnit.JsonToKeyValue(paramsObj);

        url = url + KeyValue;
        HttpUnit.Get(url, null, this, (res) => {
            console.log("------------------------ HttpUnit 获取用户运动记录 res:", res);
            if (res.data) {
                if (callback) {
                    callback(res.data);
                }
            }
        }, null);
    }

    /**
     * 保存用户运动记录
     */
    public static saveUesrRecord(level_num: number, pace_num: number, score: number, song_name: string, callback?) {
        console.log("------------------------ HttpUnit 保存用户运动记录 level_num:", level_num + ",pace_num:", pace_num + ",score:", score + ",song_name:", song_name);
        var url = NetConfig.RootPath + NetConfig.saveUesrRecord;
        let paramsObj: any = {};
        paramsObj.level_num = level_num;
        paramsObj.pace_num = pace_num;
        paramsObj.score = score;
        paramsObj.song_name = song_name;
        paramsObj.uid = HttpUnit.uid;
        let KeyValue = HttpUnit.JsonToKeyValue(paramsObj);

        url = url + KeyValue;

        HttpUnit.Get(url, null, this, (res) => {
            console.log("------------------------ HttpUnit 保存用户运动记录 res:", res);
            if (res.data) {
                if (callback) {
                    callback(res.data);
                }
            }
        }, null);
    }

    /**
     * 获取某个歌曲的排行榜数据
     */
    public static getSongtRank(song_name, callback?) {
        var url = NetConfig.RootPath + NetConfig.getSongtRank;
        let paramsObj: any = {};
        paramsObj.uid = HttpUnit.uid;
        paramsObj.song_name = song_name;
        let KeyValue = HttpUnit.JsonToKeyValue(paramsObj);

        url = url + KeyValue;

        HttpUnit.Get(url, null, this, (res) => {
            console.log("------------------------ HttpUnit 获取歌曲:" + song_name + "的排行榜数据 res:", res);
            if (res.data) {
                if (callback) {
                    callback(res.data);
                }
            }
        }, null);
    }

    public static loadUserProfile(callback: Function) {
        let url = this.UserInfo.avatar_uri;
        if (!url) {
            return;
        }
        assetManager.loadRemote(url, (e, image: ImageAsset) => {
            let sp = new SpriteFrame();
            let texture = new Texture2D();
            texture.image = image;
            sp.texture = texture;
            this.userProfile = sp;
            callback();
        })
    }
}