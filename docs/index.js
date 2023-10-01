'use strict';//ストリクトモードの開始

$(function () {
            $(".overlay").show();
            $(".btn_area button").click(function () {
                $(".overlay").fadeOut();
                document.documentElement.requestFullscreen();
                allowMusic();
            });
        });
        const videoElement = document.getElementsByClassName('input_video')[0];
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext("2d");

        // キャンバスの幅を半分に設定
        canvasElement.width = videoElement.width / 2;

        // キャンバスを水平方向に中央に配置するために、CSSでmarginを設定
        canvasElement.style.marginLeft = "auto";
        canvasElement.style.marginRight = "auto";

        const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
        const grid = new LandmarkGrid(landmarkContainer, {
            connectionColor: 0xCCCCCC,
            definedColors:
                [{ name: 'LEFT', value: 0xffa500 }, { name: 'RIGHT', value: 0x00ffff }],
            range: 2,
            fitToGrid: true,
            labelSuffix: 'm',
            landmarkSize: 2,
            numCellsPerAxis: 4,
            showHidden: false,
            centered: true,
        });

        let ut = navigator.userAgent;


        if (ut.indexOf('iPhone') > 0 || ut.indexOf('iPod') > 0 || ut.indexOf('Android') > 0 && ut.indexOf('Mobile') > 0) {
            document.getElementById("log").textContent = ("iPhone");
            canvasElement.setAttribute("width", window.outerWidth);
            canvasElement.setAttribute("height", window.outerHeight);
        } else if (ut.indexOf('iPad') > 0 || ut.indexOf('Android') > 0) {
            document.getElementById("log").textContent = ("Tablet");
            canvasElement.setAttribute("width", window.outerWidth);
            canvasElement.setAttribute("height", window.outerHeight);
        } else {
            document.getElementById("log").textContent = ("Personal Computer");
            canvasElement.setAttribute("width", window.outerHeight * 0.75);
            canvasElement.setAttribute("height", window.outerHeight);
        }

        const resizeWindow = async () => {
            if (ut.indexOf('iPhone') > 0 || ut.indexOf('iPod') > 0 || ut.indexOf('Android') > 0 && ut.indexOf('Mobile') > 0) {
                canvasElement.style.width = '100vw';
            } else if (ut.indexOf('iPad') > 0 || ut.indexOf('Android') > 0) {
                canvasElement.style.width = '100vw';
            } else {
                canvasElement.style.height = '100vw';
            }
            
          }
          /**
           * URLのクエリから取得可能なParam
           */
        const paramDataSet = {
            'humanJudge': 0.7,//人判定の閾値
            'playbackRate': 1,//再生速度
            "perhohaba": 0.5,//歩幅の割合
            "perwidth": 1.5,//ワイドスクワットを判定する幅の割合
            'HDSCheck': 0.1,//膝を過度に利用するHipDriveSquatの判定閾値
        }
        const getParam = () => {
            // URLを取得
            const url = new URL(window.location.href);
            // URLSearchParamsオブジェクトを取得
            const params = url.searchParams;

            for (let item in paramDataSet) {
                let result = params.get(item);
                if (result) paramDataSet[item] = Number(result);
            }
            console.log(paramDataSet);
            return;
        }

        /**
         * 画像を読み込む
         */
        let img_img1 = new Image();
        img_img1.src = './img/animalface_neko.png';
        let img_fire = new Image();
        img_fire.src = './img/honoo_hi_fire.png';
        let img_up = new Image();
        img_up.src = './img/up.png';
        let img_down = new Image();
        img_down.src = './img/down.png';
        let img_left = new Image();
        img_left.src = './img/left.png';
        let img_right = new Image();
        img_right.src = './img/right.png';
        let img_front = new Image();
        img_front.src = './img/front.png';
        let img_back = new Image();
        img_back.src = './img/back.png';
        let img_shisei_ok = new Image();
        img_shisei_ok.src = './img/shiseiOK.png';

        /**音声の設定
         * 
        */
        const mp3_bgm = new Audio('./mp3/bgm.mp3');
        const mp3_agete = new Audio('./mp3/agete.m4a');
        mp3_agete.playbackRate = paramDataSet.playbackRate;
        const mp3_sagete = new Audio('./mp3/sagete.m4a');
        mp3_sagete.playbackRate = paramDataSet.playbackRate;
        const mp3_pinpon = new Audio('./mp3/pinpon.mp3');
        mp3_pinpon.playbackRate = paramDataSet.playbackRate;
        const mp3_sagatte = new Audio('./mp3/sagate.mp3');
        mp3_sagatte.playbackRate = paramDataSet.playbackRate;
        const mp3_sesuji_front = new Audio('./mp3/sesuji_front.mp3');
        mp3_sesuji_front.playbackRate = paramDataSet.playbackRate;
        const mp3_sesuji_back = new Audio('./mp3/sesuji_back.mp3');
        mp3_sesuji_back.playbackRate = paramDataSet.playbackRate;
        const mp3_stop = new Audio('./mp3/stop.mp3');
        mp3_stop.playbackRate = paramDataSet.playbackRate;
        const mp3_tatte = new Audio('./mp3/tatte.m4a');
        mp3_tatte.playbackRate = paramDataSet.playbackRate;
        const mp3_start = new Audio('./mp3/start.mp3');
        mp3_start.playbackRate = paramDataSet.playbackRate;
        const mp3_goodposition = new Audio('./mp3/goodposition.mp3');
        mp3_goodposition.playbackRate = paramDataSet.playbackRate;
        const mp3_hohaba = new Audio('./mp3/hohaba.mp3');
        mp3_hohaba.playbackRate = paramDataSet.playbackRate;
        const mp3_width = new Audio('./mp3/width.mp3');
        mp3_width.playbackRate = paramDataSet.playbackRate;
        let nowPlay = mp3_start;
        let flgMusic = false;

        /**取得したい角度のポイント
         * もちろん真ん中が原点となるポイントになるように書いてね
         * 関節スコアの参照 -> https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d
        */
        const needVector = {
            // "rightUde":[12,14,16],
            // "leftUde":[11,13,15],
            "rightHip": [12, 24, 26],
            "leftHip": [11, 23, 25],
            "rightKnee": [24, 26, 28],
            "leftKnee": [23, 25, 27],
            "rightAnkle": [26, 28, 32],
            "leftAnkle": [25, 27, 31],
            "rightHeel": [28, 30, 32],
            "leftHeel": [27, 29, 31],
        };

        /**
         * その他フレームを超えて保持したいデータ
         */
        const stockData = {
            "selectedAngle" : 90,//スクワットの角度
            "selectedMargin" : 30,//スクワットの角度の許容範囲
            "slopeHipAngle": 0,//キャリブレーション用の角度
            "slopeKneeAngle": 0,//キャリブレーション用の角度
            "slopeMin": { "a_min": 0.6, "b_min": 0 },//傾きと切片の最小値（後傾）
            "slopeMax": { "a_max": 1.15, "b_max": 0 },//傾きと切片の最大値（前傾）
            "slpoes": { "a": 0, "b": 0 },//傾きと切片
            "err": 0,//エラーの値
        };

        
        const average = (a, b) => {
            return (a + b) / 2;
        };

        /**
         * 音楽の関数
         * @param {HTMLAudioElement} nowPlay
         */
        const resetMusic = (nowPlay) => {
            if (flgMusic) nowPlay.pause();
            nowPlay.currentTime = 0;
        }
        /**
         * 音楽の関数
         */
        const stopMusic =()=> {
            if (flgMusic) nowPlay.pause();
            flgMusic = false;
        }
        /**
         * 音楽の関数
         */
        const allowMusic = () => {
            if (!flgMusic) nowPlay.play();
            flgMusic = true;
        }
        /**
         * 音楽の関数
         * @param {HTMLAudioElement} music
         * @param {boolean} status
         */
        const startMusic = (music, status = false) => {
            if (flgMusic) {
                nowPlay.pause();
                music.currentTime = 0;
                music.loop = status;
                music.play();
                nowPlay = music;
            }
        }

        const bgmButton = document.getElementById("bgm").addEventListener("click", () => { 
            if (bgmButton.value === 'BGMを再生') {
                bgmButton.value = 'BGMを停止';
                mp3_bgm.play();
                mp3_bgm.volume = 0.2;
                mp3_bgm.loop = true;
            } else {
                bgmButton.value = 'BGMを再生';
                resetMusic(mp3_bgm);
            }         
        });

        /**
         * 角度の計算
         * pose2の角度を計算する
         * 入力値pose　=　{x,y,z,visibility}
         * @returns
         */

        const calcAngleFrom3Point = (pose1,pose2,pose3) => {
             // please learn here -> https://npm.runkit.com/%40mediapipe%2Fpose

             const vector1 = {
                x: Math.round((pose1.x - pose2.x) * 1000000) / 1000000,
                y: Math.round((pose1.y - pose2.y) * 1000000) / 1000000,
                z: Math.round((pose1.z - pose2.z) * 1000000) / 1000000,
                visibility: average(pose1.visibility, pose2.visibility),
            }
            const vector2 = {
                x: Math.round((pose3.x - pose2.x) * 1000000) / 1000000,
                y: Math.round((pose3.y - pose2.y) * 1000000) / 1000000,
                z: Math.round((pose3.z - pose2.z) * 1000000) / 1000000,
                visibility: average(pose3.visibility, pose2.visibility),
            }

            return {
                angle: Math.acos((vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z) / (Math.sqrt(vector1.x ** 2 + vector1.y ** 2 + vector1.z ** 2) * Math.sqrt(vector2.x ** 2 + vector2.y ** 2 + vector2.z ** 2))) * 180 / Math.PI,
                visibility: average(vector1.visibility, vector2.visibility),
            };
        }

        /**
         * 2点間の距離を計算する(小さくなりすぎないよう保証付き)
         * pose　=　{x,y,z,visibility}
         * 
         */
        const calcLength2point = (point1, point2) =>{
            const length = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
            if (length > 0.05) return length;
            else {
                return 0.05;
            }
        }

        /**
         * 顔隠す猫ちゃん
         * @param {canvasElement} canvasElement
         * @param {HTMLImageElement} img
         * @param {pose} nose
         * @param {pose} left_ear
         * @param {pose} right_ear
         * @returns
         */
        const facecat = (canvasElement, img, nose, left_ear, right_ear) => {
            const width = canvasElement.width * calcLength2point(left_ear, right_ear) * 3;
            const height = width * Math.round(img.height / img.width);
            const x = Math.round(nose.x * canvasElement.width) - (width / 2);
            const y = Math.round(nose.y * canvasElement.height) - (height / 2);

            return {
                'x': x,
                'y': y,
                'width': width,
                'height': height,
            };
        }
        /**
         * 肩幅・歩幅・HDSの判定
         * @param {pose} results 
         * @param {string} whatCheck 
         * @returns 
         */
        const resultsCheck=(results, whatCheck)=> {

            const shoulder_haba = calcLength2point(results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER]);
            const knee_haba = calcLength2point(results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE], results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE]);
            const ankle_haba = calcLength2point(results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE], results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE]);
            const shoulder_depth = average(results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].z - results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER].z, results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].z - results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER].z);
            const hip_depth = average(results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].z - results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].z, results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].z - results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].z);
            if (shoulder_haba * paramDataSet["perhohaba"] > ankle_haba && whatCheck === "hohaba") return "hohaba";
            else if (shoulder_haba * paramDataSet["perwidth"] < knee_haba && whatCheck === "width") return "width";
            else if (Math.abs(shoulder_depth - hip_depth) < paramDataSet["HDSCheck"] && whatCheck === "HDS") return "HDS";
        }

        /**
         * 今あるデータから、理想的に膝を曲げて言った時の偽物のデータを生成する
         * @param {coordinates} coordinates 
         * @param {string} status 
         * @returns 
         */
        const addCoordinates=(coordinates, status = 0)=> {
            if (status === "min") {
                const res = [];
                for (let set in coordinates) {
                    res.push(coordinates[set]);
                    res.push({ x: coordinates[set].x - stockData["falseDataSet"]["min"]["knee"] / 2, y: coordinates[set].y - stockData["falseDataSet"]["min"]["hip"] / 2 });
                    res.push({ x: coordinates[set].x - stockData["falseDataSet"]["min"]["knee"], y: coordinates[set].y - stockData["falseDataSet"]["min"]["hip"] });
                }
                return res;
            } else if (status === "max") {
                const res = [];
                for (let set in coordinates) {
                    res.push(coordinates[set]);
                    res.push({ x: coordinates[set].x - stockData["falseDataSet"]["max"]["knee"] / 2, y: coordinates[set].y - stockData["falseDataSet"]["max"]["hip"] / 2 });
                    res.push({ x: coordinates[set].x - stockData["falseDataSet"]["max"]["knee"], y: coordinates[set].y - stockData["falseDataSet"]["max"]["hip"] });
                }
                return res
            } else {
                return coordinates;
            }
        }
        /**
         * x、yのデータから回帰直線で傾きと切片を求める
         * @param {coordinates} coordinates 
         * @returns 
         */
        const lsm = coordinates => {
            const n = coordinates.length
            const sigX = coordinates.reduce((acc, c) => acc + c.x, 0)
            const sigY = coordinates.reduce((acc, c) => acc + c.y, 0)
            const sigXX = coordinates.reduce((acc, c) => acc + c.x * c.x, 0)
            const sigXY = coordinates.reduce((acc, c) => acc + c.x * c.y, 0)
            // a(傾き)を求める
            const a = (n * sigXY - sigX * sigY) / (n * sigXX - Math.pow(sigX, 2));
            // b(切片)を求める
            const b = (sigXX * sigY - sigXY * sigX) / (n * sigXX - Math.pow(sigX, 2));

            return [a, b]
        }

        /**
         * キャリブレーションされた値から、姿勢の傾きの判定を行う
         * @param {*} resultAngle
         * @returns
         */
