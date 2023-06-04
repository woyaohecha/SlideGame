import { Vec2, AssetManager, assetManager, Asset } from "cc";
import { SoundManager } from "./SoundManager";


export class Dictionary<T> {
    private _items = {};
    private _size = 0;

    constructor(items?: { key: any, value: T }[]) {
        if (items) {
            items.forEach(item => {
                this.set(item.key, item.value);
            })
        }
    }

    get size(): number {
        return this._size;
    }
    /** 取一个值*/
    getFirstKey(): any {
        for (let key in this._items) {
            if (this._items.hasOwnProperty(key)) {
                let value = this._items[key];
                return value;
            }
        }
        return null;
    }

    forEach(fun: (key: any, type: T) => void | boolean) {
        for (let key in this._items) {
            if (this._items.hasOwnProperty(key)) {
                let value = this._items[key];
                if (fun(key, value))
                    return;
            }
        }
    }

    remove(key: any): boolean {
        if (!this.has(key)) return false;
        this._size--;
        delete this._items[key];
        return true;
    }

    clone(): Dictionary<T> {
        let n = new Dictionary<T>();
        this.forEach((key, item) => {
            n.set(key, item);
        })
        return n;
    }
    //这里的键值为string或其他类型 因为取出来是遍历这个对象 里面的键值都会转为string
    set(key: any, value: T) {
        if (!this.has(key)) this._size++;
        this._items[key] = value;
    }

    get(key: any): T {
        return this._items[key];
    }

    toArray(): Array<T> {
        let array = [];
        this.forEach((key, value) => {
            array.push(value)
        })
        return array;
    }

    has(key: any): boolean {
        return this._items.hasOwnProperty(key);
    }

    clear() {
        this._items = {};
    }
}

export class BMathTool {

    static readonly D2R = Math.PI / 180;
    static readonly R2D = 180 / Math.PI;

    static Dist2DSqr(target: Vec2, local: Vec2): number {
        let x = target.x - local.x;
        let y = target.y - local.y;

        return x * x + y * y;
    }

    static Dist2D(target: Vec2, local: Vec2): number {
        let sqr = BMathTool.Dist2DSqr(target, local)
        return Math.sqrt(sqr);
    }

    static Clamp(value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    static Mapping(value: number, min: number, max: number, newMin: number, newMax: number): number {
        let r = max - min;
        if (r == 0) {
            return newMax;
        }

        let p = value / r;
        r = newMax - newMin;
        return p * r;
    }
}

/**
 * 资源加载类
 */
export class ResourcesMgr {
    /**
     * bundle缓存
     */
    private static m_BundleMap: Dictionary<AssetManager.Bundle> = new Dictionary<AssetManager.Bundle>();
    private static m_ResMap: Dictionary<any> = new Dictionary<any>();

    private static TableSum(obj: Object) {
        let total = 0;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const element = obj[key];
                total += element;
            }
        }

