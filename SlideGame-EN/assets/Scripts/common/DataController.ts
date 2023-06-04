/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-18 10:40:51
 * @FilePath: \main\assets\Scripts\common\DataController.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { sys, _decorator } from "cc";

const { ccclass, property } = _decorator;
/**
 * 本地数据管理
 */
@ccclass
export default class DataController {
    /**
     * 获取数值
     * @param key 
     * @param defaultValue 
     * @returns 
     */
    public static getNumber(key: string, defaultValue = 0) {
        let value = this.getItem(key);
        if (value) {
            return parseFloat(value);
        }
        return defaultValue;
    }

    /**
     * 增加数值
     * @param key 
     * @param add 
     * @param max 
     */
    public static addNumber(key: string, add: number, max?: number) {
        let old = this.getNumber(key);
        let value = old + add;
        if (max != null) {
            value = Math.max(Math.min(value, max), 0);
        }
        this.setNumber(key, value);
    }

    /**
     * 设置数值
     * @param key 
     * @param value 
     */
    public static setNumber(key: string, value: number) {
        this.setItem(key, value.toString());
    }

    /**
     * 获取布尔值
     * @param key 
     * @param defaultValue 
     * @returns 
     */
    public static getBoolean(key: string, defaultValue = false) {
        let value = this.getItem(key);
        if (value == "1") {
            return true;
        } else if (value == "0") {
            return false;
        }
        return defaultValue;
    }

    /**
     * 设置布尔值
     * @param key 
     * @param value 
     */
    public static setBoolean(key: string, value: boolean) {
        if (value) {
            this.setItem(key, "1");
        } else {
            this.setItem(key, "0");
        }
    }

    /**
     * 通过key获取字符串
     * @param key 
     * @param defaultValue 
     * @returns 
     */
    public static getString(key: string, defaultValue = "") {
        let value = this.getItem(key);
        return value ? value : defaultValue;
    }

    /**
     * 通过key设置字符串
     * @param key 
     * @param value 
     */
    public static setString(key: string, value: string) {
        this.setItem(key, value);
    }

    private static setItem(key: string, value: string) {
        sys.localStorage.setItem(key, value)
    }

    private static getItem(key: string): string {
        return sys.localStorage.getItem(key)
    }

    public static getObject(key, defaultValue) {
        let str = this.getString(key);
        if (str == null || str == "") {
            return defaultValue;
        }
        return JSON.parse(str);
    }

    public static setObject(key, object) {
        let str = JSON.stringify(object);
        this.setString(key, str);
    }


    public static setMaxScore(score: number = 0): void {
        if (score > this.getMaxScore()) {
            this.setNumber("max_score", score);
        }
    }
    public static getMaxScore(): number {
        return this.getNumber("max_score");
    }

    public static setAuthorize(state: boolean) {
        this.setBoolean("Authorize", state);
    }
    public static isAuthorize() {
        return this.getBoolean("Authorize", false);
    }
    public static getNickname() {
        return this.getString("Nickname", "");
    }

    public static setNickname(name) {
        this.setString("Nickname", name);
    }
    public static getPhoto() {
        return this.getString("Photo", "");
    }

    public static setPhoto(value) {
        this.setString("Photo", value);
    }
    public static setOpenid(value) {
        this.setString("Openid", value);
    }
    public static getOpenid() {
        return this.getString("Openid", "");
    }

    public static setSelectMode(value) {
        this.setNumber("SelectMode", value);
    }
    public static getSelectMode() {
        return this.getNumber("SelectMode", 1);
    }

    public static setSelectlevel(value) {
        this.setNumber("Selectlevel", value);
    }
    public static getSelectLevel() {
        return this.getNumber("Selectlevel", 0);
    }
}