const checkShisei = (resultAngle) => {
    if (stockData["slopeHipAngle"] === 0 ||stockData["slopeKneeAngle"] === 0) return;
    const hipAngle =average(resultAngle.leftHip.angle, resultAngle.rightHip.angle);
    const kneeAngle = average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle);
    const slope  = (stockData["slopeHipAngle"] - hipAngle)/(stockData["slopeKneeAngle"] -kneeAngle);
    if (slope >stockData["slopeMax"]["a_max"] ){
        return "front";
    }else if (slope <stockData["slopeMin"]["a_min"]){
        return "back";
    }else{
        return "OK";
    }
}

/**
 * statusからboardに表示するテキストを設定する
 * @param {string} text 
 * @returns
 */
const textSet = (status) =>{
            switch (status) {
                case "please look forward front":
                    document.getElementById("board").textContent = "背筋に力を入れましょう";
                    break;
                case "please look forward back":
                    document.getElementById("board").textContent = "前傾姿勢になりましょう";
                    break;
                case "please stand up":
                    document.getElementById("board").textContent = "成功！立ち上がって";
                    break;
                case "keep":
                    document.getElementById("board").textContent = "姿勢を保ちましょう";
                    break;
                case "sqwat done":
                    break;
                case "sqwat reset":
                    break;
                case "good position start squat":
                    document.getElementById("board").textContent = "スクワットを始めてみましょう";
                    break;
                case "too squat":
                    document.getElementById("board").textContent = "しゃがみすぎです。腰を上げてください";
                    break;
                case "out":
                    document.getElementById("board").textContent = "画面に全身が映っていません。画面を確認してください";
                    break;
                case "please open ankle":
                    document.getElementById("board").textContent = "肩幅まで足を開いてください";
                    break;
                case "width squat":
                    document.getElementById("board").textContent = "膝を正面で曲げてください";
                    break;
                case "HDS":

                    break;

            }
}

