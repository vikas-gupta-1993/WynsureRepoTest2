/*!
 * Wyde Ninja jqplot options Module override
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license<
 *
 */

/**
 * ParseSize : parse fromat string size in number
 */ 
String.prototype.ParseSize = function() {
	switch ( this.substring(this.length-2,this.length) ) {
		case 'px':
			return parseInt(this.substring(0,this.length-2));
			break;
	}
	return 0;
};

/**
 * parseTypeForParams : transform value in the corresponding type for Params data
 * this function tranlate some jqplot function according keyword
 * example : 'CanvasAxisLabelRenderer' is translated to $.jqplot.CanvasAxisLabelRenderer
 */ 
String.prototype.parseTypeForParams = function() {
	switch(this.substring(0,1).toLowerCase()) {
		case 'c':
			switch(this.toLowerCase()) {
				case 'canvasaxislabelrenderer' : 
					return $.jqplot.CanvasAxisLabelRenderer;
				case 'canvasaxistickrenderer' : 
					return $.jqplot.CanvasAxisTickRenderer;
				case 'categoryaxisrenderer' : 
					return $.jqplot.CategoryAxisRenderer;
			}
			break;
		case 'b':
			if (this.toLowerCase() == 'barrenderer')
				return $.jqplot.BarRenderer;
	}
	var resultat = this.parseType();
	if ( typeof( resultat ) == "object" )
		resultat = resultat.toString();
	return resultat
};

/**
 * ModifyToParseType : translate recursively some word text in options
 */ 
ModifyToParseType = function(Options) {
	for( var cle in Options )
		switch ( typeof(Options[cle]) ) {
			case 'string': 
				Options[cle] = Options[cle].parseTypeForParams();
				break;
			case 'object': 
				ModifyToParseType(Options[cle]);
		}
};

/** 
 * ModifyWithCrossedData : return options configured according what is inside data table
 * default Options and Options from gold are mixed
 * Don't use this function for pie chart
 * return : array
 */ 
ModifyWithCrossedData = function(Options, Table, OptionFromGold ) {
	var NewOptions 			= {};
	var i 					= 0;
	var FindMinValue;
	var FindMaxValue;
	var zeroIsOnAxis = false;
	var TickInterval = -1;
	NewOptions['series'] 	= [];
	
	if ( OptionFromGold['axes'] != undefined ) 
		if ( OptionFromGold['axes']['yaxis'] != undefined ) 
			if ( OptionFromGold['axes']['yaxis']['tickOptions'] != undefined ) {
				if ( OptionFromGold['axes']['yaxis']['tickOptions']['zeroIsOnAxis'] != undefined ) 
					if ( OptionFromGold['axes']['yaxis']['tickOptions']['zeroIsOnAxis'] == true ) 
						zeroIsOnAxis = true;
				if ( OptionFromGold['axes']['yaxis']['tickOptions']['TickInterval'] != undefined ){
					TickInterval = OptionFromGold['axes']['yaxis']['tickOptions']['TickInterval'];
					TickInterval = ModifyToParseType(TickInterval)
				}
			}
			
	for ( var columnLabel in Table ) {
		// series data, used to legend, is used when only one element. 1 element <=> typeof( Table[columnLabel] ) not "object"
		if (typeof( Table[columnLabel] ) == "object") {
			//next lines usefulls only if legend is present! 
			if ( OptionFromGold['legend'] != undefined) {
			//be carrefull , legend can be present but see to false
				if ( OptionFromGold['legend']['show'] == undefined || (OptionFromGold['legend']['show'] != undefined && OptionFromGold['legend']['show'] == true) ) {
					NewOptions['series'][i] 			= {};
					NewOptions['series'][i]['label'] 	= columnLabel;
					NewOptions['series'][i]['color'] 	= GetContractColor(columnLabel);
					i++;
				}
			}
		}
		
		if ( zeroIsOnAxis ) {
			//set min value amount to begin yaxis to 0 if min value > 0
			if ( Table[columnLabel]  == "object") {
				for ( var RowLabel in Table[columnLabel] )
					if ( FindMinValue != undefined) {
						if ( Table[columnLabel][RowLabel] < FindMinValue )
							FindMinValue = Table[columnLabel][RowLabel];
						if ( Table[columnLabel][RowLabel] > FindMaxValue )
							FindMaxValue = Table[columnLabel][RowLabel];
					} else {
						FindMinValue = Table[columnLabel][RowLabel];
						FindMaxValue = Table[columnLabel][RowLabel];
					}
			} else {
				if ( FindMinValue != undefined) {
					if ( Table[columnLabel] < FindMinValue )
						FindMinValue = Table[columnLabel];
				} else
					FindMinValue = Table[columnLabel];
			}
		}
	}
	
	if ( NewOptions['series'].length == 0 ) {
		delete NewOptions['series'];
		//legend is now useless
		delete OptionFromGold['legend'];
	}
	
	if ( zeroIsOnAxis ) {
		if (FindMinValue > 0 || FindMaxValue < 0)
			if (FindMinValue > 0) {
				NewOptions['axes'] = {};
				NewOptions['axes']['yaxis'] = {};
				NewOptions['axes']['yaxis']['min'] = 0;
			}else if (FindMaxValue < 0) {
				NewOptions['axes'] = {};
				NewOptions['axes']['yaxis'] = {};
				NewOptions['axes']['yaxis']['max'] = 0;
			}
	}
	return ModifyWithSuperExtend(Options, NewOptions);
};

