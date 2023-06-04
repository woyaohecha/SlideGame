/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:48:47
 * @FilePath: \main\assets\JavaScripts\game\GameContract.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node, instantiate, Vec2, Vec3, AudioClip, loader, JsonAsset, Prefab, EventTouch, tween } from 'cc';

export interface IGameUI {
   init(): void;
   initData(): void;
   initUI(): void;
   initEvent(): void;
   /**
    * 初始化台子
    */
   initStageNode(): void;
   /**
    * 创建台子 
    * @param x   坐标
    * @param y 坐标
    * @param z 坐标
    * @param scale   //缩放比例
    */
   createStageNode(x: number, y: number, z: number, scale: number): void;
   /**
   * 刷新玩家和相机的位置
   */
   refreshPlayerAndCamera(): void;
   /**
   * 刷新玩家
   */
   refreshPlayer(index: number, middleZ: number, nextZ: number): void;
   /**
    * 刷新相机
    */
   refreshCamera(): void;
   /**
    * 初始化场景物体
    */
   initEnvNode(): void;
   /**
    * 创建场景物体  动态
    */
   createEnvNode(): void;
   /**
    * 
    */
   refreshEnvNode(): void;
   /**
    * 播放台子被踩踏动画
    */
   playTreadStageAnim(stageNode:Node): void;
   /**
    * 播放踩踏台子扩散的特下
    */
   playTreadStageEffect(stageNode:Node): void;
   /**
    * 游戏通关
    */
   gamePassLevel():void;
   /**
    * 游戏失败
    */
   gameFailLevel():void;
   /**
    * 显示通关ui
    */
   showPassUI():void;
   /**
    * 检测玩家是否踩踏在台子上
    * 0 踩在台子外  1 踩中但没有在中心  2 完美 3非常完美
    */
   checkTreadIsStage(stageNode:Node):number;
   /**
    * 玩家复活
    */
   reviveGameLevel():void;

}
export interface IGamePresenter {
   /**
    * 初始化
    */
   init(): void;
   /**
    * 初始化台子
    */
   initStageNode(): void;
   /**
    * 增加台子
    */
   addStageNode(): void;
   /**
    * 帧刷新器
    */
   update(dt: number): void;
   /**
    * 开始游戏
    */
   startGame(): void;
   /**
    * 刷新玩家和相机的位置
    */
   refreshPlayerAndCamera(dt): void;
   /**
 * 刷新玩家
 */
   refreshPlayer(): void;
   /**
    * 刷新相机
    */
   refreshCamera(): void;
   /**
    * 动态增加新的台子
    */
   addPlayerStageIndex(): void;
   /**
    * 加测是否通关
    */
   checkIsPass():boolean;
   /**
    * 获取最后一个点的时间
    */
   getLastPointData():number;
   /**
    * 获取当前玩家所在台子的索引
    */
   getPlayerStageIndex(): number;
}