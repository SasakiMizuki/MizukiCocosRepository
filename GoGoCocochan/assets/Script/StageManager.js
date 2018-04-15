// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var State = cc.Enum({
    READY: 0,
    WAINTNG_WAVE: 1,
    RUNNING: 2,
    GAMEOVER: 9
});

var UserData = {
    maxWave: 1,
    highScore: 0
};

cc.Class({
    extends: cc.Component,

    properties: {
        gameOverLayout:{
            default: null,
            type: cc.Node,
        },
        blockPrefab: {
            default: null,
            type: cc.Prefab
        },
        // ブロック情報
        blockDistance: 400, // 基準間隔
        blockMax: 10,       // 1waveごとのブロック数
        waveAccSpeed: 20,   // 1waveごとの加速値
        waveMax: 15,        // 最大加速wave
        _wave: 1,           // 現在のwave数
        _addSpeed: 0,       // 加算スピード
        _addDistance: 0,    // 加算間隔

        // WaveLabel
        waveLabel: {
            default: null,
            type: cc.Label
        },

        //
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        _score: 0,

        stageBGM: {
            default: null,
            url: cc.AudioClip
        },
        // BGMのAudioID
        _bgmID: -1,

        _state: State.READY,

        // ケーキプレハブ
        cakePrefab: {
            default: null,
            type: cc.Prefab
        },
        // 無敵ゲージ
        specialGage: {
            default: null,
            type: cc.ProgressBar
        },
        // 無敵時BGM
        invincibleBGM: {
            default: null,
            url: cc.AudioClip
        },
        // ゲージの値
        _special: 0,
        // 無敵フラグ
        _isInvincible: false,

        invincibleEffect: {
            default: null,
            type: cc.ParticleSystem
        },
        _userData: null,
    },

    // LIFE-CYCLE CALLBACKS:
    statics: {
        State
    },

    onLoad: function() {
        // 最初のwaveを生成
        this.createWave(400 + this.blockDistance + this._addDistance);
        this._state = State.RUNNING;
        this._bgmID = cc.audioEngine.play(this.stageBGM, true, 0.1);
        this.readUserData();
    },

    execGameOver: function(){
        // 衝突判定無効化
        cc.director.getCollisionManager().enabled = false;
        // ステート変更
        this._state = State.GAMEOVER;
        // ダイアログ表示
        this.gameOverLayout.active = true;
        // 
        cc.audioEngine.stop(this._bgmID);
        this._bgmID = -1;

        //スコア保存
        //小数点切り捨て
        var score = Math.floor(this._score);
        // 
        var scoreLabel = this.gameOverLayout.getChildByName('Score').getComponent(cc.Label);
        scoreLabel.string = 'Score: ' + score;
        // ハイスコア更新
        if(this._userData.highScore < score){
            this._userData.highScore = score;
            this.gameOverLayout.getChildByName('newRecord').active = true;
        }else{
            // 更新がない場合は非表示
            this.gameOverLayout.getChildByName('newRecord').active = false;
        }
        var highScoreLabel = this.gameOverLayout.getChildByName('highScore').getComponent(cc.Label);
        highScoreLabel.string = '(HighScore: ' + this._userData.highScore + ')';
        // wave更新
        if(this._userData.maxWave < this._wave){
            this._userData = this._wave;
        }
        // Save
        this.writeUserData();
    },

    start () {

    },

    // データ保存
    writeUserData: function(){
        cc.sys.localStorage.setItem('UserData', JSON.stringify(this._userData));
    },

    readUserData: function(){
        var data = cc.sys.localStorage.getItem('UserData');
        cc.log(data);   // 確認用
        if(data !== null){
            this._userData = JSON.parse(data);
        }else{
            this._userData = UserData;
        }
    },

    update (dt) {
        // Running時のみ実行
        if(this._state !== State.RUNNING){
            return;
        }
        // スコア加算
        this.plusScore(100 * dt);
        // 表示更新
        this.renewLabel();

        this.checkWave();

        // 無敵時処理
        if(this._isInvincible){
            this._special -= (20 + this._addSpeed * 0.01) * dt;
            this.specialGage.progress = this._special / 100;

            // 0になったら元に戻す
            if(this._special <= 0){
                this._special = 0;
                // BGMを戻す
                cc.audioEngine.stop(this._bgmID);
                this._bgmID = cc.audioEngine.play(this.stageBGM, true, 0.1);
                this.invincibleEffect.stopSystem();
                // 無敵フラグoff
                this._isInvincible = false;
                // ゲージ色を戻す
                this.specialGage.getComponent(cc.ProgressBar).barSprite.node.color = cc.Color.WHITE;
            }
        }
    },

    plusScore: function(score){
        this._score += score;
    },

    renewLabel: function() {
        this.waveLabel.string = 'Wave: ' + this._wave;  // ウェーブ表示
        this.scoreLabel.string = 'Score: ' + Math.floor(this._score);  // 整数化
    },

    plusSpecial: function(point) {
        this._special += point;
        if(this._special >= 100){
            this._special = 100;
        }
        this.specialGage.progress = this._special / 100;

        if(this._special >= 100 && !this._isInvincible){
            // バーの色を変える
            var specialColor = new cc.Color(240, 146, 228); // or new cc.hexToColor('#FFFFFF');
            this.specialGage.getComponent(cc.ProgressBar).barSprite.node.color = specialColor;
            // BGM変更
            cc.audioEngine.stop(this._bgmID);
            this._bgmID = cc.audioEngine.play(this.invincibleBGM, true, 0.1);
            // 無敵フラグon
            this._isInvincible = true;
            // エフェクトon
            this.invincibleEffect.resetSystem();
        }
    },

    createWave: function(startPosX){
        // 
        var blocks = cc.find('Canvas/blocks');

        // 地面の位置
        var ground = cc.find('Canvas/ground_A');
        var groundPosY = ground.getPositionY() + ground.height * 0.5;

        //
        var player = cc.find('Canvas/Player').getComponent('Player');

        for(var i = 0; i < this.blockMax; i++){
            // プレハブからオブジェクトを生成、親子設定
            var block = cc.instantiate(this.blockPrefab);
            blocks.addChild(block);
            
            // ランダムで高さを変える
            var blockPosX = (this.blockDistance + this._addDistance);
            var blockPosY = cc.randomMinus1To1() < 0 ? 0 : player.jumpHeight - 20;
            block.setPosition(cc.p(startPosX + blockPosX * (i + 1), groundPosY + (block.height * 0.5) + blockPosY));
            
            // ケーキ生成
            var cake = cc.instantiate(this.cakePrefab);
            blocks.addChild(cake);
            var cakePosY = cc.randomMinus1To1() < 0 ? 0 : player.jumpHeight - 20;
            cake.setPosition(cc.p(startPosX + blockPosX * (i + 1) - blockPosX * 0.5, 
            groundPosY + (block.height * 0.5) + cakePosY));
        }
    },

    checkWave: function(){
        var blocks = cc.find('Canvas/blocks');
        if(blocks.getChildrenCount() === 0){
            this._wave ++;

            // 最大waveでなかったら加速
            if(this._wave <= this.waveMax){
                this._addSpeed += (this._wave * 0.5) * this.waveAccSpeed;
                this._addDistance += (this._wave * 0.5) * (this.waveAccSpeed * 0.5);
            }

            // 次のwaveを作成
            this.createWave(400 + this.blockDistance + this._addDistance);
        }
    },

    restartStage: function(){
        cc.director.loadScene('GameMain');
    }
});