/** 
 * ModifyForTicks : return options addind tick name for xaxis.
 * Used when ticks can't be compute by the renderer ( bar chart renderer )
 * return : array
 */ 
ModifyForTicks = function(Options,OrderedData) {
	var size;
	var NewOptions 						= {};
	NewOptions['axes'] 					= [];
	NewOptions['axes']['xaxis'] 			= [];
	NewOptions['axes']['xaxis']['ticks'] 	= [];
	
	var formatTick;
	var formatter;
	if ( Options != undefined)
		if ( Options['axes'] != undefined)
			if ( Options['axes']['xaxis'] != undefined)
				if ( Options['axes']['xaxis']['tickOptions'] != undefined) {
					if ( Options['axes']['xaxis']['tickOptions']['formatString'] != undefined)
						formatTick = Options['axes']['xaxis']['tickOptions']['formatString'];
					if ( Options['axes']['xaxis']['tickOptions']['formatter'] != undefined)
						formatter = Options['axes']['xaxis']['tickOptions']['formatter'];
				}
			
	if ( OrderedData != undefined)
		if ( OrderedData[0] != undefined)
			for ( var j = 0; j < OrderedData[0].length; j++ ) {
				size = NewOptions['axes']['xaxis']['ticks'].length;
				NewOptions['axes']['xaxis']['ticks'][size] = OrderedData[0][j][0];
				
				if ( formatTick != undefined )
					if ( formatter == undefined)
						NewOptions['axes']['xaxis']['ticks'][size] = $.jqplot.DefaultTickFormatter(formatTick , NewOptions['axes']['xaxis']['ticks'][size]);
					else
						NewOptions['axes']['xaxis']['ticks'][size] = formatter(formatTick , NewOptions['axes']['xaxis']['ticks'][size]);
			}
	return ModifyWithSuperExtend(Options, NewOptions);
};

 /** 
 * ModifyForDate : modify option to add the information about the date format ( not used for columns)
 * return : array
 * NB : the date format depend on the current date format used $.lang.DateFormat
 */ 
ModifyForDate = function(options, DataType) { 
	var axe = [];
	var axeName = 'xaxis'; //no date in yaxis
	
	if ( DataType != undefined && DataType.length >= 2 && options != undefined )
		if ( DataType[DataType.length-2] != undefined && DataType[DataType.length-2] == 'Date') {
			axe['axes'] = [];
			axe['axes'][axeName] = [];
			axe['axes'][axeName]['renderer'] = $.jqplot.DateAxisRenderer;
			if ( options['dateGap'] != undefined ) {
				axe['axes'][axeName]['tickOptions'] = [];
				var FormatToUse;
				switch ( options['dateGap']) {
					case 'year':
						FormatToUse = '%Y';
						break;
					case 'month':
						FormatToUse = '%B';
						break;
					case 'day':
						FormatToUse = '%D';
						break;
					case 'year_abr':
						FormatToUse = '%y';
						break;
					case 'month_abr':
						FormatToUse = '%b';
						break;
					case 'month_abr_year':
						if ( $.lang.DateFormat == 'mm/dd/yyyy' )
							FormatToUse = '%b,%Y';
						else
							FormatToUse = '%b %Y';
						break;
					case 'month_abr_year_abr':
						if ( $.lang.DateFormat == 'mm/dd/yyyy' )
							FormatToUse = '%b,%y';
						else
							FormatToUse = '%b %y';
						break;
					case 'day_abr':
						FormatToUse = '%d';
						break;
					default : 
						if ( $.lang.DateFormat == 'mm/dd/yyyy' )
							FormatToUse = '%b %#d,%y';
						else
							FormatToUse = '%#d %b %y';
				}
			
				axe['axes'][axeName]['tickOptions']['formatString'] = FormatToUse
			
				//when ticks manually given
				if( options['axes'] != undefined )
					if( options['axes'][axeName] != undefined )
						if( options['axes'][axeName]['ticks'] != undefined ) 
							if( options['axes'][axeName]['tickOptions'] != undefined && options['axes'][axeName]['tickOptions']['formatString'] != undefined) {
								var tlength =  options['axes'][axeName]['ticks'].length;
								for(var k = 0; k <tlength; k++)
									 options['axes'][axeName]['ticks'][k] = $.jqplot.DateTickFormatter(options['axes'][axeName]['tickOptions']['formatString'] , options['axes'][axeName]['ticks'][k]);
							}
			}
			ModifyWithSuperExtend(options,axe);
		}
	
	return options;
};

/** 
 * ModifyForRenderer : modify option to interprete renderer to use
 * return : array
 * example : if dates are used in axis (DateAxisRenderer), the date format depend on the current date format used $.lang.DateFormat
 */ 