/**
 * statusから画像を設定する
 * @param {canvasElement} canvasElement 
 * @param {poseLandmarks} poseLandmarks 
 * @param {string} what 
 * @returns 
 */
const setImage  = (canvasElement, poseLandmarks, what)=>{
            const width = canvasElement.width * (calcLength2point(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_EAR], poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_EAR]) * 2);
            const status = document.getElementById("status").style.textContent;
            const nowTime = Date.now();
            if (status === "please stand up") {
                return;
            } else if (what === "fire") {
                const height = width * Math.round(img_fire.height / img_fire.width);
                const left_x = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x * canvasElement.width) - (width / 2);
                const left_y = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_fire, left_x, left_y, width, height);
                const right_x = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x * canvasElement.width) - (width / 2);
                const right_y = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_fire, right_x, right_y, width, height);
            } else if (what === "down") {
                const height = width * Math.round(img_down.height / img_down.width);
                const left_x = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x * canvasElement.width) - (width / 2);
                const left_y = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_down, left_x, left_y, width, height);
                const right_x = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x * canvasElement.width) - (width / 2);
                const right_y = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_down, right_x, right_y, width, height);
            } else if (what === "up") {
                const height = width * Math.round(img_up.height / img_up.width);
                const left_x = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x * canvasElement.width) - (width / 2);
                const left_y = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_up, left_x, left_y, width, height);
                const right_x = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x * canvasElement.width) - (width / 2);
                const right_y = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_up, right_x, right_y, width, height);
            } else if (what === "gauge") {
                document.getElementsByClassName("counter")[0].style.display = "none";
                document.getElementsByClassName("gauge")[0].style.display = "block";
                document.getElementsByClassName("gauge")[0].style.display = "block";
                document.getElementsByClassName("gauge")[0].style.width = width;
                document.getElementsByClassName("gauge")[0].style.height = width;
                document.getElementsByClassName("gauge")[0].style.left = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x * canvasElement.width);
            } else if (what === "counter") {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                document.getElementsByClassName("counter")[0].style.display = "block";
                document.getElementsByClassName("counter")[0].style.left = (Math.round(poseLandmarks[POSE_LANDMARKS.NOSE].x * canvasElement.width) - (width / 2)) + "px";

            } else if (what === "hohaba") {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                const height = width * Math.round(img_left.height / img_left.width);
                const left_x = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].x * canvasElement.width) - (width / 2);
                const left_y = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].y * canvasElement.height) - (height);
                canvasCtx.drawImage(img_right, left_x, left_y, width, height);
                const right_x = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].x * canvasElement.width) - (width / 2);
                const right_y = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].y * canvasElement.height) - (height);
                canvasCtx.drawImage(img_left, right_x, right_y, width, height);
            } else if (what === "width") {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                const height = width * Math.round(img_right.height / img_right.width);
                const left_x = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x * canvasElement.width) - (width / 2);
                const left_y = Math.round(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_left, left_x, left_y, width, height);
                const right_x = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x * canvasElement.width) - (width / 2);
                const right_y = Math.round(poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].y * canvasElement.height) - (height / 2);
                canvasCtx.drawImage(img_right, right_x, right_y, width, height);
            } else if (what === "front") {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                const height = width * Math.round(img_front.height / img_front.width);
                let x, y;
                if (poseLandmarks[POSE_LANDMARKS_NEUTRAL.NOSE].x < 0.5) {
                    x = canvasElement.width * 0.75 - (width / 2);
                    y = canvasElement.height * 0.5 - (height / 2);
                } else {
                    x = canvasElement.width * 0.25 - (width / 2);
                    y = canvasElement.height * 0.5 - (height / 2);
                }
                if (Math.floor(nowTime / 1000) % 2 === 0) canvasCtx.drawImage(img_front, x, y, width * 3, height * 3);
                else canvasCtx.drawImage(img_shisei_ok, x, y, width * 3, height * 3);
            } else if (what === "back") {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                const height = width * Math.round(img_back.height / img_back.width);
                let x, y;
                if (poseLandmarks[POSE_LANDMARKS_NEUTRAL.NOSE].x < 0.5) {
                    x = canvasElement.width * 0.75 - (width / 2);
                    y = canvasElement.height * 0.5 - (height / 2);
                } else {
                    x = canvasElement.width * 0.25 - (width / 2);
                    y = canvasElement.height * 0.5 - (height / 2);
                }
                if (Math.floor(nowTime / 1000) % 2 === 0) canvasCtx.drawImage(img_back, x, y, width * 3, height * 3);
                else canvasCtx.drawImage(img_shisei_ok, x, y, width * 3, height * 3);
            } else {
                document.getElementsByClassName("gauge")[0].style.display = "none";
                return;
            }

}

