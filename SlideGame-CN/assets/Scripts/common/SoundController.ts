/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:57:20
 * @FilePath: \main\assets\Scripts\common\SoundController.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { loader, AudioClip } from "cc";
import DataController from "./DataController";


/**
 * 声音控制类
 */
export class SoundController {
   /**
    * 初始化单利
    */
   private constructor() { }
   private static soundController: SoundController = null;
   public static getInstances(): SoundController {
      if (!this.soundController) {
         this.soundController = new SoundController();
      }
      return this.soundController;
   }
   /**
    *音频存放字典
    */
   private soundDict: any = null;
   /**
   //  * 初始化
   //  */
   // public init(): void {
   //    this.soundDict={};
   //    let self=this;
   //    loader.loadResDir("sound", AudioClip, function (err, assets, urls) {
   //       if (err) {
   //          return;
   //       }
   //       for (let i = 0, length = assets.length; i < length; i++) {
   //          self.soundDict[assets[i].name] = assets[i];
   //       }
   //    });
   // }
   private bgAudioClip: AudioClip = null;
   /**
    * 播放背景音乐
    */
   public playBgSound(): void {
      if (!this.bgAudioClip) {
         this.bgAudioClip = this.soundDict["bg"];
         this.bgAudioClip.setLoop(true);
      }
      if (!this.getSoundState()) return;
      if (!this.bgAudioClip) return;
      this.bgAudioClip.play();
   }

   /**
    * 暂停背景音乐
    */
   public pauseBgSound(): void {
      if (!this.bgAudioClip) return;
      this.bgAudioClip.pause();
   }

   /**
    * 播放音效
    * @param name 
    */
   public playEffect(audioClip: any): void {
      if (!this.getSoundState()) return;
      audioClip.play();
   }

   /**
    * 获取音效状态
    */
   public getSoundState(): boolean {
      return DataController.getBoolean("soundState", true);
   }
   
   /**
    * 设置音效状态
    * @param state 
    * @returns 
    */
   public setSoundState(state: boolean): void {
      DataController.setBoolean("soundState", state);
      if (state) {
         if (!this.bgAudioClip) return;
         this.bgAudioClip.play();
      } else {
         if (!this.bgAudioClip) return;
         this.bgAudioClip.pause();
      }
   }
}