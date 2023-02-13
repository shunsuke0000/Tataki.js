

let calibrationTime = 10000; // 10秒


let TatakiCalibration = class {
    constructor() {
        this.arrAX = [];
        this.arrAY = [];
        this.arrAZ = [];
        this.arrRX = [];
        this.arrRY = [];
        this.arrRZ = [];
        this.arrTime = [];
        this.threshold;
    }
    setData(ax, ay, az, rx, ry, rz, time){
        this.arrAX.push(ax);
        this.arrAY.push(ay);
        this.arrAZ.push(az);
        this.arrRX.push(rx);
        this.arrRY.push(ry);
        this.arrRZ.push(rz);
        this.arrTime.push(time);
    }
    calcThreshold(n){
        // 配列を結合
        let concatArr = this.arrAX.concat(this.arrAY, this.arrAZ);

        // 昇順(左が小さい)でソート
        let f = (a, b) => {
            return a - b;
        }
        // concatArr.sort(f);
        concatArr = concatArr.sort(f);

        // 大きいN個の配列を抽出
        let biggerArr = concatArr.slice(concatArr.length - n);
        console.log(biggerArr);

        // 大きいN個の配列の平均値を計算
        let sum = 0;
        for (let i = 0; i < biggerArr.length; i++) {
            sum += biggerArr[i];
        }
        let heikin = sum / biggerArr.length;

        // 平均値を0.8倍する
        let threshold = heikin * 0.6;

        // 保存
        this.threshold = threshold;
    }
    getThreshold(){
        return this.threshold;
    }
    dataReset(){
        this.arrAX = [];
        this.arrAY = [];
        this.arrAZ = [];
        this.arrRX = [];
        this.arrRY = [];
        this.arrRZ = [];
        this.arrTime = [];
        this.threshold;
    }
}

let tatakiCalibration = new TatakiCalibration();

const handleDeviceMotionCalibration = (e) => {
    // 通常の処理を無効にする
    // e.preventDefault();

    let now = Date.now();

    // 加速度と角速度を取得
    let ax = e.acceleration.x;
    let ay = e.acceleration.y;
    let az = e.acceleration.z;
    let rx = e.rotationRate.alpha;
    let ry = e.rotationRate.beta;
    let rz = e.rotationRate.gamma;
    if(!rx){
        rx = 0;
    }
    if(!ry){
        ry = 0;
    }
    if(!rz){
        rz = 0;
    }

    // センサの向きがiOSとAndroidで違うため、Android流に統一する
    let ua = navigator.userAgent
    if (ua.indexOf("iPhone") >= 0 || ua.indexOf("iPad") >= 0 || navigator.userAgent.indexOf("iPod") >= 0){
        ax = -1 * ax;
        ay = -1 * ay;
        az = -1 * az;
    }

    // データの配列を更新
    tatakiCalibration.setData(ax, ay, az, rx, ry, rz, now);
}

let removeHandleDeviceMotionCalibration = ()=> {
    window.removeEventListener( "devicemotion", handleDeviceMotionCalibration, false );
    console.log(Date.now());
}


let removeTatakiProgress = () => {
    document.getElementById('tatakiProgress').remove();
}

let kindsSumaho;