/**
 * スクワットの成功数をカウントする
 * 最初にStartを引数に入れることでカウントスタート
 * 以降引数に前の数値を入れて自動でカウント＆Boardに表示する
 * @param {*} any 
 */
const counter = (any) =>{
    let num;
            if (any === "start") {
                num = 0;
            } else if (Number.isInteger(any)) {
                num = any += 1;
            } else {
                throw (Error);
            }
            document.getElementById("counter").textContent = "回数:" + num;
            document.getElementById("counter").value = num;
}

/**
 * errのカウント
 * stockData["err"]が200を超えるとeasy-siteに飛ばす
 * @param {string} e 
 */
const catchErr = (e) => {
    if (stockData["err"] > 200) {
        document.getElementsByClassName("overlay2")[0].style.display = "block";
        const easySite = document.getElementById("easy-site");
        const button2 = document.getElementById("button2");
        stopMusic();
        easySite.addEventListener('click', function () {
            location.replace("https://nyatsuyai.github.io/PoseNet_Posture-estimation/test-easy.html");

        });
        button2.addEventListener('click', function () {
            document.getElementsByClassName("overlay2")[0].style.display = "none";
            allowMusic();
        });
    }
    else {
        if (e === "front") {
            stockData["err"] += 1;
        } else if (e === "back") {
            stockData["err"] += 1;
        }
        else if (e === "hohaba") {
            stockData["err"] += 0.5;
        }
        else if (e === "width") {
            stockData["err"] += 0.5;
        }
        else { returtn; }
    }
}


