/*
KU Color Picker
Version: 0.1.1
URL : https://github.com/walidku/ku-color-picker/
*/
jQuery(function ($) {

	$.fn.outerHTML = function () {
		return $('<div />').append(this.eq(0).clone()).html();
	};

	$.fn.kuColorPicker = function () {
		$(this).each(function () {
			var inputField = $(this);
			inputField.removeClass('ku-color-picker-input').addClass('color-input');
			inputField.css({
				'width': '100%',
				'height': '40px',
				'padding': '0 10px',
				'border': '1px solid #ccc',
				'box-shadow': 'none',
				'color': '#555',
				'font': '16px sans-serif',
				'text-align': 'center'
			});
			var inputFieldHtml = inputField.outerHTML(),
				selectText = inputField.attr('data-select-text'),
				colorDetails = {
					uniqueColor: 'rgb(255, 0, 0)',
					whitePercent: 0,
					blackPercent: 0,
					opacity: 1
				},
				colorWithoutOpacity = colorDetails.uniqueColor;

			if ( colorValues(inputField.val()) ) {
				colorDetails = colorParser( colorValues(inputField.val()) );
				var storedColorValues = colorValues(inputField.val());
				colorWithoutOpacity = 'rgb('+ storedColorValues[0] +','+ storedColorValues[1] +','+ storedColorValues[2] +')';
			}

			var colorsLineBallPosition = kuGetColorPositionInColorsLine( colorValues(colorDetails.uniqueColor) );
			if ( colorsLineBallPosition.left == 0 ) {
				colorsLineBallPosition.left = 100;
			}

			var pickerArea = '' +
			'<div class="ku-color-picker">' +

				'<span class="preview-color">' +
					'<span class="color"><span style="background-color:' + inputField.val() + ';"></span></span>' +
					'<span class="select-text">';
					if ( selectText ) {
						pickerArea += selectText;
					} else {
						pickerArea += 'Select Color';
					}
					pickerArea += '</span>' +
				'</span>' +

				'<div class="container">' +
					inputFieldHtml +
					'<div class="pick-color">' +
						'<div class="color-square">' +
							'<span class="unique-color" style="background-color:' + colorDetails.uniqueColor + ';"></span>' +
							'<span class="black"></span>' +
							'<span class="white"></span>' +
							'<span class="color-selecter" style="background-color:' + colorWithoutOpacity + ';top:' + colorDetails.blackPercent + '%;left:' + (100 - colorDetails.whitePercent) + '%;"></span>' +
						'</div>' +
						'<div class="colors-line">' +
							'<span class="color-selecter" style="background-color:' + colorDetails.uniqueColor + ';left:' + colorsLineBallPosition.left + '%;"></span>' +
						'</div>' +
						'<div class="opacity-line">' +
							'<span class="color" style="background:linear-gradient(to right, transparent 0%, ' + colorWithoutOpacity + ' 100%);"></span>' +
							'<span class="opacity-selecter" style="left:' + colorDetails.opacity * 100 + '%;" data-opacity-value="' + Math.floor(colorDetails.opacity * 100) + '"></span>' +
						'</div>' +
						'</div>' +
				'</div>' +

			'</div>';
			inputField.replaceWith(pickerArea);
			draggableSelecterBall();
		});
	};

	$('.ku-color-picker-input').kuColorPicker();

	$(document).ajaxComplete(function () {
		$('.ku-color-input').kuColorPicker();
	});

	$('body').on('keyup', '.ku-color-picker .container .color-input', function () {
		var colorInput = $(this).val();
		$(this).parents('.ku-color-picker').find('.preview-color .color span').css({'background-color': colorInput});
	});

	$.fn.kuPickColorFromColorArea = function (ui, opacity) {
		var selecterBall = $(this),
			colorPicker = selecterBall.parents('.ku-color-picker'),
			opacityLine = colorPicker.find('.container .pick-color .opacity-line'),
			colorSquare = {width: colorPicker.find('.color-square').innerWidth(), height: colorPicker.find('.color-square').innerHeight()},
			positionPercent = {top: ((ui.position.top / colorSquare.height) * 100), left: ((ui.position.left / colorSquare.width) * 100)};
		var rgb = {
			white: colorValues('white'),
			black: colorValues('black'),
			uniqueColor: colorValues( colorPicker.find('.container .unique-color').css('background-color') )
		};
		var uniqueColorPercent = positionPercent.left / 100,
			whitePercent = (100 - positionPercent.left) / 100,
			blackPercent = positionPercent.top / 100;
		var finalColor = colorMixer(rgb.uniqueColor, rgb.white, uniqueColorPercent);
		finalColor = colorMixer(rgb.black, colorValues(finalColor), blackPercent);

		if ( !$(this).parents('.opacity-line').hasClass('opacity-line') ) {
			selecterBall.css('background-color', finalColor);
			colorPicker.find('.container .opacity-line .color').css('background', 'linear-gradient(to right, transparent 0%, ' + finalColor + ' 100%)');
		}

		var opacity = opacityLine.find('.opacity-selecter').kuGetOpacityValue();
		finalColor = kuAddAlphaToColor(finalColor, opacity);

		colorPicker.find('.preview-color .color>span').css('background-color', finalColor);
		colorPicker.find('input').val(finalColor);
	};

	$.fn.kuPickColorFromColorsLine = function (ui) {
		var selecterBall = $(this),
			colorPicker = selecterBall.parents('.ku-color-picker'),
			colorSquare = {width: colorPicker.find('.color-square').innerWidth(), height: colorPicker.find('.color-square').innerHeight()},
			colorLine = {width: colorPicker.find('.colors-line').innerWidth(), height: colorPicker.find('.colors-line').innerHeight()},
			positionPercent = {top: ((ui.position.top / colorLine.height) * 100), left: ((ui.position.left / colorLine.width) * 100)};
		var rgb = {
				white: colorValues('white'),
				black: colorValues('black'),
				uniqueColor: colorValues( colorPicker.find('.container .unique-color').css('background-color') )
			},
			uniqueColor = kuGetColorFromColorsLine(positionPercent);

		selecterBall.css('background-color', uniqueColor);
		colorPicker.find('.container .color-square .unique-color').css('background-color', uniqueColor);

		ui = {
			position: {
				left: colorPicker.find('.container .color-square .color-selecter').offset().left - colorPicker.find('.container .color-square').offset().left + 10,
				top: colorPicker.find('.container .color-square .color-selecter').offset().top - colorPicker.find('.container .color-square').offset().top + 10
			}
		};

		colorPicker.find('.container .color-square .color-selecter').kuPickColorFromColorArea(ui);
	};

	function kuGetColorFromColorsLine(positionPercent) {
		var range = [],
		rightColor = '',
		leftColor = '',
		amountToMix = 0.5;

		if ( 0 <= positionPercent.left && positionPercent.left <= 17 ) {
			leftColor = 'rgb(255, 0, 255)';
			rightColor = 'rgb(255, 0, 0)';
			range = [0, 17];
		} else if ( 17 <= positionPercent.left && positionPercent.left <= 34 ) {
			leftColor = 'rgb(0, 0, 255)';
			rightColor = 'rgb(255, 0, 255)';
			range = [17, 34];
		} else if ( 34 <= positionPercent.left && positionPercent.left <= 50 ) {
			leftColor = 'rgb(0, 255, 255)';
			rightColor = 'rgb(0, 0, 255)';
			range = [34, 50];
		} else if ( 50 <= positionPercent.left && positionPercent.left <= 67 ) {
			leftColor = 'rgb(0, 255, 0)';
			rightColor = 'rgb(0, 255, 255)';
			range = [50, 67];
		} else if ( 67 <= positionPercent.left && positionPercent.left <= 84 ) {
			leftColor = 'rgb(255, 255, 0)';
			rightColor = 'rgb(0, 255, 0)';
			range = [67, 84];
		} else if ( 84 <= positionPercent.left && positionPercent.left <= 100 ) {
			leftColor = 'rgb(255, 0, 0)';
			rightColor = 'rgb(255, 255, 0)';
			range = [84, 100];
		}

		amountToMix = (positionPercent.left - range[0]) / (range[1] - range[0]);
		var uniqueColor = colorMixer( colorValues(leftColor), colorValues(rightColor), amountToMix );

		return uniqueColor;

	}

	function kuGetColorPositionInColorsLine(colorValues) {

		var position = {left: 0},
			leftColor = [],
			rightColor = [],
			range = [],
			n = 0;

		if ( colorValues[0] == 255 && colorValues[1] == 0 && 0 <= colorValues[2] <= 255 ) {
			leftColor = [255, 0, 0];
			rightColor = [255, 0, 255];
			range = [0, 17];
			n = 2;
		} else if ( 0 <= colorValues[0] <= 255 && colorValues[1] == 0 && colorValues[2] == 255 ) {
			leftColor = [255, 0, 255];
			rightColor = [0, 0, 255];
			range = [17, 34];
			n = 0;
		} else if ( colorValues[0] == 0 && 0 <= colorValues[1] <= 255 && colorValues[2] == 255 ) {
			leftColor = [0, 0, 255];
			rightColor = [0, 255, 255];
			range = [34, 50];
			n = 1;
		} else if ( colorValues[0] == 0 && colorValues[1] == 255 && 0 <= colorValues[2] <= 255 ) {
			leftColor = [0, 255, 255];
			rightColor = [0, 255, 0];
			range = [50, 67];
			n = 2;
		} else if ( 0 <= colorValues[0] <= 255 && colorValues[1] == 255 && colorValues[2] == 0 ) {
			leftColor = [0, 255, 0];
			rightColor = [255, 255, 0];
			range = [67, 84];
			n = 0;
		} else if ( colorValues[0] == 255 && 0 <= colorValues[1] <= 255 && colorValues[2] == 0 ) {
			leftColor = [255, 255, 0];
			rightColor = [255, 0, 0];
			range = [84, 100];
			n = 1;
		}

		if ( rightColor[ n ] < leftColor[ n ] ) {
			position.left = range[0] + ( (100 - ( colorValues[ n ] / 255 * 100 )) * (range[1] - range[0]) / 100 );
		} else {
			position.left = range[0] + ( ( colorValues[ n ] / 255 * 100 ) * (range[1] - range[0]) / 100 );
		}

		return position;

	}

	// Parse color: Get black & white percent, unique color and opacity percent
	function colorParser(colorValues) {
		var originalColorValues = colorValues,
			colorOpacity = colorValues[3],
			uniqueColor = '',
			colorDetails = {},
			rgbValues = {
				white: [255, 255, 255],
				black: [0, 0, 0]
			};
		colorValues.splice(3, 1);

		var colorMinVal = Math.min(...colorValues),
			colorMaxVal = Math.max(...colorValues);

		colorDetails.opacity = colorOpacity;

		colorDetails.blackPercent = colorMaxVal / 255;
		if ( colorDetails.blackPercent != 0 ) {
			for ( var i = 0; i <= 2; i++ ) {
				colorValues[ i ] = (colorValues[ i ] - rgbValues.black[ i ] * (1 - colorDetails.blackPercent) ) / colorDetails.blackPercent;
			}
		} else {
			colorValues = [255, 0, 0]; // Red as unique color
		}

		colorMinVal = Math.min(...colorValues);
		colorMaxVal = Math.max(...colorValues);

		colorDetails.whitePercent = 1 - colorMinVal / 255;
		if ( colorDetails.whitePercent != 0 ) {
			for ( var i = 0; i <= 2; i++ ) {
				colorValues[ i ] = Math.round( (colorValues[ i ] - rgbValues.white[ i ] * (1 - colorDetails.whitePercent) ) / colorDetails.whitePercent );
			}
		} else {
			colorValues = [255, 0, 0]; // Red as unique color
		}

		colorDetails.uniqueColor = 'rgb(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ')';

		if ( isNaN(colorDetails.whitePercent) ) {
			colorDetails.whitePercent = 0;
		}

		colorDetails.blackPercent = 100 - (colorDetails.blackPercent * 100);
		colorDetails.whitePercent = 100 - (colorDetails.whitePercent * 100);

		return colorDetails;

	}

	// Get color rgba values from any color format
	function colorValues(color) {
		if (!color) {
			return;
		}
		if (color.toLowerCase() === 'transparent') {
			return [0, 0, 0, 0];
		}
		if (color[0] === '#') {
			if (color.length < 7) {
				// convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
				color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
			}
			return [parseInt(color.substr(1, 2), 16),
				parseInt(color.substr(3, 2), 16),
				parseInt(color.substr(5, 2), 16),
				color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
		}
		if (color.indexOf('rgb') === -1) {
			// convert named colors
			var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
			var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
			temp_elem.style.color = flag;
			if (temp_elem.style.color !== flag) {
				return; // color set failed - some monstrous css rule is probably taking over the color of our object
			}
			temp_elem.style.color = color;
			if (temp_elem.style.color === flag || temp_elem.style.color === '') {
				return; // color parse failed
			}
			color = getComputedStyle(temp_elem).color;
			document.body.removeChild(temp_elem);
		}
		if (color.indexOf('rgb') === 0) {
			if (color.indexOf('rgba') === -1) {
				color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
			}
			return color.match(/[\.\d]+/g).map(function (a) {
				return +a;
			});
		}
	}

	/*
	* Add alpha to color values
	*/
	function kuAddAlphaToColor(color, opacity) {
		var rgb = colorValues(color);
		if ( opacity == 1 ) {
			color = '#' + kuComponentToHex(rgb[0]) + kuComponentToHex(rgb[1]) + kuComponentToHex(rgb[2]);
		} else {
			color = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + opacity + ')';
		}
		return color;
	}

	function kuComponentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? '0' + hex : hex;
	}

	$.fn.kuGetOpacityValue = function (percent) {
		var colorPicker = $(this).parents('.ku-color-picker'),
			opacityLine = $(this).parents('.container .pick-color .opacity-line'),
			opacityLineWidth = opacityLine.innerWidth(),
			opacitySelecterLeft = opacityLine.find('.opacity-selecter').offset().left - opacityLine.offset().left + 15,
			opacityValue = Math.floor((opacitySelecterLeft/opacityLineWidth) * 100);
		if ( percent == 'percent' ) {
			return opacityValue;
		} else {
			return opacityValue / 100;
		}
	};

	$.fn.kuAddOpacityToColor = function () {
		// Add opacity value to color
		var colorPicker = $(this).parents('.ku-color-picker'),
			opacityValue = $(this).kuGetOpacityValue();

		var colorAreaSelecterUI = {
				position: {
					left: colorPicker.find('.container .color-square .color-selecter').offset().left - colorPicker.find('.container .color-square').offset().left + 10,
					top: colorPicker.find('.container .color-square .color-selecter').offset().top - colorPicker.find('.container .color-square').offset().top + 10
				}
			};
		colorPicker.find('.container .color-square .color-selecter').kuPickColorFromColorArea(colorAreaSelecterUI, opacityValue);
		$(this).attr( 'data-opacity-value', $(this).kuGetOpacityValue('percent') );
	};

	// colorChannelA and colorChannelB are ints ranging from 0 to 255
	function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
		var channelA = colorChannelA * amountToMix;
		var channelB = colorChannelB * (1 - amountToMix);
		return parseInt(channelA + channelB);
	}

	// rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
	function colorMixer(rgbA, rgbB, amountToMix) {
		var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix),
			g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix),
			b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	function draggableSelecterBall() {
		$('.ku-color-picker .container .color-selecter, .ku-color-picker .container .opacity-line .opacity-selecter').draggable({
			drag: function (event, ui) {

				var selecterBall = $(this);

				if ( selecterBall.parents('.ku-color-picker .container .color-square').length == 1 ) {
					selecterBall.kuPickColorFromColorArea(ui);
				} else if ( selecterBall.parents('.ku-color-picker .container .colors-line').length == 1 ) {
					selecterBall.kuPickColorFromColorsLine(ui);
				} else {
				   	selecterBall.kuAddOpacityToColor();
				}

			},
			containment: 'parent'
		});
	}

	draggableSelecterBall();

	$('body').on('click', '.ku-color-picker .container .color-square, .ku-color-picker .container .colors-line, .ku-color-picker .container .opacity-line', function (event) {
		var element = $(this),
			colorPicker = element.parents('.ku-color-picker'),
			selecterBall = element.find('.color-selecter'),
			xPos = Math.round(event.pageX - element.offset().left),
			yPos = Math.round(event.pageY - element.offset().top);

		if ( element.hasClass('opacity-line') ) {
			selecterBall = element.find('.opacity-selecter');
		}

		if ( element.hasClass('colors-line') || element.hasClass('opacity-line') ) {
			yPos = '';
		}

		selecterBall.css({'left': xPos, 'top': yPos});
		var ui = {position: {left: xPos, top: yPos}};

		if ( element.hasClass('color-square') ) {
			selecterBall.kuPickColorFromColorArea(ui);
		} else if ( element.hasClass('colors-line') ) {
			selecterBall.kuPickColorFromColorsLine(ui);
		} else {
			var opacityValue = Math.floor( (xPos / element.innerWidth()) * 100 );
			selecterBall.attr('data-opacity-value', opacityValue);
			selecterBall.kuAddOpacityToColor();
		}
	});

	$('body').on('click', '.ku-color-picker .preview-color', function () {
		var colorPicker = $(this).parents('.ku-color-picker');
		if ( colorPicker.hasClass('open') === false ) {
			$('.ku-color-picker').removeClass('open');
			colorPicker.addClass('open');
		} else {
			$('.ku-color-picker').removeClass('open');
			colorPicker.removeClass('open');
		}
	});

	$('*').on('click', function(e) {
		var pickerContainer = $('.ku-color-picker');

		if( e.target.className != pickerContainer.attr('class') && ! pickerContainer.has(e.target).length ) {
			pickerContainer.removeClass('open');
		}
	});

});
