/*
 * @Author: 林武
 * @Date: 2023-03-22 16:16:37
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-22 17:47:31
 * @FilePath: \main\assets\JavaScripts\common\PoolController.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 林武, All Rights Reserved. 
 */

import { Prefab, Node, NodePool, instantiate, _decorator } from "cc";

const { ccclass, property } = _decorator;
/**
 * 对象池管理类
 */
@ccclass
export class PoolController {
    private static pool_dict: any = {};

    /**
     * 初始化对象池
     * @param name 
     * @param num 
     * @param prefab 
     */
    public static initDictPool(name: string, num: number, prefab: Prefab | Node): void {
        if (!this.pool_dict.hasOwnProperty(name)) {
            let pool: NodePool = new NodePool();
            for (let i = 0; i < num; i++) {
                let item: any = instantiate(prefab);
                pool.put(item);
            }
            this.pool_dict[name] = pool;
        }
    }

    /**
     * 获取对象池
     */
    public static getDictPool(name: string): Node {
        if (!this.pool_dict.hasOwnProperty(name)) {
            console.error(name + " 对象池不存在");
            return null;
        }
        let node: Node = null;
        let pool: NodePool = this.pool_dict[name];
        if (pool.size() > 0) {
            node = pool.get();
        } else {
            console.error(name + " 对象池暂无空闲可用对象");
        }
        return node;
    }

    /**
     * 回收对象池
     * @param name 
     * @param node 
     */
    public static recycleDictPool(name: string, node: Node): void {
        if (!this.pool_dict.hasOwnProperty(name)) {
            console.error(name + " 对象池不存在");
        }
        node.removeFromParent();
        this.pool_dict[name].put(node)

    }
}