// キャリブレーションの時間が終わったら
let calibrationTimeOut = () => {
    removeHandleDeviceMotionCalibration();
    document.getElementById('tatakiBridge').isCalibration = 'false';

    let n = 5;
    tatakiCalibration.calcThreshold(n);
    let threshold = tatakiCalibration.getThreshold();

    localStorage.setItem('tatakiThreshold', threshold);
    console.log(localStorage.getItem('tatakiThreshold'));

    

    localStorage.setItem('deviceKinds', kindsSumaho);
    console.log(localStorage.getItem('deviceKinds'));

    removeTatakiProgress();

    // ////////////////////////////////////////////////////////////////
    let addTatakiProgress = () => {
        // 進行状況バー
        let tatakiProgress = document.createElement('progress');
        // id
        tatakiProgress.id = 'tatakiProgress';
        // 値
        tatakiProgress.max = 5;
        tatakiProgress.value = 0;
        // スタイル
        tatakiProgress.style.height= '15%';
        tatakiProgress.style.width= '80%';
        // 要素を追加
        tatakiChild.appendChild(tatakiProgress);
    }
    // キャリブレーションスタートボタン
    let tatakiChild = document.getElementById('tatakiChild');


    let tatakiButtonCalibStart = document.createElement('button');
    // id
    tatakiButtonCalibStart.id = 'tatakiButtonCalibStart';
    // テキスト内容
    tatakiButtonCalibStart.innerHTML = 'もう一度キャリブレーションを開始'
    // スタイル
    tatakiButtonCalibStart.style.height= '20%';
    tatakiButtonCalibStart.style.width= '80%';
    tatakiButtonCalibStart.style.fontSize = 'min(3vh, 4vw)';
    // イベント
    let tatakiButtonCalibStartRemove = () => {
        tatakiButtonCalibStart.remove();
    }
    tatakiButtonCalibStart.addEventListener('click', handleClickDeviceSensorCalibration);
    tatakiButtonCalibStart.addEventListener('click', tatakiButtonCalibStartRemove);
    tatakiButtonCalibStart.addEventListener('click', addTatakiProgress);
    // 要素を追加
    tatakiChild.appendChild(tatakiButtonCalibStart);


    // ブラウザバックボタン
    let tatakiButtonBack = document.createElement('button');
    // id
    tatakiButtonBack.id = 'tatakiButtonBack';
    // テキスト内容
    tatakiButtonBack.innerHTML = 'キャリブレーションを終了' + '(閾値：' + String( Math.round(threshold*1000)/1000 ) + ')';
    // スタイル
    tatakiButtonBack.style.height= '20%';
    tatakiButtonBack.style.width= '80%';
    tatakiButtonBack.style.fontSize = 'min(3vh, 4vw)';
    // イベント
    let browserBack = () => {
        history.back();
    }
    tatakiButtonBack.addEventListener('click', browserBack);
    // 要素を追加
    tatakiChild.appendChild(tatakiButtonBack);

    let tatakiButtonBackRemove = () => {
        tatakiButtonBack.remove();
    }
    tatakiButtonCalibStart.addEventListener('click', tatakiButtonBackRemove);

}

// devicemotionにhandleDeviceMotionCalibrationを登録
const handleClickDeviceSensorCalibration = () => {
    // DeviceMotionEventがある時
    if( window.DeviceMotionEvent ){
        console.log(window.DeviceMotionEvent);

        // ios13以上の時
        if( DeviceMotionEvent.requestPermission && typeof DeviceMotionEvent.requestPermission === 'function' ){
            console.log('ios13+');
            // ユーザーに許可を求めるダイアログを表示
            DeviceMotionEvent.requestPermission().then( (response) => {
                if( response === 'granted' ){
                    // 許可された場合のみイベントハンドラを追加
                    window.addEventListener( "devicemotion", handleDeviceMotionCalibration, false );
                    document.getElementById('tatakiBridge').isCalibration = 'true';
                    setTimeout(calibrationTimeOut, calibrationTime);
                }
            }).catch( ( e ) => {
                console.log( e );
            });

        // ios13以上でない時
        } else{
            console.log('non ios13+');
            window.addEventListener( "devicemotion", handleDeviceMotionCalibration, false );
            document.getElementById('tatakiBridge').isCalibration = 'true';
            setTimeout(calibrationTimeOut, calibrationTime);
        }

    // DeviceMotionEventがない時
    } else{
        console.log("window.DeviceMotionEventがありません");
        alert('このデバイスはDeviceMotionEventに対応していません');
    }
}


const handleTatakiRemove = () => {
    document.getElementById('tatakiChild').remove();
}