let flgSqwat = false;
let startSqwat;
let errTime;
/**
 *SetとflgSquatに応じて画像音声の設定を行う
 * @param {string} set 
 * @returns 
 */
const statusChecker = (set) => {
    const nowTime = Date.now();

    if (set === "HDS") {
        textSet("HDS");
        document.getElementById("board").style.backgroundColor = '#ff0000';
    } else if (set === "front") {
        catchErr("front");
        errTime = nowTime;
        textSet("please look forward front");
        document.getElementById("status").textContent = "please look forward front";
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
        if (nowPlay !== mp3_sesuji_front) {
            startMusic(mp3_sesuji_front, true);
        }
    } else if (set === "back") {
        catchErr("back");
        errTime = nowTime;
        textSet("please look forward back");
        document.getElementById("status").textContent = "please look forward back";
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
        if (nowPlay !== mp3_sesuji_back) {
            startMusic(mp3_sesuji_back, true);
        }
    } else if (set === "hohaba") {
        catchErr("hohaba");
        errTime = nowTime;
        textSet("please open ankle");
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
        if (nowPlay !== mp3_hohaba) {
            startMusic(mp3_hohaba, true)
        }
    } else if (set === "width") {
        catchErr("width");
        errTime = nowTime;
        textSet("width squat");
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
        if (nowPlay !== mp3_width) {
            startMusic(mp3_width, true)
        }
    } else if (flgSqwat && set === "ok") {
        startSqwat += (nowTime-errTime);
        errTime = 0;
        if (nowTime - startSqwat  >= 2000) {
            textSet("please stand up");
            document.getElementById("status").textContent = "please stand up";
            document.getElementById("board").style.backgroundColor = '#ffffff';
            document.getElementsByClassName("gauge")[0].style.display = "none";
           
            const countNum = document.getElementById("counter").value;
            counter(countNum);
            textSet("sqwat done");
            document.getElementById("status").textContent = "sqwat done";

            if (nowPlay !== mp3_pinpon && nowPlay !== mp3_tatte) {
                startMusic(mp3_pinpon, false);
                setTimeout(function () {
                    startMusic(mp3_tatte, true);
                }, 1000);
            }
        } else {
            textSet("keep");
            document.getElementById("status").textContent = "keep";
            document.getElementById("board").style.backgroundColor = '#00ff00';
            if (nowPlay !== mp3_stop) {
                startMusic(mp3_stop, true);
            }
        }
    } else if (!flgSqwat && set === "ok") {
        startSqwat = Date.now();
        flgSqwat = true;
    } else if (flgSqwat && set === "down") {
       
            textSet("sqwat reset");
            document.getElementById("status").textContent = "sqwat reset";
        
        flgSqwat = false;
        document.getElementsByClassName("gauge")[0].style.display = "none";
    } else if (!flgSqwat && set === "down") {
        textSet("good position start squat");
        document.getElementById("status").textContent = "good position start squat";
        document.getElementById("board").style.backgroundColor = '#00f0ff';
        if (document.getElementById("counter").value === 0) {
            if (nowPlay !== mp3_goodposition && nowPlay !== mp3_sagete) {
                startMusic(mp3_goodposition, false);
                setTimeout(function () {
                    startMusic(mp3_sagete, true);
                }, 3000);
            }
        } else if (nowPlay !== mp3_sagete) {
            startMusic(mp3_sagete, true);
        }
    } else if (set === "up") {
        textSet("too squat");
        errTime = nowTime;
        document.getElementById("status").textContent = "too squat";
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (nowPlay !== mp3_agete) {
            startMusic(mp3_agete, true);
        }
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
    } else if (set === "none" || set === null) {
        textSet("out")
        document.getElementById("status").textContent = "out";
        document.getElementById("board").style.backgroundColor = '#ff0000';
        if (flgSqwat) {
            flgSqwat = false;
            document.getElementsByClassName("gauge")[0].style.display = "none";
        }
        if (nowPlay !== mp3_sagatte) {
            startMusic(mp3_sagatte, true);
        }



    } else { return; }
}
const cells = []
const items = 31;
const coordinates = [];
/**
 * excelデータのタイトルの作成
 */
