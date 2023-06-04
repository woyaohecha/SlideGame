/*
 * @Author: 林武
 * @Date: 2022-11-04 11:00:53
 * @LastEditors: 林武
 * @LastEditTime: 2023-03-31 10:12:55
 * @FilePath: \client\assets\scripts\NetWork\NetConfig.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by , All Rights Reserved. 
 */

/**
 * 网络的相关接口配置
 */
export default class NetConfig {
    public static readonly RootPath = "https://tempo-game.sxycykj.net/api/app/clientAPI";

    /** 加载用户信息 */
    public static readonly getUserInfoByToken = "/getUserInfoByToken";
    /** 获取用户运动记录 */
    public static readonly getRecordByUid = "/getRecordByUid";
    /** 保存用户运动记录 */
    public static readonly saveUesrRecord = "/saveUesrRecord";
    /** 获取某个歌曲的排行榜数据 */
    public static readonly getSongtRank = "/getSongtRank";
}