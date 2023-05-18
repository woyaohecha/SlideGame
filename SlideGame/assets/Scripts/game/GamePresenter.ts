/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-04-04 10:35:28
 * @FilePath: \main\assets\Scripts\game\GamePresenter.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { IGamePresenter } from "./GameContract";
import { GameUI } from "./GameUI";
import { GameModel } from "./GameModel";
import { loader, JsonAsset } from "cc";
import { GlobalModel } from "../global/GlobalModel";


export class GamePresenter implements IGamePresenter {
   private mGameUI: GameUI = null;
   public mGameModel: GameModel = null;
   constructor(gameUI: GameUI) {
      this.mGameUI = gameUI;
      this.mGameModel = new GameModel();
   }
   //
   init(): void {
      this.mGameModel.setGrade(GlobalModel.getInstances().getDifficultGrade());
      this.mGameModel.setState(0);
      let rhythmDataLevel: Array<number> = GlobalModel.getInstances().getRhythmPointData();
      this.mGameModel.setRhythmPointData(rhythmDataLevel);
      this.mGameModel.setStageMiddleZ();

      let LineIndexListDataLevel: Array<number> = GlobalModel.getInstances().getLineIndexListData();
      this.mGameModel.setLineIndexListData(LineIndexListDataLevel);
   }

   //
   initStageNode(): void {
      //初始台子数量位10个  随着台子的移动，进行动态的创建
      for (let i = 0; i < 10; i++) {
         this.addStageNode();
      }
   }

   //
   addStageNode(): void {
      //point 实际就相当于台子的z坐标
      let point: number = this.mGameModel.getPoint();

      let x: number = 0;
      let scale: number = 0;
      //更具难度调整x坐标 以及缩放比例
      if (this.mGameModel.getGrade() == 0) {
         scale = 1;

         let LineIndex: number = this.mGameModel.getLineIndex();

         if (LineIndex == 0) {
            x = -1;
         } else if (LineIndex == 3) {
            x = 1;
         }

         // console.log("--------------------- LineIndex:", LineIndex + ",x:", x);
      } else if (this.mGameModel.getGrade() == 1) {
         scale = 0.8;
         x = (Math.floor(Math.random() * 200) - 100) / 1000;
      } else if (this.mGameModel.getGrade() == 2) {
         scale = 0.6;
         x = (Math.floor(Math.random() * 300) - 150) / 1000;
      }
      // if (this.mGameModel.getPointIndex() == 0) {
      //    x = 0;
      // }

      this.mGameUI.createStageNode(x, 0, point * -5, scale);
      this.mGameModel.addPointIndex(1);
   }

   //
   startGame(): void {
      this.mGameModel.setState(1);
   }

   //
   update(dt: number) {
      this.refreshPlayerAndCamera();
   }

   //
   refreshPlayerAndCamera(): void {
      if (this.mGameModel.getState() != 1) return;
      this.mGameUI.refreshPlayerAndCamera();
      this.refreshPlayer();
      this.refreshCamera();
   }

   //
   refreshPlayer(): void {
      let middleZ: number = this.mGameModel.getStageMiddleZ();
      let nextZ: number = this.mGameModel.getNextStageZ();
      let index: number = this.mGameModel.getPlayerStageIndex();
      this.mGameUI.refreshPlayer(index, middleZ, nextZ);
   }

   //
   refreshCamera(): void {

   }

   //
   addPlayerStageIndex(): void {
      this.mGameModel.addPlayerStageIndex();
   }

   //
   getPlayerStageIndex(): number {
      return this.mGameModel.getPlayerStageIndex();
   }

   /**
    * 获取当前游戏状态
    * @returns 
    */
   getGameState(): number {
      return this.mGameModel.getState();
   }

   /**
    * 设置当前游戏状态
    */
   setGameState(num: number): void {
      this.mGameModel.setState(num);
   }

   //
   checkIsPass(): boolean {
      if (this.mGameModel.getPlayerStageIndex() == this.mGameModel.getRhythmPointData().length) {
         return true;
      }
      return false;
   }

   //
   getLastPointData(): number {
      let pointData = this.mGameModel.getRhythmPointData();
      return pointData[pointData.length - 1];
   }

   getRhythmPointData(): Array<number> {
      let pointData = this.mGameModel.getRhythmPointData();
      return pointData;
   }
}