const cellMake  = ()=>{
    //タイムスタンプと共に角度とどの信頼度をセルにする
    const cellTag = {
        0: "時刻（日本）",
        1: "status",
        2: "kneeAngle",
        3: "kneeAngle visivility",
        4: "hipAngle",
        5: "hipAngle visivility",
        6: "slope a",
        7: " slope b",
        8: " shoulder x",
        9: " shoulder y",
        10: " shoulder z",
        11: " hip x",
        12: " hip y",
        13: " hip z",
        14: " knee x",
        15: " knee y",
        16: " knee z",
        17: " ankle x",
        18: " ankle y",
        19: " ankle z",
        20: "slope_min",
        21: "slope_min_hipangle",
        22: "hipangle_average",
        23: "slope_max_hipangle",
        24: "slope_max",
        25: "count",
        26: "ankle angle",
        27: "ankle angle visivility",
        28: "heel angle",
        29: "heel angle visivility ",

    };
    console.log(cellTag)
    cells.push(cellTag);
}

/**
 * 
 * @param {*} resultAngle 
 * @param {poseLandmarks} poseLandmarks 
 */
const cellUpdate = (resultAngle,poseLandmarks) =>{
    //cellMakeにデータをぶち込む
    const timeStamp = () => {
        const today = new Date();
        const yy = ('0000' + today.getFullYear()).slice(-4);
        const mo = ('00' + (today.getMonth() + 1)).slice(-2);
        const dd = ('00' + today.getDate()).slice(-2);
        const hh = ('00' + today.getHours()).slice(-2);
        const mi = ('00' + today.getMinutes()).slice(-2);
        const ss = ('00' + today.getSeconds()).slice(-2);
        const ms = ('000' + today.getMilliseconds()).slice(-3);


        return yy + mo + dd + hh + mi + ss + ms;
    }

    const cell = [
        timeStamp(),
        document.getElementById("status").textContent,
        average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle),
        average(resultAngle.leftKnee.visibility, resultAngle.rightKnee.visibility),
        average(resultAngle.leftHip.angle, resultAngle.rightHip.angle),
        average(resultAngle.leftHip.visibility, resultAngle.rightHip.visibility),
        stockData["slpoes"]["a"],
        stockData["slpoes"]["b"],
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER].x, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER].x),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER].y, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER].y),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER].z, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER].z),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].x, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].x),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].y, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].y),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].z, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP].z),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].x),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].y),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].z, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE].z),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].x, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].x),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].y, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].y),
        average(poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].z, poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].z),
        stockData["slopeMin"]["a_min"],
        stockData["slopeKneeAngle"] * stockData["slopeMin"]["a_min"] + stockData["slopeMin"]["b_min"],
        stockData["slopeHipAngle"],
        stockData["slopeKneeAngle"] * stockData["slopeMax"]["a_max"] + stockData["slopeMax"]["b_max"],
        stockData["slopeMax"]["a_max"],
        document.getElementById("counter").value,
        average(resultAngle.leftAnkle.angle, resultAngle.rightAnkle.angle),
        average(resultAngle.leftAnkle.visibility, resultAngle.rightAnkle.visibility),
        average(resultAngle.leftHeel.angle, resultAngle.rightHeel.angle),
        average(resultAngle.leftHeel.visibility, resultAngle.rightHeel.visibility),

    ];
    cells.push(cell);
    coordinates.push({ x: average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle), y: average(resultAngle.leftHip.angle, resultAngle.rightHip.angle) });
    if (average(resultAngle.leftKnee.visibility, resultAngle.rightKnee.visibility) > paramDataSet["humanJudge"] && average(average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle), average(resultAngle.leftHip.angle, resultAngle.rightHip.angle)) > 150) {
        if (stockData["slopeKneeAngle"] === 0)stockData["slopeKneeAngle"] = average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle);
        if (stockData["slopeHipAngle"] === 0)stockData["slopeHipAngle"] = average(resultAngle.leftHip.angle, resultAngle.rightHip.angle);
        stockData["slopeKneeAngle"] = average(stockData["slopeKneeAngle"], average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle));
        stockData["slopeHipAngle"] = average(stockData["slopeHipAngle"], average(resultAngle.leftHip.angle, resultAngle.rightHip.angle));
    }
}

