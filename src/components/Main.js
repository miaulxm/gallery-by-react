require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';


var imageDatas = require('../data/imageData.json');

function getImageURL(imageDataArr) {
	for (var i = 0, j = imageDataArr.length; i < j; i++) {
		var singleImageData = imageDataArr[i];
		singleImageData.ImageURL = require('../images/' + singleImageData.filename);

		imageDataArr[i] = singleImageData;
	}
	return imageDataArr;
}
imageDatas = getImageURL(imageDatas);

class AppComponent extends React.Component {
	render() {
		return (
			<section className="stage">
				<section className="img-sec"></section>
				<nav className="controller-nav"></nav>
			</section>
		);
	}
}

AppComponent.defaultProps = {};

export default AppComponent;