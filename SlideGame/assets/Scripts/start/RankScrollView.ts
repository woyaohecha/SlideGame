import { _decorator, Component, Node, Prefab, instantiate, UITransform } from 'cc';
import { GlobalModel } from '../global/GlobalModel';
import HttpUnit from '../NetWork/HttpUnit';
import { RankItem } from './RankItem';
const { ccclass, property } = _decorator;

@ccclass('RankScrollView')
export class RankScrollView extends Component {
    @property({ type: Node })
    content: Node = null;

    @property({ type: Prefab })
    RankItem: Prefab = null;

    start() {

    }

    update(deltaTime: number) {

    }

    UpDateRank() {
        let MisicName = GlobalModel.getInstances().getMisicNameLevel();

        let callback = (data) => {
            this.content.destroyAllChildren();
            this.content.getComponent(UITransform).height = 0;
            for (var i = 0; i < data.length; i++) {
                let RankItemNode = instantiate(this.RankItem);
                this.content.addChild(RankItemNode);
                RankItemNode.getComponent(RankItem).InitData(data[i]);
            }

            this.content.getComponent(UITransform).height = (data.length * 80) + 20;
        }
        HttpUnit.getSongtRank(MisicName, callback);

    }
}

