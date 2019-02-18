/*!
 * Wyde Ninja jqplot Module override
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license<
 *
 */

 /**
	Line used in data
 */ 
var DataTypeLineNumber = 0;
var DataNameLineNumber = 1;
var BeginingDataLineNumber = 2;

/** 
 * GetContractColors : return the colors used for contract
 * return : a string as a color 
 */ 
function GetContractColors()
{
	if ( window.myContractColor == undefined )
		window.myContractColor = [];
	
	return window.myContractColor
};

/** 
 * GetStandardColor : return a color for a integer
 * return : a string as a color 
 */ 
GetStandardColor = function(i) {
	var myColors = GetContractColors();

	var Colors 		= ['#ff8599','#5CB3FF','#ffbf87','#c987ff','#87FFAD','#FFFF86','#B67437','#ffe387','#c9ff87','#ffca1c','#00bfff','#adff2f','#cd5c5c','#ff6347','#ff1493','#9370db','#778899','#98fb98'];
	var ColorsSize 	= Colors.length;
	return Colors[i%ColorsSize];
};

/** 
 * GetStringColor : return a color for a string
 * return : a string as a color 
 */ 
GetContractColor = function(s) {
	var Colors 	= GetContractColors()
	var Size	= 0;
	
	for ( var key in Colors )
			Size++;
	
	if ( Colors[s] == undefined )
		Colors[s] = GetStandardColor(Size);
	
	return Colors[s];
};

/** 
 * AddSlider : Display a slider or replace it
 * Config["slider"] = ["Where begin the display","position from the beggining","number of result by page","ID used to display chart"]
 */ 
AddSlider = function(ChartSelectorId,ConfigSelectorId,OrderedData) {
	var config = GetDataFromSelector(ConfigSelectorId);
	if ( config != undefined && config['Slider'] != undefined && OrderedData != undefined && OrderedData.length > 0 ) {
		var SliderName 		= config['Slider'];
		var SliderNameInner = config['Slider'][3]+"Inner";
			
		//find HTML Tag for displaying Slider
		var SliderID 	= '#'+SliderName[3];
		if ($(SliderID).length > 0) {
			
			//get number of screens
			var OrderedDataDepth = OrderedData[0].length;
			var NumberOfScreens = Math.ceil(OrderedDataDepth / SliderName[2]);
			
			//Slider usefull only if screens are multiples
			if ( NumberOfScreens > 1 ) {
			
				//get slider position
				var SliderPos 	= SliderName[1];
				if ( SliderName[0] == "cEnd")
					SliderPos = NumberOfScreens - SliderName[1];
				
				//set HTML
				var HtmlSrt = '';
				HtmlSrt += '<div id="'+SliderNameInner+'" class="slider min(1) max(' + NumberOfScreens + ') step(1) value(' + SliderPos + ')">';
				HtmlSrt += '</div>';
				
				//load HTML
				$(SliderID).html(HtmlSrt).EvalClass();
				
				//Set slider properties
				SetSliderProperties(ChartSelectorId,ConfigSelectorId,config['Slider'][3]);
				
				//What to do when slider current position change
				if ($('#'+SliderNameInner).length > 0 ) {
					
					//link a function when the cursor position on the slider changed
					$('#'+SliderNameInner).bind(
						'slide', 														//event
						{chId:ChartSelectorId,coId:ConfigSelectorId,nbScreens:NumberOfScreens}, //const data
						function(event,ui) {											//function
						
							//Edit current config 
							var Config = GetDataFromSelector(event.data.coId);
							if (Config['Slider'][0] == "cEnd")
								Config['Slider'][1] = event.data.nbScreens - ui.value;
							else
								Config['Slider'][1] = ui.value -1;
							
							//Insert new config in html tag
							$(event.data.coId).empty();
							$(event.data.coId).html('\n' + JSON.stringify(Config) + '\n');

							//Refresh chart
							if ($(event.data.chId).length > 0 ) {
								$(event.data.chId).empty();
								$(event.data.chId).EvalClass();
							}

							//Cursor New Position
							var NewPos;
							if (Config['Slider'][0] == "cEnd")
								NewPos = event.data.nbScreens - ui.value;
							else
								NewPos = ui.value -1;
							if ( config != undefined && config['Slider'] != undefined) {
								SetSliderCursorPosition('#'+SliderNameInner,config['Slider'][0],NewPos);
							}
					});
				}
			}
		}
	}
};

