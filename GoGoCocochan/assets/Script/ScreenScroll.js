// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var StageManager = require('StageManager'); // たぶんスクリプトの取得

cc.Class({
    extends: cc.Component,

    properties: {
        _stageManager: null,
        otherBgSprite: {
            default: null,
            type: cc.Sprite,
        },

        movespeed: 500,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function() {
        // キャンバスからノードの取得
        var managerNode = cc.find('StageManager');
        // 取得したノードからコンポーネントの取得
        this._stageManager = managerNode.getComponent(StageManager);    // スクリプトの取得たぶん
        /*
        MEMO
        cc.find('Canvas/nodeName');             // Canvas内のnodeNameを取得、これがないとキャンバス外でのみ検索
        cc.find('nodeName', this.node);         // 自身の子の中でnodeNameを取得
        this.node.getChildByName('nodeName');   // 上と同じ
        */
    },

    start () {

    },

    update (dt) {
        // StageManager上でRunning状態でないなら移動しない
        if(this._stageManager._state !== StageManager.State.RUNNING){
            return;
        }

        var moveX = (this.movespeed + this._stageManager._addSpeed) * dt;
        if(this.node.x <= -this.node.width){
            this.node.x = this.otherBgSprite.node.x + this.otherBgSprite.node.width - moveX;
        }else{
            this.node.x = this.node.x - moveX;
        }
    },
});
