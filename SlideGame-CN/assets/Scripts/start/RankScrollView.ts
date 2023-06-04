import { _decorator, Component, Node, Prefab, instantiate, UITransform, Label } from 'cc';
import { GameData } from '../global/GameData';
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

    myscore: Label = null;
    myRank: Label = null;

    start() {
        if (this.node.scene.name == "GameOver") {
            this.myscore = this.node.getChildByName("Mine").getChildByName("Score").getComponent(Label);
            this.myRank = this.node.getChildByName("Mine").getChildByName("Rank").getComponent(Label);
        }
    }

    update(deltaTime: number) {

    }

    UpDateRank() {
        let callback = (data) => {
            this.content.destroyAllChildren();
            this.content.getComponent(UITransform).height = 0;
            for (var i = 0; i < data.songRank.length; i++) {
                let RankItemNode = instantiate(this.RankItem);
                this.content.addChild(RankItemNode);
                RankItemNode.getComponent(RankItem).InitData(data.songRank[i]);
            }

            this.content.getComponent(UITransform).height = (data.songRank.length * 80) + 20;

            if (this.node.scene.name == "GameOver") {
                this.myscore.string = "" + data.userRank.score;
                this.myRank.string = "" + data.userRank.rownum;
            }
        }
        HttpUnit.getSongtRank(GameData.currentMusicName, callback);
    }
}

