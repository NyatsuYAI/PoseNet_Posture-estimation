
const MusicClass = class {
    mp3_bgm = new Audio('./mp3/bgm.mp3');
    mp3_agete = new Audio('./mp3/agete.m4a');
    mp3_sagete = new Audio('./mp3/sagete.m4a');
    mp3_pinpon = new Audio('./mp3/pinpon.mp3');
    mp3_sagatte = new Audio('./mp3/sagate.mp3');
    mp3_sesuji_front = new Audio('./mp3/sesuji_front.mp3');
    mp3_sesuji_back = new Audio('./mp3/sesuji_back.mp3');
    mp3_stop = new Audio('./mp3/stop.mp3');
    mp3_tatte = new Audio('./mp3/tatte.m4a');
    mp3_start = new Audio('./mp3/start.mp3');
    mp3_goodposition = new Audio('./mp3/goodposition.mp3');
    mp3_hohaba = new Audio('./mp3/hohaba.mp3');
    mp3_width = new Audio('./mp3/width.mp3');
    nowPlay = new Audio();
    constructor(playbackRate, flg) {
        this._playbackRate = playbackRate;
        this._flg = flg;

        // this.mp3_bgm = new Audio('./mp3/bgm.mp3');
        // this.mp3_agete = new Audio('./mp3/agete.m4a');
        // this.mp3_sagete = new Audio('./mp3/sagete.m4a');
        // this.mp3_pinpon = new Audio('./mp3/pinpon.mp3');
        // this.mp3_sagatte = new Audio('./mp3/sagate.mp3');
        // this.mp3_sesuji_front = new Audio('./mp3/sesuji_front.mp3');
        // this.mp3_sesuji_back = new Audio('./mp3/sesuji_back.mp3');
        // this.mp3_stop = new Audio('./mp3/stop.mp3');
        // this.mp3_tatte = new Audio('./mp3/tatte.m4a');
        // this.mp3_start = new Audio('./mp3/start.mp3');
        // this.mp3_goodposition = new Audio('./mp3/goodposition.mp3');
        // this.mp3_hohaba = new Audio('./mp3/hohaba.mp3');
        // this.mp3_width = new Audio('./mp3/width.mp3');
        this._nowPlay = new Audio();
    }

    set playbackRate(_playbackRate) {
        if (_playbackRate > 0) this._playbackRate = _playbackRate;
    }
    get playbackRate() { return this._playbackRate; }

    set flg(_flg) {
        this._flg = _flg;
    }

    get flg() { return this._flg; }

    set nowPlay(_nowPlay) {
        this._nowPlay = _nowPlay;
    }
    get nowPlay() { return this._nowPlay; }

    startMusic() {
        if (this._flg) {
            mp3_start.currentTime = 0;
            mp3_start.play();
            mp3_start.loop = true;
            this._nowPlay = mp3_start;
        }

    }

    playMusic(music) {
        if (this._flg) {
            this._nowPlay.pause();
            music.currentTime = 0;
            music.play();
            music.loop = true;
            this._nowPlay = music;
        }
    }

    resetMusic() {
        if (this._flg) this._nowPlay.pause();
        this._nowPlay.currentTime = 0;
    }

    stopMusic() {
        if (this._flg) this._nowPlay.pause();
        this._flg = false;
    }

    onesMusic(music) {
        resetMusic(this._nowPlay);
        music.play();
        music.loop = false;
        this._nowPlay = music;
    }

    allowMusic() {
        if (!this._flg) this._nowPlay.play();
        this._flg = true;
        console.log(this._flg, this._nowPlay);
    }
}

