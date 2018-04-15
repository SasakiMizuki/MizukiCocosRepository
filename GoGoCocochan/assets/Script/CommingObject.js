// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var StageManager = require('StageManager');

cc.Class({
    extends: cc.Component,

    properties: {
        // 移動速度
        moveSpeed: 500,
        _stageManager: null,

        // 衝突時の音
        collisionAudio: {
            default: null,
            url: cc.AudioClip,
        },

        plusScore: 0,
        plusSpecial: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var managerNode = cc.find('StageManager');
        this._stageManager = managerNode.getComponent(StageManager);
    },

    start () {

    },

    update: function(dt) {
        if(this._stageManager._state !== StageManager.State.RUNNING){
            return;
        }
        var moveX = (this.moveSpeed + this._stageManager._addSpeed) * dt;

        if(this.node.x < -(cc.director.getVisibleSize().width * 0.5) - this.node.width){
            this.node.destroy();
        }else{
            this.node.x = this.node.x - moveX;
        }
    },
});
