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
        // StageManager
        stageManager: {
            default: null,
            type: StageManager
        },
        jumpDurationTime: 0.6,  // 滞空時間
        jumpHeight: 200,        // ジャンプの高さ
        _isJumping: false,      // ジャンプ中かどうか   // ‗を付けるとエディターで見えなくなる
        
        jumpAudio: {
            default: null,
            url: cc.AudioClip,
        },

        attackAudio: {
            default: null,
            url: cc.AudioClip,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setTouchEvent();
    },

    setTouchEvent: function(){
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowBegan: true,
            onTouchBegan: function(touch, event){
                self.jumpPlayer();
                return true;
            }
        }, self.node);
    },

    jumpPlayer: function(){
        // ジャンプ中はジャンプできない
        if(this._isJumping){
            return;
        }
        // SE再生
        cc.audioEngine.play(this.jumpAudio, false, 0.1);
        // アニメーション変更
        var anim = this.node.getComponent(cc.Animation);
        anim.play('PlayerJump');
        // ジャンプフラグon
        this._isJumping = true;
        // 無名関数内でこのメソッド無いの変数を扱うために用意
        var self = this;

        // cc.jumpBy(時間, 方向x, 方向y, 高さ, 回数)
        var jumpAction = cc.jumpBy(this.jumpDurationTime, 0, 0, this.jumpHeight, 1);
        // 着地
        var endFunction = cc.callFunc(function(){   // 無名関数
            self._isJumping = false;
            anim.play('PlayerRunning'); // アニメーションを戻す
        },this);

        // アクション開始
        this.node.runAction(cc.sequence(
            jumpAction,endFunction
        ));
    },

    // enableになったときに呼ばれる
    onEnable: function(){
        cc.director.getCollisionManager().enabled = true;   // ゲーム全体の衝突判定を有効化
    },

    onCollisionEnter: function(other, self){
        var otherObject = other.node.getComponent('CommingObject');
        switch(other.tag){
            case 1:
                // ブロックとの衝突
                // 無敵状態なら吹き飛ばす
                if(this.stageManager._isInvincible){
                    // SE再生
                    cc.audioEngine.play(this.attackAudio);
                    // スコア加算
                    this.stageManager.plusScore(otherObject.plusScore);
                    // コライダー無効化
                    other.getComponent(cc.BoxCollider).enabled = false;
                    // 画面外へ飛ばす
                    other.node.runAction(cc.sequence(
                        cc.moveBy(0.2, 1200, cc.randomMinus1To1() * 500),
                        cc.callFunc(function() {other.node.destroy();},this),
                    ));
                    return;
                }
                // SE再生
                cc.audioEngine.play(otherObject.collisionAudio, false, 0.1);
                // GameOver処理
                // アニメーションの停止
                this.node.stopAllActions();
                // 画面外へ落ちるように跳ねる
                this.node.runAction(
                    cc.jumpBy(0.5, -180, -500, this.jumpHeight, 1)
                );
                // タッチ無効
                this.enableTouch(false);
                // ゲームオーバー処理
                this.stageManager.execGameOver();
                break;
            case 2: // ケーキとの衝突
                cc.audioEngine.play(otherObject.collisionAudio, false, 0.1);
                // スコア加算
                this.stageManager.plusScore(otherObject.plusScore);
                // ゲージ増加
                this.stageManager.plusSpecial(otherObject.plusSpecial);
                // ケーキ削除
                other.node.destroy();
                break;
        }
    },

    enableTouch: function(enable){
        if(enable){
            cc.eventManager.resumeTarget(this.node);
        }else{
            cc.eventManager.pauseTarget(this.node);
        }
    },

    start () {

    },

    // update (dt) {},
});
