/*
每个需要插入的节点都作为一个标签，标签可以有自己的属性
每个组件可以定义自己包含的组件的子节点和属性
render（渲染）:return里是要返回的节点
constructor（构造）:设置state的初始值或者绑定事件
componentDidMount:在渲染后，组件挂载之后执行(组件变为了实际的节点)
在标签节点里可以写函数
 */

//CSS
require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom'

//获取图片相关数据
var imageDatas = require('../data/imageData.json');

//利用自执行函数，将图片名信息转化为图片URL路径信息
//参数：图片数据数组
//返回值：图片URL数组
(function getImageURL(imageDataArr) {
	for (var i = 0, j = imageDataArr.length; i < j; i++) {
		var singleImageData = imageDataArr[i];
		//真实路径
		singleImageData.imageURL = require('../images/' + singleImageData.filename);

		imageDataArr[i] = singleImageData;
	}
	return imageDataArr;
})(imageDatas);

/*获取区间内的一个随机值，用途图片随机定位*/
function getRangeRandom(low, high) {
	return Math.ceil(Math.random() * (high - low) + low);
}
/*获取0-30度之间的正负任意值*/
function get30DegRandom() {
	return (Math.random() > 0.5 ? '' : '-' + Math.ceil(Math.random() * 30));
}

//单幅画的主组件
class ImgFigure extends React.Component {

	/*imgFigures的点击处理函数*/
	handleClick = (e) => {
		this.props.inverse();

		e.stopPropagation();
		e.preventDefault();
	}

	render() {
		var styleObj = {};

		//如果props属性中指定了这张图片的位置，则使用
		if (this.props.arrage.pos) {
			//自定义标签有属性
			styleObj = this.props.arrage.pos;
		}

		//如果图片的旋转角度有值并且不为0，添加角度
		if (this.props.arrage.rotate) {
			['-moz-', '-ms-', '-webkit-', '', ].forEach(function(value) {
				styleObj[value + 'transform'] = 'rotate(' + this.props.arrage.rotate + 'deg)';
			}.bind(this));
		}
		var imgFigureClassName = "img-figure";
		//如果翻转，添加对应类名
		imgFigureClassName += this.props.arrage.isInverse ? ' is-inverse' : '';


		return (
			//img-figure已经定义了绝对定位，利用style来赋值left和top
			<figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
				<img src={this.props.data.imageURL}
				     alt={this.props.data.title}/>
				<figcaption>
					<h2 className="img-title">{this.props.data.title}</h2>
					<div className="img-back" onClick={this.handleClick}>
					<p>
						{this.props.data.desc}
					</p>
					</div>
				</figcaption>
			</figure>
		)
	}
}

//站点基本骨架
class AppComponent extends React.Component {

	constructor(props) {
			super(props)
				//初始定位
				//常量
			this.Constant = {
				centerPos: {
					left: 0,
					right: 0
				},
				hPosRange: { //水平方向取值范围
					//左分区x的取值范围
					leftSecX: [0, 0],
					//右分区x的取值范围
					rightSecX: [0, 0],
					//水平方向y的取值范围
					y: [0, 0]
				},
				vPosRange: { //垂直方向取值范围
					//垂直方向x的取值范围
					x: [0, 0],
					//上分区
					topY: [0, 0]
				}
			};
			//state初始化
			//state变化，视图会重新渲染
			this.state = {
				//对象里存的是图片位置
				imgsArrageArr: [
					// 	pos:{
					// 		left:'0',
					// 		top:'0'
					// },
					// rotate:0,   //旋转角度
					// isInverse:false   //图片正面
				]
			};
		}
		//组件加载以后，为每张图计算其位置的范围
		//初始化
	componentDidMount() {

			//首先拿到舞台的大小
			//stage是标签
			//这里获取refs的节点
			var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
				stageW = stageDOM.scrollWidth,
				stageH = stageDOM.scrollHeight,
				halfStageW = Math.ceil(stageW / 2),
				halfStageH = Math.ceil(stageH / 2);

			//拿到一个imageFigure的大小
			//获取图片节点
			var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
				imgW = imgFigureDOM.scrollWidth,
				imgH = imgFigureDOM.scrollHeight,
				halfImgW = Math.ceil(imgW / 2),
				halfImgH = Math.ceil(imgH / 2);

			//中间图片的定位
			this.Constant.centerPos = {
				left: halfStageW - halfImgH,
				top: halfStageH - halfImgW
			}

			//计算左侧，右侧区域图片排布位置的取值范围
			this.Constant.hPosRange.leftSecX[0] = -halfImgW;
			this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

			this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
			this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
			this.Constant.hPosRange.y[0] = -halfImgH;
			this.Constant.hPosRange.y[1] = stageH - halfImgH;

			//计算上册区域图片排布位置的取值范围
			this.Constant.vPosRange.topY[0] = -halfImgH;
			this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
			this.Constant.vPosRange.x[0] = halfStageW - imgW;
			this.Constant.vPosRange.x[1] = halfStageW;

			//重新排列，并选择中心图片
			this.rearrange(0);
		}
		/*
			翻转图片
			@param index 输入当前被执行inverse操作的图片低音的图片信息数组的index值
			@return{Function}这是一个闭包函数，其内return一个真正被执行的函数
			 */
	inverse(index) {
		return function() {
			var imgsArrageArr = this.state.imgsArrageArr;

			imgsArrageArr[index].isInverse = !imgsArrageArr[index].isInverse;
			this.setState({
				imgsArrageArr: imgsArrageArr
			});
		}.bind(this);
	}