ModifyForRenderer = function(options) {
	var PossibleLocalion = [];//Where the options configuration for date can be found
	
	if ( options['axes'] != undefined ) {
		if ( options['axes']['xaxis'] != undefined )
			PossibleLocalion.push(options['axes']['xaxis']);
		if ( options['axes']['yaxis'] != undefined )
			PossibleLocalion.push(options['axes']['yaxis']);
	}
	if ( options['axesDefault'] != undefined )
		PossibleLocalion.push(options['axesDefault']);

	//for each location
	for ( var i = 0; i < PossibleLocalion.length; i++ )
		if ( PossibleLocalion[i]['renderer'] != undefined) {
			switch ( PossibleLocalion[i]['renderer'] ) {
				case $.jqplot.DateAxisRenderer:
					//translate information for Bar renderer
					if ( options['seriesDefaults'] != undefined )
						if ( options['seriesDefaults']['renderer'] != undefined && options['seriesDefaults']['renderer'] == $.jqplot.BarRenderer) {
							PossibleLocalion[i]['renderer'] = $.jqplot.CategoryAxisRenderer;
							if ( PossibleLocalion[i]['tickOptions'] == undefined )
								PossibleLocalion[i]['tickOptions'] = [];
							PossibleLocalion[i]['tickOptions']['formatter'] = $.jqplot.DateTickFormatter;
						}
					break;
				
			}
		} else {
			//default 
			PossibleLocalion[i]['renderer'] = $.jqplot.CanvasAxisRenderer
			//translate information for Bar renderer
			if ( options['seriesDefaults'] != undefined )
				if ( options['seriesDefaults']['renderer'] != undefined && options['seriesDefaults']['renderer'] == $.jqplot.BarRenderer)
					PossibleLocalion[i]['renderer'] = $.jqplot.CategoryAxisRenderer;
			break;	
			
		} 
	return options;
};

/** 
 * SetCurrencyFormat : set value of  option[Label] and options['formatter'] if needed to display currency on graph axis
 */ 
SetCurrencyFormat = function(Cur, options, Label) {
	if ( Cur != undefined && options != undefined )
		switch ( Cur ) {
			case 'USD':
				if ( $.lang.LanguageCode == 'FR' )
					options[Label] =  '%.2f $';
				else if ( $.lang.LanguageCode = 'EN' )
					options[Label] =  '$%.2f';
				break;
			case 'EUR':
				if ( $.lang.LanguageCode == 'FR' )
					options[Label] = '%.2f &#8364;';
				else if ( $.lang.LanguageCode = 'EN' )
					options[Label] = '&#8364;%.2f';
		}
	return options;
}

/** 
 * ModifyForCurrency : modify option to add information about the currency ( not used for columns)
 * return : array
 * example : if 'EUR' is in options, the format used for currency is <value>�
 */ 
ModifyForCurrency = function(options,DataType,Label) {
	var axe = [];
	var axeName = ['xaxis','yaxis'];
	
	if ( DataType != undefined && DataType.length >= 2 && options != undefined && options['currency'] != undefined) {
		//if DataType.length = 2, i = 0 to 1
		//if DataType.length = 3, i = 1 to 2
		for (var i = 0; i < 2; i++)
			//if DataType.length = 2, DataType.length-2+i = 0 to 1
			//if DataType.length = 3, DataType.length-2+i = 1 to 2
			if ( DataType[DataType.length-2+i] != undefined &&  DataType[DataType.length-2+i] == 'Currency') {
				var key = axeName[i];
				switch(Label) {
					case 'formatString' : 
						axe['axes'] = [];
						axe['axes'][key] = [];
						axe['axes'][key]['tickOptions'] = [];
						axe['axes'][key]['tickOptions'] = SetCurrencyFormat(options['currency'],axe['axes'][key]['tickOptions'], Label);
						break;
					case 'dataLabelFormatString': 
						axe['seriesDefaults'] = [];
						axe['seriesDefaults']['rendererOptions'] = [];
						axe['seriesDefaults']['rendererOptions'] = SetCurrencyFormat(options['currency'],axe['seriesDefaults']['rendererOptions'], Label);
				}
				ModifyWithSuperExtend(options,axe);
			}

		/* Add currency symbol for pie chart with currency*/
		if (options['highlighter'] != undefined)
			if (options['highlighter']['formatString'] != undefined)
				if( options['highlighter']['formatString'] == '%s, %P')
					switch ( options['currency'] ) {
						case 'USD':
							if ( $.lang.LanguageCode == 'FR' )
								options['highlighter']['formatString'] =  '%s: %.2f $';
							else if ( $.lang.LanguageCode = 'EN' )
								options['highlighter']['formatString'] =  '%s: $%.2f';
							break;
						case 'EUR':
							if ( $.lang.LanguageCode == 'FR' )
								options['highlighter']['formatString'] = '%s: %.2f &#8364;';
							else if ( $.lang.LanguageCode = 'EN' )
								options['highlighter']['formatString'] = '%s: &#8364;%.2f';
		}
	}			
	
	return options;
};

$.jqplot.DateTickFormatter = function(format, val) {
        if (!format)
            format = '%Y/%m/%d';
        return $.jsDate.strftime(val, format);
};