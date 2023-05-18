/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:51:41
 * @FilePath: \main\assets\JavaScripts\start\StartModel.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import DataController from "../common/DataController"

export class StartModel {
    constructor() { };
    public getSelectLevel(): number {
        return DataController.getNumber("selectLevelID", 0);
    }
}