/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:53:29
 * @FilePath: \main\assets\JavaScripts\common\CamerAdapt.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { _decorator, Component, Node, CameraComponent, view, macro } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 摄像机适配类
 */
@ccclass('CamerAdapt')
export class CamerAdapt extends Component {
    private _camera!: CameraComponent;
    private _defaultTanFov!: number;

    onLoad() {
        macro.ENABLE_WEBGL_ANTIALIAS = true;
        this._camera = this.getComponent(CameraComponent)!;
        this._defaultTanFov = Math.tan(this._camera.fov / 180 * Math.PI);
        this.updateFov();
        window.addEventListener('resize', this.updateFov);
    }

    updateFov = () => {
        let tan2 = view.getVisibleSize().height / view.getDesignResolutionSize().height * this._defaultTanFov;
        this._camera.fov = Math.atan(tan2) / Math.PI * 180;
    }

    onDestroy() {
        window.removeEventListener('resize', this.updateFov);
    }
}
