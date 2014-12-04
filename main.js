/**************
 * 创建canvas
 **************/

var width 	= document.documentElement.clientWidth;//屏幕宽度高度
var height 	= document.documentElement.clientHeight;
document.getElementsByTagName('body')[0].innerHTML = '<canvas id="canv" tabindex="0" style="position:absolute;left:0px;top:0px;" width='+width+'px height='+height+'px>请换个浏览器。。</canvas>';
var cv = document.getElementById('canv').getContext('2d');

/************
 * 计算函数
 ************/

var r 	= width * 0.15;
var r2 	= r / 2;
var w2 	= width / 2;
var h2 	= height / 2;
var floor = Math.floor;

var mx, my; //鼠标位置

var buttonList=[];
var charList='';

var bracketsStatus = '(';//括号状态

function div(x, y)
{
	return floor(x / y);
}

var char0 = [[1,9,1,'a'],[1,9,2,'b'],[1,9,3,'c'],[1,9,4,'d'],[1,9,5,'e'],[1,9,6,'f'],[1,9,7,'g'],[1,9,8,'h'],[1,9,9,'i'],
			 [2,9,1,'j'],[2,9,2,'k'],[2,9,3,'l'],[2,9,4,'m'],[2,9,5,'n'],[2,9,6,'o'],[2,9,7,'p'],[2,9,8,'q'],[2,9,9,'r'],
			 [3,9,1,'s'],[3,9,2,'t'],[3,9,3,'u'],[3,9,4,'v'],[3,9,5,'w'],[3,9,6,'x'],[3,9,7,'y'],[3,9,8,'z'],[3,9,9,'sp'],
			 [4,9,1,'.'],[4,9,2,','],[4,9,3,'?'],[4,9,4,':'],[4,9,5,"'"],[4,9,6,'"'],[4,9,7,'-'],[4,9,8,'!'],[4,9,9,'()']];
var char1 = 
		[
			[[1,3,1,'a'], [1,3,2,'b'], [1,3,3,'c'], 
			 [2,3,1,'d'], [2,3,2,'e'], [2,3,3,'f'], 
			 [3,3,1,'g'], [3,3,2,'h'], [3,3,3,'i'], 
			 [4,1,1,'<-']],
			[[1,3,1,'j'], [1,3,2,'k'], [1,3,3,'l'], 
			 [2,3,1,'m'], [2,3,2,'n'], [2,3,3,'o'], 
			 [3,3,1,'p'], [3,3,2,'q'], [3,3,3,'r'], 
			 [4,1,1,'<-']],
			[[1,3,1,'s'], [1,3,2,'t'], [1,3,3,'u'], 
			 [2,3,1,'v'], [2,3,2,'w'], [2,3,3,'x'], 
			 [3,3,1,'y'], [3,3,2,'z'], [3,3,3,'sp'], 
			 [4,1,1,'<-']],
			[[1,3,1,'.'], [1,3,2,','], [1,3,3,'?'], 
			 [2,3,1,':'], [2,3,2,"'"], [2,3,3,'"'], 
			 [3,3,1,'-'], [3,3,2,'!'], [3,3,3,'()'], 
			 [4,1,1,'<-']]
		];
var char2 = 
		[
			[
				[[1,1,1,'a'], [2,1,1,'b'], [3,1,1,'c'], [4,1,1,'<-']],
				[[1,1,1,'d'], [2,1,1,'e'], [3,1,1,'f'], [4,1,1,'<-']],
				[[1,1,1,'g'], [2,1,1,'h'], [3,1,1,'i'], [4,1,1,'<-']],
			],[
				[[1,1,1,'j'], [2,1,1,'k'], [3,1,1,'l'], [4,1,1,'<-']],
				[[1,1,1,'m'], [2,1,1,'n'], [3,1,1,'o'], [4,1,1,'<-']],
				[[1,1,1,'p'], [2,1,1,'q'], [3,1,1,'r'], [4,1,1,'<-']],
			],[
				[[1,1,1,'s'], [2,1,1,'t'], [3,1,1,'u'], [4,1,1,'<-']],
				[[1,1,1,'v'], [2,1,1,'w'], [3,1,1,'x'], [4,1,1,'<-']],
				[[1,1,1,'y'], [2,1,1,'z'], [3,1,1,'sp'], [4,1,1,'<-']],
			],[
				[[1,1,1,'.'], [2,1,1,','], [3,1,1,'?'], [4,1,1,'<-']],
				[[1,1,1,':'], [2,1,1,"'"], [3,1,1,'"'], [4,1,1,'<-']],
				[[1,1,1,'-'], [2,1,1,'!'], [3,1,1,'()'], [4,1,1,'<-']],
			]
		];

function getChars(x)//x: 已发生的按键序列，例如x=[]、x=[1,2]
{
	if (x == undefined) x = [];
	if (!x.length) return char0;
	if (x.length == 1) return char1[x[0] - 1];
	if (x.length == 2) return char2[x[0] - 1][x[1] - 1];
}

