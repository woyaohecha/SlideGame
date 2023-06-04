/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-05-15 13:59:27
 * @FilePath: \main\assets\Scripts\global\GlobalModel.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node } from 'cc';
import DataController from '../common/DataController';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;


export class GlobalModel {
    currentMusicTime: number = 0;
    private static globalMode: GlobalModel = null;
    private constructor() { }

    public static getInstances(): GlobalModel {
        if (!this.globalMode) {
            this.globalMode = new GlobalModel();
        }
        return this.globalMode;
    }

    /**
     * 关卡配置信息测试
     */
    private levelConfig_Test: any = null;
    public setLevelConfig_Test(data: any, loadResName, loadResIndex): void {
        this.levelConfig_Test = data;

        this.getNotes_Test(loadResName, loadResIndex);
    }

    public getNotes_Test(loadResName, loadResIndex): any {
        let TimeList: any = [];
        let LineIndexList: any = [];
        let Notes = this.levelConfig_Test['_notes'];
        let BPM = this.levelConfig_Test['_bpm'];
        for (var i = 0; i < Notes.length; i++) {
            let time = Notes[i]['_time'];
            let getTime = time * (60 / BPM);
            TimeList.push(getTime);

            LineIndexList.push(Notes[i]['_lineIndex'])
        }

        let speedUp = this.levelConfig_Test['speedUp'];
        let slowDown = this.levelConfig_Test['slowDown'];

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

        let levelConfigName = "1_" + loadResIndex;
        this.levelConfig[levelConfigName]['rhythm'] = JSON.stringify(TimeList);
        this.levelConfig[levelConfigName]['name'] = loadResName;
        this.levelConfig[levelConfigName]['LineIndexList'] = JSON.stringify(LineIndexList);
        this.levelConfig[levelConfigName]['speedUp'] = speedUp;
        this.levelConfig[levelConfigName]['slowDown'] = slowDown;
        console.log("--------------------- this.levelConfig:", this.levelConfig);
    }

    //-------------------------------------------------- 

    /**
     * 关卡配置信息
     */
    private levelConfig: any = null;
    /**
     * 设置关卡配置信息
     */
    public setLevelConfig(data: any): void {
        this.levelConfig = data;
    }

    /**
     * 获取关卡配置信息
     */
    public getLevelConfig(): any {
        return this.levelConfig;
    }

    /**
     * 获取指定关卡配置信息
     */
    public getLevelConfigByKey(key: string): any {
        return this.levelConfig[key];
    }

    /**
     * 设置选择模式
     */
    private selectMode: number = 0
    private selectLevel: number = 0
    // private selectMusicKey:string="";
    private selectMusicData: string = "";
    public setSelectMode(num: number): void {
        this.selectMode = num;

        DataController.setSelectMode(this.selectMode);
    }

    /**
     * 设置当前模式的选择关卡
     */
    public setSelectlevel(num: number): void {
        this.selectLevel = num;
        let key: string = this.selectMode + "_" + this.selectLevel;
        this.selectMusicData = this.getLevelConfigByKey(key);

        DataController.setSelectlevel(this.selectLevel);
    }

    public getSelectMode(): number {
        return this.selectMode;
    }
    public getSelectlevel(): number {
        return this.selectLevel;
    }

    /**
     * 获取当前选中模式歌曲的数量
     */
    public getSelectModeNum(): number {
        if (this.selectMode == 0) {
            return this.levelConfig["config"]["cartoon"];
        } else if (this.selectMode == 1) {
            return this.levelConfig["config"]["fashion"];
        } else if (this.selectMode == 2) {
            return this.levelConfig["config"]["class"];
        }
    }

    /**
     * 
     */
    public getRhythmPointData(): Array<number> {
        return JSON.parse(this.selectMusicData["rhythm"]);
        // return JSON.parse(GameData.currentMusicConfig[])
    }

    public getLineIndexListData(): Array<number> {
        return JSON.parse(this.selectMusicData["LineIndexList"]);
    }

    /**
     * 获取当前关键音乐键值
     */
    public getMisicKeyLevel(): string {
        let key: string = this.selectMode + "_" + this.selectLevel;
        return key;
    }

    /**
     * 获取当前歌曲名称
     */
    public getMisicNameLevel(): string {
        return this.selectMusicData["name"];
    }

    /**
     * 获取当前模块和关卡的数据点
     */
    public getAmpPointData(): Array<number> {
        return JSON.parse(this.selectMusicData["amp"]);
    }

    /**
     * 获取歌曲的时间
     */
    public getMisicTimerLevel(): number {
        return Math.floor(this.selectMusicData["timer"]);
    }

    /**
     * 加速字段
     * @returns 
     */
    public getSpeedUp(): number[] {
        return this.selectMusicData["speedUp"];
    }

    /**
     * 减速字段
     * @returns 
     */
    public getSlowDown(): number[] {
        return this.selectMusicData["slowDown"];
    }

    /**
     * 选择的关卡难度等级
     */
    private difficultGrade: number = 0;
    public setDifficultGrade(num: number): void {
        this.difficultGrade = num;
    }
    public getDifficultGrade(): number {
        return this.difficultGrade;
    }

    private GameOverType: number = 0;
    public setGameOver(value) {
        this.GameOverType = value;
    }
    public getGameOver() {
        return this.GameOverType;
    }

    private TimeLabel: string = "";
    public setTimeLabel(value) {
        this.TimeLabel = value;
    }
    public getTimeLabel() {
        return this.TimeLabel;
    }

    playTime = "0";
    public getPlayTime() {
        return this.playTime;
    }

    private GameNumLabel: string = "";
    public setGameNumLabel(value) {
        this.GameNumLabel = value;
        console.log("GameNumLabel:", value);
    }
    public getGameNumLabel() {
        return this.GameNumLabel;
    }

    private GameProgressBar: number = 0;
    public setGameProgressBar(value) {
        this.GameProgressBar = value;
    }
    public getGameProgressBar() {
        return this.GameProgressBar;
    }

    private MaxCOMBO: number = 0;
    public setMaxCOMBO(value) {
        this.MaxCOMBO = value;
    }
    public getMaxCOMBO() {
        return this.MaxCOMBO;
    }

    private MISS: number = 0;
    public setMISS(value) {
        this.MISS = value;
    }
    public getMISS() {
        return this.MISS;
    }
}