        return total;
    }

    static LoadBundles(urlOrNames: string[], onComplete?: (err: Error) => void) {
        let index = 0;
        let length = urlOrNames.length;
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                let item = urlOrNames[i];
                ResourcesMgr.LoadBundle(item, error => {
                    if (error) {
                        onComplete && onComplete(error);
                        return;
                    }

                    if (++index >= length) {
                        onComplete && onComplete(null);
                    }
                })
            }
        } else {
            onComplete && onComplete(null)
        }

    }

    static Remove(path: string, bundleName: string) {
        let bundle = ResourcesMgr.m_BundleMap.get(bundleName);
        if (bundle) {
            bundle.release(path);
        }
    }

    static LoadBundle(urlOrName: string, onComplete?: (err: Error) => void) {
        assetManager.loadBundle(urlOrName, (error: Error, bundle: AssetManager.Bundle) => {
            if (error) {
                onComplete && onComplete(error);
                return;
            }

            ResourcesMgr.m_BundleMap.set(urlOrName, bundle);
            onComplete && onComplete(null);
        })
    }

    static RemoveBundle(bundleName: string) {
        let bundle = ResourcesMgr.m_BundleMap.get(bundleName);
        if (bundle) {
            bundle.releaseAll();
            ResourcesMgr.m_BundleMap.remove(bundleName);
            assetManager.removeBundle(bundle);
        }
    }

    static Clear() {
        ResourcesMgr.m_BundleMap.forEach((key, value) => {
            ResourcesMgr.RemoveBundle(key);
        })
        ResourcesMgr.m_BundleMap.clear();
    }

    static LoadBundleAllRes(urlOrName: string, onProgress?: (number: number, bundleName: string) => void, onComplete?: (error: Error) => void, loadDir: string = '') {
        let bundle = ResourcesMgr.m_BundleMap.get(urlOrName);

        if (bundle) {
            console.log(loadDir);

            bundle.loadDir(loadDir, (finish, total, item) => {
                let p = BMathTool.Clamp(finish / total, 0, 1);
                onProgress && onProgress(p, urlOrName);
            }, (error, assets) => {
                onComplete && onComplete(error);
            })
        } else {
            onComplete && onComplete(null);
        }
    }

    static LoadBundlesAllRes(bundles: string[], onProgress?: (number: number) => void, onComplete?: (error: Error) => void) {
        let size = bundles.length;
        if (size <= 0) {
            onComplete && onComplete(null);
            return;
        }

        let step = 1 / size;
        let index = 0;
        let pTable = {};

        bundles.forEach(item => {
            pTable[item] = 0;
            ResourcesMgr.LoadBundleAllRes(item, (p, name) => {
                pTable[name] = p * step;
                onProgress && onProgress(ResourcesMgr.TableSum(pTable))
            }, error => {
                if (++index >= size) {
                    onComplete && onComplete(error);
                }
            });
        })
    }

    static LoadAllRes(onProgress?: (number: number) => void, onComplete?: (error: Error) => void) {
        let size = ResourcesMgr.m_BundleMap.size;
        if (size <= 0) {
            onComplete && onComplete(null);
            return;
        }

        let step = 1 / size;
        let index = 0;
        let pTable = {};

        ResourcesMgr.m_BundleMap.forEach(key => {
            pTable[key] = 0;
            ResourcesMgr.LoadBundleAllRes(key, (p, name) => {
                pTable[name] = p * step;
                onProgress && onProgress(ResourcesMgr.TableSum(pTable))
            }, error => {
                if (++index >= size) {
                    onComplete && onComplete(error);
                }
            });
        })
    }

    static Get<T extends Asset>(resName: string, bundleName: string): Promise<T> {
        return new Promise(resolve => {
            let b = assetManager.getBundle(bundleName);
            if (b) {
                let res = b.get(resName) as T;
                if (res) {
                    resolve(res);
                } else {
                    b.load(resName, (err, res: T) => {
                        if (err) {
                            resolve(null);
                        } else {
                            resolve(res);
                        }
                    });
                }
            } else {
                assetManager.loadBundle(bundleName, (err, b) => {
                    b.load(resName, (err, res: T) => {
                        if (err) {
                            resolve(null);
                        } else {
                            resolve(res);
                        }
                    });
                })
            }
        })

    }

    static LoadAny<T extends Asset>(url: string, cb: (error: Error, result: T) => void) {
        let res = ResourcesMgr.m_ResMap.get(url);
        if (res == null) {
            assetManager.loadAny(url, (error: Error, result: T) => {
                if (error) {
                    cb(error, null);
                    return;
                }

                ResourcesMgr.m_ResMap.set(url, result);
                cb(null, result);
            })
        } else {
            cb(null, res);
        }
    }
    /**
     * 加载资源
     * @param resName 地址
     * @param bundleName 类型
     * @param onComplete 回调
     */
    static Load<T extends Asset>(resName: string, bundleName: string, onComplete: (error: Error, assets: T) => void) {
        let bundle = ResourcesMgr.m_BundleMap.get(bundleName);
        if (bundle) {
            bundle.load(resName, (error, res) => {
                if (error) {
                    console.error(error.message);
                    onComplete && onComplete(error, null);
                    return;
                }

                let ret: any = null;
                if (Array.isArray(res)) {
                    ret = res[0];
                } else {
                    ret = res;
                }

                onComplete && onComplete(null, ret);
            });
        } else {
            ResourcesMgr.LoadBundle(bundleName, error => {
                if (error) {
                    onComplete && onComplete(error, null);
                    return;
                }
                ResourcesMgr.Load(resName, bundleName, onComplete);
            })
        }
    }


    static IsLoadEndAssest: boolean = false;

    static DelayLoadAsseat() {
        //这个最慢 放最后加载
        if (!this.IsLoadEndAssest) {
            let index = 0;
            let assestNameArray = ['prefabs', "Sound"];
            let callBack1 = () => {
                console.log("加载资源", assestNameArray[index]);

                this.LoadBundle(assestNameArray[index], () => {
                    console.log("加载资源完成", assestNameArray[index]);
                    index++;
                    if (index < assestNameArray.length) {
                        callBack1();
                    } else {
                        index = 0;
                        callBack2();
                    }
                })
            }

            let callBack2 = () => {
                console.log("推资源", assestNameArray[index]);
                this.LoadBundleAllRes(assestNameArray[index], null, () => {
                    console.log("推资源完成", assestNameArray[index]);
                    index++;
                    if (index < assestNameArray.length) {
                        callBack2();
                    } else {
                        console.log("加载完成");
                        SoundManager.Instance.playMusic(true);
                        this.IsLoadEndAssest = true;
                    }
                });
            }
            callBack1();
        }
    }





    // /**
    // * 分帧加载
    // */
    // protected loadByFrame() {
    //     const total = 2000,
    //         countPerFrame = 30; // 每帧加载的数量
    //     let index = 0;  // 当前下标
    //     // 加载函数
    //     const load = () => {
    //         // 加载 item
    //         const count = Math.min(total - index, countPerFrame);
    //         for (let i = 0; i < count; i++) {
    //             this.addItem(index);
    //             index++;
    //         }
    //         // 是否还有
    //         if (index < total) {
    //             // 下一帧继续加载
    //             this.scheduleOnce(() => load());
    //         }
    //     }
    //     // 开始加载
    //     load();
    // }




    // /**
    // * 根据bundle名称和资源路径查找资源
    // * @param bundle bundle名称
    // * @param path 资源路径
    // * @returns 
    // */
    // static load_New(bundle: string, path: string) {
    //     return new Promise(resolve => {
    //         let b = assetManager.getBundle(bundle);
    //         if (b) {
    //             let res = b.get(path);
    //             if (res) {
    //                 resolve(res);
    //             } else {
    //                 b.load(path, (err, res) => {
    //                     if (err) {
    //                         resolve(null);
    //                     } else {
    //                         resolve(res);
    //                     }
    //                 });
    //             }
    //         } else {
    //             assetManager.loadBundle(bundle, (err, b) => {
    //                 b.load(path, (err, res) => {
    //                     if (err) {
    //                         resolve(null);
    //                     } else {
    //                         resolve(res);
    //                     }
    //                 });
    //             })
    //         }
    //     })
    // }





}



