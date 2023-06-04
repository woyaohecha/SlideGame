/*
 * @Author: 林武
 * @Date: 2022-02-11 13:50:11
 * @LastEditors: 林武
 * @LastEditTime: 2022-04-19 15:51:18
 * @FilePath: \jgtgw\assets\scripts\tt\HttpRequest.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by 林武, All Rights Reserved. 
 */

import { _decorator, EventTarget } from 'cc';
export default class HttpRequest extends EventTarget {
    public static PROGRESS: string = "PROGRESS";
    public static COMPLETE: string = "COMPLETE";
    public static ERROR: string = "ERROR";

    private _http: XMLHttpRequest = null;
    private _responseType: string = "";
    private _url: string = "";
    private _data: any = null;

    constructor() {
        super();
        this._http = new XMLHttpRequest();
    }

    send(url, data = null, method = "get", responseType = "text", headers = null) {
        this._responseType = responseType;
        this._data = null;
        url = encodeURI(url);
        this._url = url;
        var _this = this;
        var http = this._http;
        http.open(method, url, true);
        let isJson = false;
        if (headers) {
            for (var i = 0; i < headers.length; i++) {
                http.setRequestHeader(headers[i++], headers[i]);
            }
        }
        else if (!(window["conch"])) {
            if (!data || typeof (data) == 'string')
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            else {
                http.setRequestHeader("Content-Type", "application/json");
                isJson = true;
            }
        }
        let restype: any = responseType !== "arraybuffer" ? "text" : "arraybuffer";
        http.responseType = restype;
        http.onerror = function (e) {
            _this._onError(e);
        };
        http.onabort = function (e) {
            _this._onAbort(e);
        };
        http.onprogress = function (e) {
            _this._onProgress(e);
        };
        http.onload = function (e) {
            _this._onLoad(e);
        };
        http.send(isJson ? JSON.stringify(data) : data);
    }
    _onProgress(e) {
        if (e && e.lengthComputable)
            this.emit(HttpRequest.PROGRESS, e.loaded / e.total);
    }
    _onAbort(e) {
        this.error("Request was aborted by user");
    }
    _onError(e) {
        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
    }
    _onLoad(e) {
        var http = this._http;
        var status = http.status !== undefined ? http.status : 200;
        if (status === 200 || status === 204 || status === 0) {
            this.complete();
        }
        else {
            this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
        }
    }
    error(message) {
        this.clear();
        console.warn(this.url, message);
        this.emit(HttpRequest.ERROR, message);
    }
    complete() {
        this.clear();
        var flag = true;
        try {
            if (this._responseType === "json") {
                this._data = JSON.parse(this._http.responseText);
            }
            else if (this._responseType === "xml") {
                this._data = this.parseXMLFromString(this._http.responseText);
            }
            else {
                this._data = this._http.response || this._http.responseText;
            }
        }
        catch (e) {
            flag = false;
            this.error(e.message);
        }
        flag && this.emit(HttpRequest.COMPLETE, this._data instanceof Array ? [this._data] : this._data);
    }
    clear() {
        var http = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }
    get url() {
        return this._url;
    }
    get data() {
        return this._data;
    }
    get http() {
        return this._http;
    }

    public parseXMLFromString = function (value) {
        var rst;
        value = value.replace(/>\s+</g, '><');
        rst = (new DOMParser()).parseFromString(value, 'text/xml');
        if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
            throw new Error(rst.firstChild.firstChild.textContent);
        }
        return rst;
    };
}