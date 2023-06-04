/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:51:16
 * @FilePath: \main\assets\JavaScripts\start\StartContract.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

export interface IStartUI{
    init():void;
    initData():void;
    initUI():void;
    initEvent():void;
    /**
     * 加载并播放当前选中歌曲
     */
    playSelectMusic():void;
    /**
     * 开始按钮点击事件
     */
    btnStartGameEvent():void;
    /**
     * 退出游戏按钮点击事件
     */
    btnQuitGameEvent():void;    
    /**
     * 上一曲按钮点击事件
     */
    btnLastMusicEvent():void;
    /**
     * 下一曲按钮点击事件
     */
    btnNextMusicEvent():void;
}