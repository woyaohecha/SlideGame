/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:48:30
 * @FilePath: \main\assets\JavaScripts\common\TweenController.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { tween, Vec3, Node } from "cc";

/**
 * 缓动工具类 
 */
export class TweenController {

   /**
    * 显示弹窗 
    */
   public static showDialogTween(panel: Node, call: Function): void {
      panel.scale = new Vec3(0, 0, 0);
      tween(panel).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
         .call(() => {
            if (call) call();
         })
         .start();
   }

   /**
    * 透明度闪烁
    */
   public static twinkleAlphaTween(timer: number, call: Function, complete: Function): void {
      let pos = new Vec3(1, 0, 0);
      tween(pos)
         .to(timer / 5, new Vec3(0, 1, 1), {
            onUpdate: () => {
               call(pos.x)
            }
         })
         .to(timer / 5, new Vec3(1, 1, 1), {
            onUpdate: () => {
               call(pos.x)
            }
         })
         .to(timer / 5, new Vec3(0, 1, 1), {
            onUpdate: () => {
               call(pos.x)
            }
         })
         .to(timer / 5, new Vec3(1, 1, 1), {
            onUpdate: () => {
               call(pos.x)
            }
         })
         .call(() => {
            complete()
         })
         .start()
   }

   /**
    * node 进入 由大到小
    * node out
    */
   public static scaleIn(node: Node, timer: number): void {
      node.scale = new Vec3(0, 0, 0);
      tween(node).to(0.15, { scale: new Vec3(1, 1, 1) })
         .start();
   }
   
   /**
    * 抖动
    */
   public static cameraTiggle(node: Node): void {
      let pos: Vec3 = new Vec3(0, 0, 0);
      Vec3.copy(pos, node.eulerAngles)
      tween(node)
         .to(0.015, { eulerAngles: new Vec3(pos.x + pos.x / 2000, pos.y, pos.z) })
         .to(0.015, { eulerAngles: new Vec3(pos.x, pos.y + pos.y / 2000, pos.z) })
         .to(0.015, { eulerAngles: new Vec3(pos.x, pos.y, pos.z + pos.z / 2000) })
         .to(0.015, { eulerAngles: new Vec3(pos.x - pos.x / 2000, pos.y, pos.z) })
         .to(0.015, { eulerAngles: new Vec3(pos.x, pos.y - pos.y / 2000, pos.z) })
         .to(0.015, { eulerAngles: new Vec3(pos.x, pos.y, pos.z - pos.z / 2000) })
         .start();

   }
}