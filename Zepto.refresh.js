/*
*@Description: 实现下拉到底部和上拉到顶部再拉就出现刷新效果 Zepto-touch.js
*@Author: cy08308(2014-07-01)
*@Update: cy08308(2014-09-05)
*/

; (function (win, $, undefined) {    
    var iphone = window.devicePixelRatio === 2 && window.navigator.appVersion.match(/iphone/gi), img1 = new Image(), img2 = new Image();//判断是否是iphone,预加载的图片
    img1.src = "http://img.17u.com/com/img/public/community/image_loading.gif";
    img2.src = "http://img.17u.com/com/img/public/community/LYloadicon.png";
    var multiple = iphone ? 0.5 : 0.5, onloadlogo = '<img width="' + multiple * 40 + '" height="' + multiple * 40 + '" style="position: relative;top: ' + multiple * 10 + 'px;margin-right: ' + multiple * 30 + 'px;"  src="http://img.17u.com/com/img/public/community/image_loading.gif" />', loadlogo = '<img width="' + multiple * 80 + '" height="' + multiple * 40 + '" style="position: relative;top: ' + multiple * 10 + 'px;margin-right: ' + multiple * 10 + 'px;" src="http://img.17u.com/com/img/public/community/LYloadicon.png" />';
    

    //参数
    var defaultOptions = {
        thatpoint: "",
        pageindex: 1,//起始页
        totalCount: 0,//总页数
        maxmove: 140,
        movediv: null,
        showloadt: false,
        islastpage: false,
        nowisloading: false,
        showloadb: false,
        showpreload: false,
        shownextload: false,
        precallback: function () { window.location.href = window.location.href; },
        nextcallback: function () { },
        starty: 0,//起始触摸点y的位置
        mpage: null,
        setmultiple:null,
        _restore: function () { },
        loadhtml: {
            drop_down: loadlogo + "下拉即可刷新",
            loosenu: loadlogo + "松手即可更新",
            Is_refreshing: onloadlogo + "努力加载中",
            loosend: "松开加载...",
            load_more: "加载更多...",
            Is_loading: "正在加载...",
            No_more: "亲，没有更多了哦~"
        }
    }

    var refreshthis;

    function refresh($this, options) {
        refreshthis = this;
        refreshthis.init.call($this, $.extend(defaultOptions, options));
    }

    function clear($this) {
        refreshthis.clear.call($this);
    }

    refresh.prototype = {
        init: function (o) {
            if (o.setmultiple != null)
            {
                multiple = o.setmultiple;
            }
            var $mov = this,
                 $premove = o.movediv == null ? $mov : o.movediv,
                 $maxmove = (typeof o.maxmove == "number" ? o.maxmove : 140) * multiple,
                 precallback = typeof o.precallback == "function" ? o.precallback : function () { },
                 nextcallback = typeof o.nextcallback == "function" ? o.nextcallback : function () { },
                 $win = $(win),
                 isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
                 hasTouch = 'ontouchstart' in window && !isTouchPad,
                 START_EV = hasTouch ? 'touchstart' : 'mousedown',
                 MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
                 END_EV = hasTouch ? 'touchend' : 'mouseup',
                 claOne = ".down1", claTwo = ".down2", claThree = ".down3", claFour = ".down4",
                 thatpoint,StopEvent = false;
            $mov.off(START_EV + claTwo).on(START_EV + claTwo, function (e) {
                if ($("#preloader").length == 0) {
                    $premove.append('<div id="preloader" class="clearfix" style="position:absolute;left: 0;top: -' + multiple * 120 + 'px;z-index: 0;color: #999;text-align: center;line-height: ' + multiple * 120 + 'px; height: ' + multiple * 120 + 'px; width: 100%; opacity: 0; font-size: ' + multiple * 24 + 'px;">下拉即可刷新</div>');
                }
                if ($("#nextloader").length == 0) {
                    $mov.parent().append('<div id="nextloader" style="position:relative;left: 0;top: 0px;z-index: 0;color: #999;text-align: center;line-height: ' + multiple * 120 + 'px; height: ' + multiple * 120 + 'px; width: 100%; opacity: 0; font-size: ' + multiple * 24 + 'px;  display:none;">加载更多...</div>');
                }
                var point = hasTouch ? e.touches[0] : e;
                o.showloadt = false;
                o.showloadb = false;
                if (o.showloadb || (o.pageindex <= o.totalCount && $(document).height() - $(document.body).scrollTop() - $(window).height() < 500)) {//这是说明滚动条已经快到了最下面了，这时候自动加载
                    o.showloadb = true;
                    if (o.pageindex >= o.totalCount) {
                        o.islastpage = true;
                    }
                    else {
                        o.islastpage = false;
                    }
                    thatpoint = { pageX: point.pageX, pageY: point.pageY };
                }
                if (o.showloadt || document.body.scrollTop == 0) {//说明这时滚动条在最上方
                    o.showloadt = true;
                    thatpoint = { pageX: point.pageX, pageY: point.pageY };
                }
            }, false).off(MOVE_EV + claTwo).on(MOVE_EV + claTwo, function (e) {
                stopBubble(e);
                var point = hasTouch ? e.touches[0] : e;
                if (o.showloadb && thatpoint != "" && thatpoint.pageY != undefined && point.pageY < thatpoint.pageY) {
                    _shownext_load();
                }
                else if (o.showloadt && thatpoint != "" && thatpoint.pageY != undefined) {
                    if (point.pageY - thatpoint.pageY > 2) {
                        sreturnValue(e);
                    }
                    if (point.pageY - thatpoint.pageY > 50) {
                        _pre_load(point.pageY - thatpoint.pageY - 50);
                    }
                }
                if (!o.showloadt && o.pageindex > o.totalCount) {
                    _shownomore_load();
                }
                if (point.pageY - thatpoint.pageY > 20 || thatpoint.pageY - point.pageY > 20)
                {
                    StopEvent = true;//这里显示是否终止事件的触发
                }
            }, false).off(END_EV + claTwo).on(END_EV + claTwo, function (e) {
                _restore_load();
                if (StopEvent) {
                    StopEvent = false;
                    stopBubble(e);
                    return;
                }
            }, false);

            o._restore = function () {
                'use strict';
                setTimeout(function () {
                    $('#nextloader').css('opacity','0').css('display','none');
                    $('#preloader').css('opacity','0');
                    o.showpreload = false;
                    o.shownextload = false;
                    o.showloadt = false;
                    o.showloadb = false;
                    o.nowisloading = false;
                    $premove.css("-webkit-transform", transforms3d ? "translate3d(0px, 0px, 0px)" : "translateY(0px)");
                    $premove.css("-moz-transform", transforms3d ? "translate3d(0px, 0px, 0px)" : "translateY(0px)");
                    $mov.css("-webkit-transform", transforms3d ? "translate3d(0px, 0px, 0px)" : "translateY(0px)");
                    $mov.css("-moz-transform", transforms3d ? "translate3d(0px, 0px, 0px)" : "translateY(0px)");
                }, 1000);
            }
            var _pre_load = function (translate_y) {
                'use strict';
                translate_y = getmaxy(translate_y);
                var transform = "translate3d(0px, " + translate_y + "px, 0px)";
                //translate_y = o.showpreload ? $('#preloader').height() : translate_y;
                $premove.css("-webkit-transform", transform);
                $premove.css("-moz-transform", transform);
                if (translate_y > 0) {
                    $('#preloader').html(o.loadhtml.drop_down);
                    $('#preloader').css('opacity', '1');
                    $('#nextloader').css('opacity', '0').css('display', 'none');
                    if (translate_y > $('#preloader').height()) {
                        $("#preloader").html(o.loadhtml.loosenu);
                        o.showpreload = true;
                    }
                    else {
                        o.showpreload = false;
                    }
                }
            },
            _next_load = function (translate_y) {
                'use strict';
                translate_y = getmaxy(translate_y);
                //translate_y = o.shownextload ? ($('#nextloader').height() * -1) : translate_y;
                $mov.css("-webkit-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                $mov.css("-moz-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                if (translate_y < 0) {
                    $('#nextloader').html(o.loadhtml.load_more);
                    if (o.islastpage) {
                        $('#nextloader').html(o.loadhtml.No_more);
                    }
                    if ($(".mt50").length > 0) {
                        $('#nextloader').css("top", "-" + $(".mt50").eq(0).css("margin-bottom"));
                    }
                    $('#nextloader').css('opacity', '1').css('display', 'block');
                    if ((translate_y * -1) > 35) {//$('#nextloader').height()
                        o.shownextload = true;
                        $('#nextloader').html(o.loadhtml.loosend);
                        if (o.islastpage) {
                            $('#nextloader').html(o.loadhtml.No_more);
                        }
                    }
                    else {
                        o.shownextload = false;
                    }
                }
            },
            _shownext_load = function () {
                'use strict';
                if (!o.nowisloading) {
                    o.nowisloading = true;
                    o.nextcallback();
                    if ($(".mt50").length > 0) {
                        $('#nextloader').css("top", "-" + $(".mt50").eq(0).css("margin-bottom"));
                    }
                    $('#nextloader').css('opacity', '1').css('display', 'block');
                    $("#nextloader").html(o.loadhtml.Is_loading);
                    if (o.islastpage) {
                        $('#nextloader').html(o.loadhtml.No_more);
                    }
                }
            },
            _shownomore_load = function () {
                'use strict';
                if ($(".mt50").length > 0) {
                    $('#nextloader').css("top", "-" + $(".mt50").eq(0).css("margin-bottom"));
                }
                $('#nextloader').css('opacity', '1').css('display', 'block');
                $('#nextloader').html(o.loadhtml.No_more);
                setTimeout(function () {
                    $('#nextloader').css('opacity', '0').css('display', 'none');
                }, 1000);
            },
            _restore_load = function () {
                'use strict';
                var translate_y = 0;
                if (o.showpreload) {
                    translate_y = $('#preloader').height();
                    o.precallback();
                    $("#preloader").html(o.loadhtml.Is_refreshing);
                    $premove.css("-webkit-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                    $premove.css("-moz-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                }
                else if (o.shownextload) {
                    translate_y = 0;//$('#nextloader').height() * -1;
                    o.nextcallback();
                    $("#nextloader").html(o.loadhtml.Is_loading);
                    if (o.islastpage) {
                        $('#nextloader').html(o.loadhtml.No_more);
                    }
                    $mov.css("-webkit-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                    $mov.css("-moz-transform", transforms3d ? "translate3d(0px, " + translate_y + "px, 0px)" : "translateY(" + translate_y + "px)");
                }
                else {
                    o.showpreload = false;
                    o.shownextload = false;
                    o.showloadt = false;
                    o.showloadb = false;
                    var translates = transforms3d ? "translate3d(0px, 0px, 0px)" : "translateY(" + translate_y + "px)";
                    if ($premove.css("-webkit-transform") != translates || $mov.css("-webkit-transform") != translates)
                    {
                        $premove.css("-webkit-transform", translates);
                        $premove.css("-moz-transform", translates);
                        $mov.css("-webkit-transform", translates);
                        $mov.css("-moz-transform", translates);
                    }
                }
            },
            transforms3d = (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                'use strict';
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),
            transforms = (window.Modernizr && Modernizr.csstransforms === true) || (function () {
                'use strict';
                var div = document.createElement('div').style;
                return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
            })(),
            getmaxy = function (translate_y) {
                if (Math.abs(translate_y) > $maxmove) {
                    translate_y = translate_y > 0 ? $maxmove : -$maxmove;
                }
                return translate_y;
            },
            setTransform = function (el, transform) {
                'use strict';
                var es = el.style;
                es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform;
            },
            //阻止事件冒泡的通用函数
            stopBubble=function (e) {// 如果传入了事件对象，那么就是非ie浏览器
                if (e && e.stopPropagation) {//因此它支持W3C的stopPropagation()方法
                    e.stopPropagation();
                } else {//否则我们使用ie的方法来取消事件冒泡
                    window.event.cancelBubble = true;
                }
            },
            //阻止默认行为
            sreturnValue=function (e) {
                if (e && e.preventDefault) {
                    e.preventDefault();
                } else {
                    window.event.returnValue = false;
                }
            }
        },
        clear: function () {
            var $this = this,
            isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
            hasTouch = 'ontouchstart' in window && !isTouchPad,
            START_EV = hasTouch ? 'touchstart' : 'mousedown',
            MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
            END_EV = hasTouch ? 'touchend' : 'mouseup',
            claOne = ".down1", claTwo = ".down2", claThree = ".down3", claFour = ".down4";
            $this.off(START_EV + claTwo).off(MOVE_EV + claTwo).off(END_EV + claTwo);
        }
    }

    $.extend($.fn, {
        refresh: function (options) {
            return new refresh(this, options)
        },
        clear: function () {
            return new clear(this)
        }
    });

})(window, Zepto);

/*
//调用模板
$("#AA").refresh({
    pageindex:1,
    totalCount:10,
	precallback:function(){	//下拉刷新
    
    },
	nextcallback:function(){//上拉加载下一页
    
    }
});
//清除绑定事件
$("#AA").clear();
*/