const cellDownload = (items, cells) =>{
    //cellをローカルに保存
    let str = "";
    for (let i = 0; i < cells.length; i++) {
        let nowCell = cells[i];
        for (let j = 0; j < items; j++) {
            str += nowCell[j];
            if (j === (items - 1)) {
                str += "\n";
            } else {
                str += ",";
            }
        }
    }
    let blob = new Blob([str], { type: "text/csv" }); //配列に上記の文字列(str)を設定
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "squatdata.csv";
    link.click();
}

const cellUpload = (items, cells) =>{
    let str = "";
            for (let i = 0; i < cells.length; i++) {
                let nowCell = cells[i];
                for (let j = 0; j < items; j++) {
                    str += nowCell[j];
                    if (j === (items - 1)) {
                        str += "\n";
                    } else {
                        str += ",";
                    }
                }
            }

            // (1)XMLHttpRequestオブジェクトを作成
            let xmlHttpRequest = new XMLHttpRequest();
            let formData = new FormData();

            formData.append("str", str);
            formData.append("user", Object.fromEntries(new URLSearchParams(window.location.search)).user)

            // (2)onreadystatechangeイベントで処理の状況変化を監視
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    console.log("success!");
                }
            }

            // (3)HTTPのGETメソッドとアクセスする場所を指定
            xmlHttpRequest.open('POST', 'https://script.google.com/macros/s/AKfycbzrlWBbic3G1jnOybqbqko0gVcwCb4KeYclPESna5MkESsFJ7-XKEwV8G7puUm_D1XV/exec', true);

            // (4)HTTPリクエストを送信
            xmlHttpRequest.send(formData);

}

//ボタンを押したらCSV出力
const finButton = document.getElementById('fin');
finButton.addEventListener('click', function () {
    stopMusic();
    document.exitFullscreen();
    $(function () {
        $(".overlay").show();
    });
    //cellDrive(items, cells);//Driveにアップロード
    cellDownload(items, cells);//localにダウンロード
    const user = Object.fromEntries(new URLSearchParams(window.location.search)).user.split(",");
    console.log(user);

});