function getButton(x, y)//给定点击位置返回按键编号
{
	if (y<0.35*height) return -1;//删除字符
	if (y<h2||y>h2+r||x<w2-2*r||x>w2+2*r) return 0;//不做响应
	x -= w2-2*r;
	x /= r;
	var button = floor(1+x);
	if (button<1||button>4) return 0;
	return button;
}

/*
 * 格子边长: r
 * 半个边长: r2
 * 格子中心点横坐标: w2-r-r2 w2-r2 w2+r2 w2+r+r2
 * 格子左边横坐标: w2-2*r w2-r w2 w2+r
 * 上边纵坐标: h2
 */

/************
 * 绘图函数
 ************/

function drawBG()//画背景
{
	cv.save();
	cv.fillStyle = 'black';
	cv.fillRect(0, 0, width, height);
	cv.restore();
}

function drawRects()//画格子
{
	cv.save();
	cv.strokeStyle='rgba(235,235,235,1)';
	cv.lineWidth=2*r/80;
	cv.strokeRect(w2-2*r,h2,r,r);
	cv.strokeRect(w2-r,  h2,r,r);
	cv.strokeRect(w2,    h2,r,r);
	cv.strokeRect(w2+r,	 h2,r,r);
	cv.restore();
}

function drawChar(x, y, z, s)//画按键字符。参数1: 按键编号(1~4)  参数2: 字符个数(1/3/9)  参数3: 字符位置(1~y)  参数4: 字符串
{
	var offsetx = w2;
	switch (x)
	{
		case 1: offsetx += -2*r; break;
		case 2: offsetx += -r;   break;
		case 3: offsetx += 0;    break;
		case 4: offsetx += +r;   break;
		default: console.log('error');
	}
	var size = 0;
	var offsety = h2; 
	switch (y)
	{
		case 1: size = r*0.6; offsetx += r2; offsety += r2; break;
		case 3: size = r*0.4; offsetx += r / 4 * z; offsety += r2; break;
		case 9: size = r*0.2; offsetx += r / 4 * (1 + (z - 1) % 3); offsety += r / 4 * (1 + div(z - 1, 3)); break;
		default: console.log('error');
	}

	if ((s == 'sp' || s == '()') && y == 3) size *= 0.7;

	offsetx -= s.length * size * 0.25;
	offsety += size * 0.3;

	cv.save();
	cv.font = size + "px Consolas";
	cv.fillStyle = 'rgba(235,235,235,1)';
	cv.fillText(s,offsetx,offsety);
	cv.restore();

	//offsetx、offsety: 中心点位置

}

function drawChars(x)//x: 已发生的按键序列
{
	chars = getChars(x);
	for (var i in chars)
	{
		drawChar(chars[i][0], chars[i][1], chars[i][2], chars[i][3]);
	}
}

function drawCharsTyped()
{
	cv.save();
	cv.font = r * 0.2 + "px Consolas";
	cv.fillStyle = 'rgba(235,235,235,1)';
	cv.fillText(charList, w2-1.95*r, 0.35*height-r*0.05);
	cv.restore();
}

function drawCharsLine()
{
	cv.save();
	cv.strokeStyle='rgba(235,235,235,1)';
	cv.lineWidth=2;
	cv.moveTo(w2-2*r, 0.35*height);
	cv.lineTo(w2+2*r, 0.35*height);
	cv.stroke();
	cv.restore();
}

function drawAll()
{
	drawBG();
	drawRects();
	drawChars(buttonList);
	drawCharsLine();
	drawCharsTyped();
}

drawAll();

/****************
 * 设置事件监听
 ****************/

function typeChar(list)
{
	var c = char2[list[0]-1][list[1]-1][list[2]-1][3];
	if (c=='sp') c = ' ';
	if (c=='()') 
	{
		c = bracketsStatus;
		if (bracketsStatus=='(') 
			bracketsStatus = ')'; 
		else 
			bracketsStatus = '(';
	}
	charList += c;
}

function deleteChar()
{
	if (charList.length)
		charList = charList.substr(0, charList.length - 1);
	drawAll();
}

function callClick(b)
{
	if (b == -1)
	{
		deleteChar();
		return;
	}
	var len = buttonList.length;
	if (b==4 && len) 
		buttonList.pop();
	else if (len == 2)//已经按了两次了 
	{
		buttonList.push(b);
		typeChar(buttonList);
		buttonList = [];
	} 
	else 
		buttonList.push(b);
	drawAll();
}

document.addEventListener('click',function(e)
{
	mx = e.x;
	my = e.y;
	var button = getButton(mx, my);
	if (button) callClick(button);
});

document.addEventListener('keydown',function(e)
{
	var button = 0;
	if (e.keyCode == 77)  button = 1;
	if (e.keyCode == 188) button = 2;
	if (e.keyCode == 190) button = 3;
	if (e.keyCode == 191) button = 4;
	if (e.keyCode == 32)  button = -1;
	if (button) callClick(button);
});