	/*
	 *重新布局所有图片
	 *@param centerIndex 指定居中排布那个图片
	 */
	rearrange(centerIndex) {
			//定义变量并赋值
			var imgsArrageArr = this.state.imgsArrageArr,
				//定位
				Constant = this.Constant,
				//中心位置
				centerPos = Constant.centerPos,
				//水平位置
				hPosRange = Constant.hPosRange,
				//垂直位置
				vPosRange = Constant.vPosRange,
				//水平位置的左取值范围
				hPosRangeLeftSecX = hPosRange.leftSecX,
				//水平位置的右取值范围
				hPosRangeRightSecX = hPosRange.rightSecX,
				//水平位置的y取值范围[0,0]
				hPosRangeY = hPosRange.y,
				//垂直位置的Y取值范围
				vPosRangeTopY = vPosRange.topY,
				//垂直位置x的取值范围
				vPosRangeX = vPosRange.x,

				//存储在上侧区域的图片信息
				imgsArrageTopArr = [],
				topImgNum = Math.ceil(Math.random() * 2), //取一个或不取[0,2)
				topImgSpliceIndex = 0,
				//存储居中图片的状态信息，把居中图片从图片数组中取出
				imgsArrageCenterArr = imgsArrageArr.splice(centerIndex, 1);

			//首先居中，centerIndex的图片
			imgsArrageCenterArr[0].pos = centerPos;
			//居中的centerIndex的图片不需要旋转
			imgsArrageCenterArr[0].rotate = 0;


			//取出可能的索引号，删除了居中图片
			topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrageArr.length - topImgNum));
			//取出要布局在上侧的图片的状态信息
			imgsArrageTopArr = imgsArrageArr.splice(topImgSpliceIndex, topImgNum);

			//布局位于上侧的图片
			//数组没有值，就不会进入函数
			imgsArrageTopArr.forEach(function(value, index) {
				imgsArrageTopArr[index] = {
					pos: {
						//给取值定区间
						top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]), //[0,0]
						left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
					},
					rotate: get30DegRandom(),
					isInverse: false
				}
			})

			//布局左右两侧的图片
			for (var i = 0, j = imgsArrageArr.length, k = j / 2; i < j; i++) {
				var hPosRangeLORX = null;

				//前半部分布局左边，右半部分布局右边
				if (i < k) {
					hPosRangeLORX = hPosRangeLeftSecX;
				} else {
					hPosRangeLORX = hPosRangeRightSecX;
				}

				imgsArrageArr[i] = {
					pos: {
						top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
						left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
					},
					rotate: get30DegRandom(),
					isInverse: false
				}
			}

			//将填充上半区域的值填充回去
			if (imgsArrageTopArr && imgsArrageTopArr[0]) {
				imgsArrageArr.splice(topImgSpliceIndex, 0, imgsArrageTopArr[0]);
			}
			//将填充中间区域的值填充回去
			imgsArrageArr.splice(centerIndex, 0, imgsArrageCenterArr[0]);

			//重新渲染
			this.setState({
				imgsArrageArr: imgsArrageArr
			});
		}
		/*利用rearrange函数，居中对应index的图片*/

	render() {

		//控制组件
		var controllerUnits = [],
			//保存图片信息
			imgFigures = [];

		imageDatas.forEach(function(value, index) {

			//如果没有这个状态对象，就初始化，定位到左上角
			if (!this.state.imgsArrageArr[index]) {
				this.state.imgsArrageArr[index] = {
					pos: {
						left: 0,
						top: 0
					},
					rotate: 0,
					isInverse: false
				};
			}
			//将单个图片组件存入数组
			//{"imgFigure"+index}生成每个图片的索引
			//绑定react compontent到函数中
			//标签可以是对象，在其他地方可以获得标签对象，并调用其中的属性
			//调用封装的函数没有什么两样，同样通过props的方式
			imgFigures.push(<ImgFigure data={value} ref={"imgFigure"+index} arrage={this.state.imgsArrageArr[index]} inverse={this.inverse(index)}/>)
		}.bind(this));


		return (
			<section className="stage" ref="stage">
				<section className="img-sec">
				{imgFigures}
				</section>
				<nav className="controller-nav">
				{controllerUnits}
				</nav>
			</section>
		);
	}
}

AppComponent.defaultProps = {};

export default AppComponent;