function onResults(results) {
    if (!results.poseLandmarks) {
        grid.updateLandmarks([]);
        return;
    }
    resizeWindow();

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasCtx.drawImage(results.segmentationMask, 0, 0,
    //     canvasElement.width, canvasElement.height);

    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);


    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-over';
    // console.log(results.poseLandmarks)
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 2 });
    drawLandmarks(canvasCtx, Object.values(POSE_LANDMARKS_NEUTRAL)
        .map(index => results.poseLandmarks[index]),
        { color: '#00FF00', lineWidth: 3 });
    drawLandmarks(canvasCtx, Object.values(POSE_LANDMARKS_LEFT)
        .map(index => results.poseLandmarks[index]),
        { color: '#FF0000', lineWidth: 3 });
    drawLandmarks(canvasCtx, Object.values(POSE_LANDMARKS_RIGHT)
        .map(index => results.poseLandmarks[index]),
        { color: '#0000FF', lineWidth: 3 });

    const faceSize = facecat(canvasElement, img_img1, results.poseLandmarks[POSE_LANDMARKS.NOSE], results.poseLandmarks[POSE_LANDMARKS.LEFT_EAR], results.poseLandmarks[POSE_LANDMARKS.RIGHT_EAR]);
    canvasCtx.drawImage(
        img_img1, faceSize.x, faceSize.y, faceSize.width, faceSize.height);

    canvasCtx.restore();

    if (results.poseWorldLandmarks) {
        const resultAngle = {};
        for (let key in needVector) {
            resultAngle[key] = calcAngleFrom3Point(results.poseWorldLandmarks[needVector[key][0]], results.poseWorldLandmarks[needVector[key][1]], results.poseWorldLandmarks[needVector[key][2]]);
        }



        //姿勢が判定位置にあり、人が存在している時
        if ((stockData["selectedAngle"] - stockData["selectedMargin"]) < average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle) && average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle) < (stockData["selectedAngle"] + stockData["selectedMargin"]) && Math.min(resultAngle.leftKnee.visibility, resultAngle.rightKnee.visibility) > paramDataSet['humanJudge']) {

            if (resultsCheck(results, "width") === "width") {
                statusChecker("width");
                setImage(canvasElement, results.poseLandmarks, "width");
            } else if (resultsCheck(results, "HDS") === "HDS") {
                statusChecker("HDS");
                statusChecker("ok");
                setImage(canvasElement, results.poseLandmarks, "fire");
                setImage(canvasElement, results.poseLandmarks, "gauge");
            } else if (checkShisei(resultAngle) === "front") {
                statusChecker("front");
                setImage(canvasElement, results.poseLandmarks, "front");
            } else if (checkShisei(resultAngle,"front") === "back") {
                statusChecker("back");
                setImage(canvasElement, results.poseLandmarks, "back");
            } else if (document.getElementById("status").textContent === "please stand up") {
                statusChecker("ok");
                setImage(canvasElement, results.poseLandmarks, "up");

            } else {
                statusChecker("ok");
                setImage(canvasElement, results.poseLandmarks, "fire");
                setImage(canvasElement, results.poseLandmarks, "gauge");
            }

        } else {
            if (paramDataSet['humanJudge'] < Math.min(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX].visibility, results.poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX].visibility)) {

                if (resultsCheck(results, "hohaba") === "hohaba") {
                    statusChecker("hohaba")
                    setImage(canvasElement, results.poseLandmarks, "hohaba");
                } else if ((stockData["selectedAngle"] - stockData["selectedMargin"]) > average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle)) {
                    statusChecker("up");
                    setImage(canvasElement, results.poseLandmarks, "counter");
                    setImage(canvasElement, results.poseLandmarks, "up");
                } else if (average(resultAngle.leftKnee.angle, resultAngle.rightKnee.angle) > (stockData["selectedAngle"] + stockData["selectedMargin"])) {
                    statusChecker("down");
                    setImage(canvasElement, results.poseLandmarks, "counter");
                    setImage(canvasElement, results.poseLandmarks, "down");
                }

            } else {
                setImage(canvasElement, results.poseLandmarks, "counter");
                statusChecker("none");
            }

        }

        cellUpdate(resultAngle, results.poseWorldLandmarks);
    }

    // grid.updateLandmarks(results.poseWorldLandmarks, POSE_CONNECTIONS, [
    //     { list: Object.values(POSE_LANDMARKS_LEFT), color: 'LEFT' },
    //     { list: Object.values(POSE_LANDMARKS_RIGHT), color: 'RIGHT' }
    // ]);
}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
    min_pose_presence_confidence: 0.5,
    runningMode: "VIDEO",
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
        // // // Canvasにカメラの映像を描画
        // // const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
        // // const canvasHeight = videoElement.videoHeight; // 期待するCanvasの高さ
        // // const canvasWidth = canvasHeight * aspectRatio; // アスペクト比を保った幅を計算

        // // カメラの映像を中央に描画するための座標を計算
        // const offsetX = (1280 - canvasElement.width) / 2;
        // const offsetY = 0; // キャンバスの上部に配置する場合

        // // canvasElement.width = 1280; // キャンバス全体の幅
        // // canvasElement.height = canvasHeight;
        // // const ctx = canvasElement.getContext('2d');
        // canvasCtx.fillStyle = 'white'; // 空白部分を黒で塗りつぶす（任意の背景色に変更可能）
        // canvasCtx.fillRect(0, 0, 1280, canvasElement.height); // 空白部分を描画
        // // ctx.drawImage(videoElement, offsetX, offsetY, canvasWidth, canvasHeight);
        console.log(videoElement.videoWidth,videoElement.videoHeight)
        console.log(canvasElement.videoWidth,canvasElement.videoHeight)
},
    // width: 600,
    // height: 1332,

    width: videoElement.videoWidth/2,
    height: videoElement.videoHeight,
});
camera.start();
cellMake();
counter("start");
window.onresize = resizeWindow;
getParam();