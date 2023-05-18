/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:47:17
 * @FilePath: \main\assets\JavaScripts\common\DialogController.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { tween, Vec3, Node, instantiate } from "cc";
import { PoolController } from "./PoolController";
export class DialogController {
   private constructor() { }
   private static dialogC: DialogController = null;
   private dict: any = {};
   private dialogPanel: Node = null;
   public static getInstances(): DialogController {
      if (!this.dialogC) {
         this.dialogC = new DialogController();
      }
      return this.dialogC;
   }
   public initDialogPanel(node: Node): void {
      this.dialogPanel = node;
   }
   public showDialog(name: string): Node {
      let dialogNode: Node = null;
      if (this.dict.hasOwnProperty(name)) {
         dialogNode = this.dict[name];
      } else {
         // if (DialogRes.dialogDict.hasOwnProperty(name)) {
         //    dialogNode = instantiate(DialogRes.dialogDict[name]["prefab"]);
         //    this.dict[name] = dialogNode;
         // } else {
         //    console.log("don't find prefab dialog by name---");
         //    return null;
         // }
      }
      this.dialogPanel.addChild(dialogNode);
      return dialogNode;
   }

   public showHint(str:string):void{
      // let hintUi: Node = PoolController.getDictPool(PoolRes.HINT_EFFECT_KEY);
      // if (hintUi) {
      //    hintUi.getComponent(HintEffect).init(str);
      //    this.dialogPanel.addChild(hintUi);
      // }
     
   }

}