/** 
 * AddSliderIfNotDefined : Display a slider if this one is not defined
 * Config["slider"] = ["Where begin the display","position from the beggining","number of result by page","ID used to display chart"]
 */ 
AddSliderIfNotDefined = function(ChartID,ConfigSelectorId,OrderedData) {
var config = GetDataFromSelector(ConfigSelectorId);
	if ( config != undefined && config['Slider'] != undefined && OrderedData != undefined) {
		var SliderName 		= config['Slider'];
		var SliderNameInner = config['Slider'][3]+"Inner";
		
		//display slider only if not defined
		if ( $('#'+SliderNameInner).length == 0) {
			AddSlider(ChartID,ConfigSelectorId,OrderedData);
		}
	}
};



/**
 * SetSliderProperties : give UI properties to the slider bar
 * NB: Config["slider"] = ["Where begin the display","position from the beggining","number of result by page","ID used to display chart"]
 */ 
SetSliderProperties = function(ChartSelectorId,ConfigSelectorId,ChartSliderSelector) {
	var SliderInnerSelector 	= ChartSliderSelector+'Inner';
	var SliderInnerSelectorID 	= '#'+ SliderInnerSelector;
	
	//find slider id
	if ($(this).length > 0) {
		
		//set slider width and margin
		var ChartTag 		= $(ChartSelectorId + ' > canvas.jqplot-series-canvas');
		if ( ChartTag.length > 0 ) {
			var SliderWidth		= ChartTag.attr('width');
			var Width 			= SliderWidth + 'px';
			var marginLeft 		= ChartTag.css('left');
			if ($(SliderInnerSelectorID).length>0) {
			
				//bar width
				$(SliderInnerSelectorID).css('width',Width);
				
				//margin
				$(SliderInnerSelectorID).css('margin-left',marginLeft);
				
				//Cursor width
				var Options = $(SliderInnerSelectorID).ClassArgs();
				var NumberOfScreens = Options['max'];
				var CursorTag 		= $(SliderInnerSelectorID+' > a.ui-slider-handle');
				Width 				= SliderWidth / NumberOfScreens;
				Width				= Width + 'px';
				CursorTag.css('width',Width);
				
				//Cursor New Position
				var config = GetDataFromSelector(ConfigSelectorId);
				if ( config != undefined && config['Slider'] != undefined) {
					SetSliderCursorPosition(SliderInnerSelectorID,config['Slider'][0],config['Slider'][1]);
				}
			}
		}
	}
};

 /** 
 * ModifyForColor : modify option to add the information about the color to use
 * return : array
 */ 
ModifyForColor = function(options,Table) {
	if ( options != undefined ) {
		if ( options['seriesDefaults'] == undefined )
			options['seriesDefaults'] = [];
		
		if ( options['seriesDefaults']['seriesColors'] == undefined )
			options['seriesDefaults']['seriesColors'] = [];
		
		if ( Table[0] != undefined)
			for ( var i = 0; i < Table[0].length; i++ )
				options['seriesDefaults']['seriesColors'][i] = GetContractColor( Table[0][i][0]);
	}
	return options;
};

/**
 * ModifyWithSuperExtend : like extend .however, the sub array are not replaced but completed. 
 * if a final value ( a1:a2 ) is modified, the value is replaced by the new one
 * if a not final value ( {a1:a2} ) is modified, this one is completed.
 * Example : 
 * default = {
 *		a : { 
 *			a1 : a2
 *		},
 *		b : b1,
 *		c : c1
 *	}
 * NewOptions = {
 *		a : { 
 *			a3 : a4
 *		},
 *		b : { 
 *			b1 : b2
 *		},
 *		c : c2
 *	}
 * res = ModifyWithSuperExtend( default , NewOptions )
 * res == {
 *		a : { 
 *			a1 : a2,
 *			a3 : a4
 *		},
 *		b : { 
 *			b1 : b2
 *		},
 *		c : c2
 * }
 */
