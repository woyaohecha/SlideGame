import { _decorator, Component, Node, Label } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
const { ccclass, property } = _decorator;

@ccclass('musicItem')
export class musicItem extends Component {
    @property({ type: Label })
    Name: Label = null;

    @property({ type: Label })
    time: Label = null;

    @property({ type: Label })
    target: Label = null;

    @property({ type: Label })
    cost: Label = null;

    @property({ type: Label })
    difficultyStars: Label = null;

    @property({ type: Label })
    bpm: Label = null;

    @property({ type: Label })
    pass: Label = null;

    start() {

    }

    update(deltaTime: number) {

    }

    UpdateLabel() {
        this.Name.string = GlobalModel.getInstances().getMisicNameLevel();
    }
}

