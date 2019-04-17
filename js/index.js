(function () {
    // 模拟数据
    // 页面刚加载读取本地存储的歌曲列表
    let data = localStorage.getItem('mList')?
        //如果读到给个正确的值，读不到给个空数组
    JSON.parse(localStorage.getItem('mList')) : [];

    // 获取元素
   let start = document.querySelector('.start');
   let next = document.querySelector('.next');
   let prev = document.querySelector('.prev');
   let audio = document.querySelector('audio');
   let nowTimeSpan = document.querySelector('.nowTime');
   let totalTimeSpan = document.querySelector('.totalTime');
   let songSinger = document.querySelector('.ctrl-bars-box span');
   let logoImg = document.querySelector('.logo img');
   let ctrlBars = document.querySelector('.ctrl-bars');
   let nowBars = document.querySelector('.nowBars');
   let ctrlBtn = document.querySelector('.ctrl-btn');
   let modeBtn = document.querySelector('.mode');
   let infoEl = document.querySelector('.info');
   let listBox = document.querySelector('.play-list-box ul');

    //变量
    let index = 0;//标识当前播放歌曲索引
    let rotateDeg = 0;//记录专辑封面旋转角度
    let timer = null;//保存定时器
    let modeNum = 0;//表述当前的播放模式（0 顺序播放  1 单曲循环 2随机播放）
    let infoTimer = null;//清除一下 （不然定时器会出问题）
    let searchDate = [];//搜索列表

    //加载播放列表
    function loadPlayList(){
       if(data.length){
           let str = '';//用来累积播放项
           // 加载播放列表
           for(let i = 0; i < data.length; i++){
               str +='<li>';
               str +='<i>×</i>';
               str +='<span>';
               for(let j = 0; j < data[i].ar.length; j++){
                   str += data[i].ar[j].name + '  ';
               }
               str +='</span>';
               str +='<span>'+ data[i].name +'</span>';
               str +='</li>';
           }
           listBox.innerHTML = str;
       }
    }

    //切换播放列表
    function checkPlayList() {
        let playList = document.querySelectorAll('.play-list-box li');
        for(let i = 0; i < playList.length; i++){
            playList[i].className = '';
        }
        playList[index].className = 'active';
    }


    // 请求服务器
    $('.search').on('keydown',function (e) {
        if(e.keyCode === 13){
            //按下了回车键
            $.ajax({
                //服务器请求地址
                url:'https://api.imjad.cn/cloudmusic/',
                //参数
                data: {
                    type: 'search',
                    s:this.value
                },
                //success请求成功后执行的函数；data请求成功后返回的结果
                success: function (data) {
                    console.log(data.result.songs);
                    searchDate = data.result.songs;
                    var str = '';
                    for(var i = 0; i < searchDate.length; i++){
                        str += '<li>';
                        str += '<spean class="left song">'+ searchDate[i].name +'</spean>';
                        str += '<spean class="right singer">';
                        for(var j = 0; j < searchDate[i].ar.length; j++){
                            str += searchDate[i].ar[j].name + '  ';
                        }
                        str +='</spean>'
                        str += '</li>';
                    }
                    $('.searchUl').html(str);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            //搜索输入框的东西之后回车变为空
            this.value = '';
        }
    });
    //点击搜索列表
    $('.searchUl').on('click','li',function () {
        data.push(searchDate[$(this).index()]);
        // 设置本地存储，必须转换成字符串才能设置不可以以对象的形式设置
        // 把JSON设置成字符串放到mList里面去
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        index = data.length - 1;
        init();
        play();
    });



    // //加载播放歌曲的数量
    // function loadNum() {
    //     ${'.play-list'}.html(data.length);
    // }
    // 加载播放歌曲的数量
    function loadNum() {
        $('.play-list').html(data.length);
    }
    loadNum();

    // 格式化时间
    function fromatTime(time) {
        return time > 9 ? time : '0' + time;
    }

    // 提示框提示
    function info(str) {
        infoEl.innerHTML = str;
        $(infoEl).fadeIn();
        clearInterval(infoTimer);
        infoTimer = setTimeout(function () {
            $(infoEl).fadeOut();
        },1000)
    }

    //点击播放列表放歌
    $(listBox).on('click','li',function () {
        // this特指某li标签
        index = $(this).index();
        init();
        play();
    });
    
    //删除播放列表的歌曲
    $(listBox).on('click','i',function (e) {
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();
    });

   /*//音量控制器（0代表没声音 1代表100%音量最大）
    audio.volume = 1;*/
    loadPlayList();
    // 初始化播放
    function init(){
        rotateDeg = 0;
        // 给audio设置播放路径
        $('.mask').css({
            background:'url("'+ data[index].al.picUrl +'")',
            backgroundSize: '100%',

    });
        audio.src = 'http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3';
        let str = '  ';
        str += data[index].name + '---';
        for(let i = 0;i < data[index].ar.length; i++){
            str += data[index].ar[i].name + '  ';
        }
        // spean标签的文字内容(让innerHTML等于歌手名---歌曲名)
        songSinger.innerHTML =str;
        // 显示每首歌的图片
        logoImg.src = data[index].al.picUrl;
        checkPlayList();
    }
    init();

    // 取不重复的随机数 （递归方式）
    function getRandomNum() {//调用这个getRandomNum方法会得到一个永远不重复的随机数
        let randomNum = Math.floor(Math.random() * data.length);
        if(randomNum == index){
            randomNum = getRandomNum();
        }
        return randomNum;
    }

    // 播放音乐
    function play(){
        audio.play();
        clearInterval(timer);
        timer = setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate('+rotateDeg+'deg)';
        },30);
        start.style.backgroundPositionY = '-160px';
    }
    // 播放和暂停
    start.addEventListener('click',function () {
        // 检测歌曲是播放状态还是暂停(播放暂停按键)
        if(audio.paused){
            play();
        }else {
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY = '-199px';
        }
    });
    // 下一曲
    next.addEventListener('click',function () {
        index++;
        index = index > data.length - 1 ? 0 : index;
        init();
        play();
    });
    // 上一曲
    prev.addEventListener('click',function () {
        index--;
        index = index < 0 ? data.length - 1  : index;
        init();
        play();
    });

    // 切换播放模式
    modeBtn.addEventListener('click',function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX = '0px';
                modeBtn.style.backgroundPositionY = '-336px' ;
                break;
            case 1://
                info('单曲循环');
                modeBtn.style.backgroundPositionX = '-64px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX = '-64px';
                modeBtn.style.backgroundPositionY = '-241px';
                break;
        }
    });
    //音乐准备完成

    audio.addEventListener('canplay',function () {
        // console.log('我准备完成');
        // NaN  not a number 不是一个数字
        // console.log(audio.duration);
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime / 60);
        let totalS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = fromatTime(totalM) + ':' +fromatTime(totalS);
        // // console.log(totalM)
        audio.addEventListener('timeupdate',function() {
           let  currentTime = audio.currentTime;
           let curentM = parseInt(currentTime / 60);
           let curentS = parseInt(currentTime % 60);
           nowTimeSpan.innerHTML = fromatTime(curentM) + ':' +fromatTime(curentS);

           //这个可以拿到进度条当前的宽度；
           let barWidth = ctrlBars.clientWidth;
           let position = currentTime / totalTime * barWidth;
           console.log(position);
            nowBars.style.width = position + 'px';
            ctrlBtn.style.left = position - 5 + 'px';

            if(audio.ended){
               switch (modeNum) {
                   case 0: //顺序播放
                       next.click();
                       break;
                   case  1://单曲循环
                       init();
                       play();
                       break;
                   case 2://随机播放(Math.floor 向下取整)
                       index = getRandomNum();
                       init();
                       play();
                       break;
               }
            }
        });
        //进度条的快进后退
        ctrlBars.addEventListener('click',function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        });

    });

})();