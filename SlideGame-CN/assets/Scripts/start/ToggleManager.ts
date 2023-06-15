import { _decorator, Component, Node, Overflow, Toggle } from 'cc';
import { GameData } from '../global/GameData';
const { ccclass, property } = _decorator;

@ccclass('ToggleManager')
export class ToggleManager extends Component {

    toggleGroupEvent(e) {
        GameData.mode = this.node.children.indexOf(e.node);
    }
}