let makeTatakiCalibration = () => {


    // let TatakiElement = class {
    //     constructor() {
    //         this.tatakiChild = document.createElement('div');
    //     }
    // }

    // 親要素を取得
    let tataki = document.getElementById('tataki');


    // 親要素を作成
    let tatakiChild = document.createElement('div');
    // id
    tatakiChild.id = 'tatakiChild';
    // サイズ
    tatakiChild.style.height = String(parseInt(window.innerHeight * 0.4))+'px';
    tatakiChild.style.width  = String(parseInt(window.innerWidth))+'px';
    // スタイル
    tatakiChild.style.backgroundColor = 'rgba(250,220,180,0.25)';
    tatakiChild.style.position = 'fixed';
    tatakiChild.style.bottom = '0';
    tatakiChild.style.left   = '0';
    tatakiChild.style.right  = '0';
    tatakiChild.style.margin = '0';
    // Flexboxにする
    tatakiChild.style.display = 'flex';
    tatakiChild.style.alignItems = 'center';
    tatakiChild.style.justifyContent = 'space-around';
    tatakiChild.style.flexDirection = 'column';
    // 要素を追加
    tataki.appendChild(tatakiChild);

    let onWindowResize = () => {
        tatakiChild.style.height = String(parseInt(window.innerHeight * 0.4))+'px';
        tatakiChild.style.width  = String(parseInt(window.innerWidth))+'px';
    }
    window.addEventListener('resize', onWindowResize);


    // キャリブレーションスタートメッセージ
    let tatakiPCalibStart = document.createElement('div');
    // id
    tatakiPCalibStart.id = 'tatakiPCalibStart';
    // サイズ
    tatakiPCalibStart.style.height = '50%';
    tatakiPCalibStart.style.width  = '100%';
    // スタイル
    tatakiPCalibStart.style.display = 'flex';
    tatakiPCalibStart.style.alignItems = 'center';
    tatakiPCalibStart.style.justifyContent = 'space-between';
    // tatakiPCalibStart.style.justifyContent = 'space-around';
    tatakiPCalibStart.style.flexDirection = 'column';
    tatakiPCalibStart.style.fontSize = 'min(3vh, 4vw)';
    // 要素を追加
    tatakiChild.appendChild(tatakiPCalibStart);

    // キャリブレーションスタートメッセージの子要素
    let tatakiPCalibStartChild = document.createElement('p');
    // id
    tatakiPCalibStartChild.id = 'tatakiPCalibStartChild';
    // テキスト内容
    tatakiPCalibStartChild.innerHTML = '下のボタンを押すと点滅が赤色に変わります。<br>' +
                                       '赤色の点滅に合わせて' +
                                       ' <b>5回</b><br>' +
                                       'デバイスの' +
                                       ' 右下など ' +
                                       'を叩いてください。';
    // スタイル
    tatakiPCalibStartChild.style.height = '100%';
    tatakiPCalibStartChild.style.width  = '100%';
    tatakiPCalibStartChild.style.verticalAlign = 'middle';
    tatakiPCalibStartChild.style.textAlign = 'center';
    tatakiPCalibStartChild.style.fontSize = 'clamp(0.2rem, 1rem, 2rem)';
    tatakiPCalibStartChild.style.minHeight = '0vw'; //clampがsafariで効かないから対策
    // 要素を追加
    tatakiPCalibStart.appendChild(tatakiPCalibStartChild);



    // 機種
    let tatakiDivKishu = document.createElement('div');
    // id
    tatakiDivKishu.id = 'tatakiDivKishu';
    // サイズ
    tatakiDivKishu.style.height = '20%';
    tatakiDivKishu.style.width  = '80%';
    // スタイル
    tatakiDivKishu.style.display = 'flex';
    tatakiDivKishu.style.alignItems = 'center';
    tatakiDivKishu.style.justifyContent = 'space-between';
    // tatakiPCalibStart.style.justifyContent = 'space-around';
    tatakiDivKishu.style.flexDirection = 'column';
    // 要素を追加
    tatakiChild.appendChild(tatakiDivKishu);

    // キャリブレーションスタートメッセージの子要素
    let tatakiDivKishuChild = document.createElement('select');
    // id
    tatakiDivKishuChild.id = 'tatakiDivKishuChild';
    // テキスト内容
    // tatakiDivKishuChild.innerHTML = '下のボタンを押すと点滅が赤色に変わります。<br>' +
    //                                    '赤色の点滅に合わせて' +
    //                                    ' <b>5回</b><br>' +
    //                                    'デバイスの' +
    //                                    ' <b>右上</b> ' +
    //                                    'を叩いてください。';
    // スタイル
    tatakiDivKishuChild.style.height = '100%';
    tatakiDivKishuChild.style.width  = '100%';
    tatakiDivKishuChild.style.verticalAlign = 'middle';
    tatakiDivKishuChild.style.textAlign = 'center';
    // tatakiDivKishuChild.style.fontSize = 'clamp(0.2rem, 1rem, 2rem)';
    // tatakiDivKishuChild.style.minHeight = '0vw'; //clampがsafariで効かないから対策
    tatakiDivKishuChild.style.fontSize = 'min(3vh, 4vw)';
    // 要素を追加
    tatakiDivKishu.appendChild(tatakiDivKishuChild);

    // selectのoption
    let tatakiDivKishuChild0 = document.createElement('option');
    tatakiDivKishuChild0.value = 'default';
    tatakiDivKishuChild0.innerHTML = '機種を選択してください';

    let tatakiDivKishuChild1 = document.createElement('option');
    tatakiDivKishuChild1.value = 'SE3';
    tatakiDivKishuChild1.innerHTML = 'SE 3';

    let tatakiDivKishuChild2 = document.createElement('option');
    tatakiDivKishuChild2.value = 'Nexus9';
    tatakiDivKishuChild2.innerHTML = 'Nexus 9';

    let tatakiDivKishuChild3 = document.createElement('option');
    tatakiDivKishuChild3.value = 'FireHD10';
    tatakiDivKishuChild3.innerHTML = 'Fire HD 10';

    let tatakiDivKishuChild4 = document.createElement('option');
    tatakiDivKishuChild4.value = 'others';
    tatakiDivKishuChild4.innerHTML = 'その他';

    tatakiDivKishuChild.appendChild(tatakiDivKishuChild0);
    tatakiDivKishuChild.appendChild(tatakiDivKishuChild1);
    tatakiDivKishuChild.appendChild(tatakiDivKishuChild2);
    tatakiDivKishuChild.appendChild(tatakiDivKishuChild3);
    tatakiDivKishuChild.appendChild(tatakiDivKishuChild4);
    let tatakiDivKishuRemove = () => {
        kindsSumaho = document.getElementById('tatakiDivKishuChild').value;
        tatakiDivKishu.remove();
    }



    let addTatakiProgress = () => {
        // 進行状況バー
        let tatakiProgress = document.createElement('progress');
        // id
        tatakiProgress.id = 'tatakiProgress';
        // 値
        tatakiProgress.max = 5;
        tatakiProgress.value = 0;
        // スタイル
        tatakiProgress.style.height= '30%';
        // tatakiProgress.style.height= '30px';
        tatakiProgress.style.width= '80%';
        // 要素を追加
        tatakiChild.appendChild(tatakiProgress);
    }


    // キャリブレーションスタートボタン
    let tatakiButtonCalibStart = document.createElement('button');
    // id
    tatakiButtonCalibStart.id = 'tatakiButtonCalibStart';
    // テキスト内容
    tatakiButtonCalibStart.innerHTML = 'キャリブレーションを開始'
    // スタイル
    tatakiButtonCalibStart.style.height= '20%';
    tatakiButtonCalibStart.style.width= '80%';
    tatakiButtonCalibStart.style.fontSize = 'min(3vh, 4vw)';
    // イベント
    let tatakiButtonCalibStartRemove = () => {
        tatakiButtonCalibStart.remove();
    }
    tatakiButtonCalibStart.addEventListener('click', handleClickDeviceSensorCalibration);
    tatakiButtonCalibStart.addEventListener('click', tatakiButtonCalibStartRemove);
    tatakiButtonCalibStart.addEventListener('click', tatakiDivKishuRemove);
    tatakiButtonCalibStart.addEventListener('click', addTatakiProgress);
    // 要素を追加
    tatakiChild.appendChild(tatakiButtonCalibStart);


    // ブリッジ
    let tatakiBridge = document.createElement('div');
    // id
    tatakiBridge.id = 'tatakiBridge';
    // スタイル
    tatakiBridge.style.display = 'none';
    // 値
    tatakiBridge.isCalibration = 'false';
    // 要素を追加
    tatakiChild.appendChild(tatakiBridge);

}



window.addEventListener('load', () => {
    // model_load();

    makeTatakiCalibration();

    // localStorageに保存
    // localStorage.setItem('tatakiThreshold', '5');
    // cookieに保存
    // document.cookie = 'tatakiThreshold=5;Max-Age=315360000; SameSite=none; Secure';

    // console.log(document.cookie);
    console.log(localStorage.getItem('tatakiThreshold'));
    console.log(localStorage.getItem('deviceKinds'));
});