ModifyWithSuperExtend = function(Cur,Add){
	for ( var keyAdd in Add )
		if ( keyAdd  != undefined ) {
			var keyCurfound = false;
			for ( var keyCur in Cur )
				if ( keyCur  != undefined )
					if ( keyCur == keyAdd){
						if ( typeof(Add[keyAdd]) == 'object' )
							Cur[keyCur] = ModifyWithSuperExtend(Cur[keyCur],Add[keyAdd]);
						else
							Cur[keyCur] = Add[keyAdd];

						keyCurfound = true;
					}
					
			if ( keyCurfound == false )
				if ( typeof(Add[keyAdd]) == 'object' ){
					Cur[keyAdd] = [];
					Cur[keyAdd] = ModifyWithSuperExtend(Cur[keyAdd],Add[keyAdd]);
				} else
					Cur[keyAdd] = Add[keyAdd];
		}
	return Cur;
};

/**
 * RemoveUndefinedValue : DataType can get "undefined" as cell value. This function result is DataType without this cells
 */ 
RemoveUndefinedValue = function(DataType) {
	var NewDataType = [];
	for ( var i = 0 ; i  < DataType.length; i++)
		if ( DataType[i] != 'undefined' )
			NewDataType[NewDataType.length] = DataType[i];
	return NewDataType;
};

 /** 
 * GetDataTypeForEachElement : return the data type chosen in Config
 * Data: the original table of data picked from html
 * Config: the original configuration picked from html
 * return: the original data type picked from html
 * Example : 	if Config['Cross'] = [-1,2,1] and Data[DataTypeLineNumber] = ["Text","Currency","Date","Number"],
 *				return = ["undefined","Date","Currency"]
 *				It mean, nothing is used in column, "Date" used in row and "Currency" in Value
 */ 
GetDataTypeForEachElement  = function(Data,Config) {
	var result = [];
	
	if ( Data != undefined)
		Data = Data[DataTypeLineNumber];
	if ( Config != undefined && Config['Cross'] != undefined) {
		Config = Config['Cross'];
		for (var i = 0; i < Config.length; i++)
			if ( Config[i] != -1 )
				result[result.length] = Data[ Config[i] ];
	}
	
	//as only one choice ( so one dataType only) is considered as aggragating data, the aggregation ( result[1] ) is a number
	if ( result.length == 1 ) 
		result[1] = 'Number';
	return result;
}

 /** 
 * GetDataFromSelector : ConvertData in an html balise.
 * In the span balise, is a table json or a string. this string is a link to another balise html
 * return : array
 */ 
GetDataFromSelector = function(Selector) {
	var JsonData	= $(Selector).html();
	var test		= $('#PageContent').html();
	var Data 		= jQuery.parseJSON(JsonData);
	
	if ( typeof(Data) == 'string' )
		return GetDataFromSelector('#'+Data);
	else
		return Data;
}

$.extend($.ui.slider.prototype, {
	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() )
			return this._valueMin();
		
		if ( val >= this._valueMax() )
			return this._valueMax();
		
		var step 		= ( this.options.step > 0 ) ? this.options.step : 1;
		var newStep 	= ( this._valueMax()-this._valueMin() ) / this._valueMax() * step;
		var alignValue 	= (val - this._valueMin())  / newStep +this._valueMin();
		var valModStep 	= alignValue % step;
		alignValue 		= alignValue - valModStep;

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	}
});

/**
 * SetSliderCursorPosition : position the cursor on the sldier bar
 */ 
SetSliderCursorPosition = function(SliderInnerSelectorID,NavigationFrom,NewPosition) {
	if ($(SliderInnerSelectorID).length>0) {
		//number of screens
		var Options = $(SliderInnerSelectorID).ClassArgs();
		
		//Cursor width
		var CursorTag 		= $(SliderInnerSelectorID+' > a.ui-slider-handle');
		if ( CursorTag.length != 0 ) {
			var BarWidth	= CursorTag.css('width').ParseSize();
			var Pos			= NewPosition;
			
			if ( NavigationFrom == "cEnd" ) 
				Pos = Options['max'] - 1 - NewPosition;
			var dynamicMargin = -BarWidth * Pos / (Options['max'] - 1);
			
			//pixel from border to avoir touch it 
			var pxFromBorder 	= 1; 
			if (Pos == Options['max'] - 1) 
				dynamicMargin -=pxFromBorder +2;
			else if (Pos == 0) 
				dynamicMargin +=pxFromBorder;
				
			CursorTag.css('margin-left',dynamicMargin);
		}
	}
};

/**
 * SetChartsize : Set the chart size, meaning the box that contains the chart, the slider and the cross data ui
 * uses:  Options['width'] and  Options['height']
 */ 
SetChartsize = function(ChartSelectorId,Options){
	var ChartTag= $(ChartSelectorId);
	var ChartWrapperTag= $(ChartSelectorId + 'Wrapper');
	
	if ( ChartTag.length > 0 && ChartWrapperTag.length > 0 && Options != undefined ) {
		if ( Options['width'] != undefined ) {
			ChartTag.css( 'width', Options['width'] );
			ChartWrapperTag.css( 'width', Options['width'] );
		}
		if ( Options['height'] != undefined ){
			var newHeight = Options['height'];
			ChartTag.css( 'height', newHeight );
		}
	}
};

/**
 * SetLegendSize : Set legend width
 * uses:  Options['legend']['maxWidth']
 */ 
SetLegendSize = function(ChartSelectorId,Options){
	var LegendTag = $(ChartSelectorId + ' > table.jqplot-table-legend');
	if ( LegendTag.length > 0 )
		if ( Options != undefined )
			if ( Options['legend'] != undefined )
				if ( Options['legend']['maxWidth'] != undefined )
					var newMaxWidth = Options['legend']['maxWidth']+'px';
					LegendTag.css('maxWidth', newMaxWidth);
};

/**
 * SetUiCrossDataSize : Set UI cross data size
 * uses:  Options['legend']['maxWidth']
 */ 
SetUiCrossDataSize = function(ChartSelectorId,ConfigSelectorId){
	
	// find max numbers of choice
	var MaxLength = 0;
	if ( $(ConfigSelectorId).length > 0 ) {
		var Config = GetDataFromSelector(ConfigSelectorId);
		if ( Config != undefined && Config['UiCrossMap'] != undefined) 
			for ( var i = 0 ; i < Config['UiCrossMap'].length; i++ ) 
				if ( Config['UiCrossMap'][i].length > MaxLength ) 
					MaxLength = Config['UiCrossMap'][i].length;
	}
	
	var UiTag = $(ChartSelectorId + 'Wrapper > div.ChartUi');
	if ( UiTag.length > 0 && MaxLength > 0) {
		var NewHeight = ( 1 + MaxLength) * 20;
		UiTag.css('height', NewHeight + 'px');
	}
};

/**
 * ModifyDataIfEmpty : avoid to get blank chart
 */ 
ModifyDataIfEmpty = function(Data){
	if ( Data.length == 0 ) {
		Data = [];
		Data[0] = [0];
	}
	return Data;
};

/**
 * ModifyDataIfNotEnoughData : avoid chart crashes
 */ 
ModifyDataIfNotEnoughData = function(Data){
	//to display lines, OrderedData[N].length > 1
	for ( var i = 0 ; i < Data.length; i++ ){
		if( Data[i].length < 2)
			Data[i] = [0,0];
	}
	return Data;
};

/**
 * ModifyForTitleOnly : get only the title from options
 */ 
ModifyForTitleOnly = function(Default,Options){
	if ( Options != undefined && Default != undefined)
		if ( Options['title'] != undefined )
			if ( Options['title']['text'] != undefined ) {
				if( Default['title'] == undefined )
					Default['title'] = [];
				if( Default['title']['text'] == undefined )
					Default['title']['text'] = Options['title']['text'];
			}
	return Default;
}