/*!
 * Wyde Ninja jqplot Charts Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license<
 *
 */
 
(function($) {

/**
 * ---- For each chart, tree selectors are required:
 * example (HTML): ChartName: <div id="ChartDisplay" class="ChartName(SelectorData, SelectorOptions,SelectorConfig)"></div>
 * 
 * ---- SelectorData: the data table to used for display information : 
 * example (HTML): 
 * <span id="SelectorData">
 * [
 * ["Policy #","Amount"],
 * ["4800000554","400.00"],
 * ["4800000555","400.00"],
 * ["4800000556","585.00"],
 * ["4800000557","400.00"]
 * ]
 * </span>
 *
 * ------SelectorOptions: the options to used for display information
 * example (HTML): 
 * <span id="SelectorOptions">
 * 	{
 * 		"axesDefaults": {
 * 			"labelRenderer": "CanvasAxisLabelRenderer"
 * 		}
 * 	}
 * </span>
 *
 * ------SelectorConfig: the configuration table to used to cross data
 * the "Cross" line is 3 integers corresponding to the columns to use to cross data for chart [Column_ColumnNumber,Row_ColumnNumber,Value_ColumnNumber]
 * the "Slider" line is used to display and update slider : [cBegi
 * Slider[0]:	cBeginning or cEnd : position slider at the beginning or end of the slider 
 * Slider[1]:	current page display
 * Slider[2]:	number of result by page
 * Slider[3]:	slider name
 * the "UiCrossMap" represents var index inside the cross data ui
 * example (HTML): 
 * <span id="SelectorConfig">
 * "Cross":[1,1,0],
 * "Slider":["cBeginning",0,10,"SliderBarChart1"],
 * "UiCrossMap": [
 * [1,2,3,4,5,6,7],
 * [1,2,3,4,5,6,7],
 * [0]]
 * ]]]>
 * </span>
 */ 

$.extend($.fn.classfunc,{
	/**
	 * LineChart : display a line chart with particular options.
	 */ 
	LineChart: function(TableSelector,OptionsSelector,ConfigSelector) {
		var id 					= $(this).attr('id')
		var TableSelectorId 	= '#'+TableSelector;
		var OptionsSelectorId 	= '#'+OptionsSelector;
		var ConfigSelectorId 	= '#'+ConfigSelector;
		//Set default options
		var Default = {
			seriesDefaults: {
				rendererOptions: {
					smooth: true
				}
			},
			grid: {
				background: '#FAF9F9',
				borderColor: '#000000',
				borderWidth: 0.5,
				shadow: true
			},
			highlighter: {
				show : true,
				sizeAdjust : 7.5
			},
			cursor: {
				show : true,
				zoom: true,
				showTooltip : false
			}
		};
		
		var OrderedData = [];
		
		if ($(OptionsSelectorId).length > 0 && $(TableSelectorId).length > 0 & $(ConfigSelectorId).length > 0) {
			
			var OptionsFromSelector	= GetDataFromSelector(OptionsSelectorId);
			var Config 				= GetDataFromSelector(ConfigSelectorId);
			var TableData 			= GetDataFromSelector(TableSelectorId);
			var dataType			= GetDataTypeForEachElement(TableData,Config);
			//Set table
			var CrossedData = ModifyToCrossedData(TableData,Config,dataType);
			OrderedData 	= ModifyToDefaultSeries(CrossedData);
			
			//Set options
			if ( OrderedData.length > 0 ) {
				ModifyToParseType(OptionsFromSelector);
				Default = ModifyWithCrossedData(Default,CrossedData,OptionsFromSelector);
				Default = ModifyWithSuperExtend(Default, OptionsFromSelector);
				if (!(OrderedData.length == 1 && OrderedData[0].length == 1)) //Chart crashes if only one element
					Default = ModifyForDate(Default,dataType)
				Default = ModifyForCurrency(Default,dataType,'formatString')
			}else
				Default = ModifyForTitleOnly(Default,OptionsFromSelector);
			
			OrderedData = ModifyDataIfEmpty(OrderedData);
		}
		
		//before display
		SetChartsize('#'+id,Default);
		
		if ( OrderedData.length>0){
			//Width used for chart is full size if width not defined in parameters
			if (Default['width'] == undefined)
				$('#'+id).width($('#'+id+'Wrapper').width());
			var myPlot = $.jqplot(id, OrderedData, Default);
			$(window).resize(function(){
				//Width used for chart is full size if width not defined in parameters
        		if (Default['width'] == undefined)
					$('#'+id).width($('#'+id+'Wrapper').width());
			    myPlot.replot( { resetAxes: true } );
			});   
		}
			
		
		//after display
		SetLegendSize('#'+id,Default);
		SetUiCrossDataSize('#'+id,ConfigSelectorId);
	},
	
	/**
	 * PieChart : display a pie chart with particular options.
	 */ 
	PieChart: function(TableSelector,OptionsSelector,ConfigSelector) {
		var id 					= $(this).attr('id')
		var TableSelectorId 	= '#'+TableSelector;
		var OptionsSelectorId 	= '#'+OptionsSelector;
		var ConfigSelectorId 	= '#'+ConfigSelector;
		
		//Set default options
		var Default = {
			seriesDefaults: {
				renderer:$.jqplot.PieRenderer,
				rendererOptions: {
					showDataLabels: true,
					dataLabels: 'value',
					highlightMouseOver: true,
					padding : 13,
					sliceMargin : 3
				}
			},
			grid: {
				background: '#FAF9F9',
				borderColor: '#000000',
				borderWidth: 0.5,
				shadow: true
			},
			legend: {
				show : true,
				marginTop : 0,
				marginBottom : 10,
				predraw: true
			},
			highlighter: {
		        show: true,
		        formatString:'%s, %P',
		        tooltipLocation:'n',
    			useAxesFormatters:false
		    }
		};	
		
		var OrderedData = [];
		
		if ($(OptionsSelectorId).length > 0 && $(TableSelectorId).length > 0 && $(ConfigSelectorId).length > 0) {
			var OptionsFromSelector	= GetDataFromSelector(OptionsSelectorId);
			var TableData 			= GetDataFromSelector(TableSelectorId);
			var Config 				= GetDataFromSelector(ConfigSelectorId);
			var dataType			= GetDataTypeForEachElement(TableData,Config);
			
			//Set table
			var CrossedData = ModifyToCrossedData(TableData,Config,dataType);
			OrderedData 	= ModifyToDefaultSeries(CrossedData);

			//Set options
			if ( OrderedData.length > 0 ) {
				ModifyToParseType(OptionsFromSelector);
				Default = ModifyWithSuperExtend(Default, OptionsFromSelector);
				Default = ModifyForDate(Default,dataType);
				if (Default.seriesDefaults.rendererOptions.dataLabels == 'value')
					Default = ModifyForCurrency(Default,dataType,'dataLabelFormatString');
				Default = ModifyForColor(Default,OrderedData);
			}else
				Default = ModifyForTitleOnly(Default,OptionsFromSelector);
			
			OrderedData = ModifyDataIfEmpty(OrderedData);
		}
		
		//before display
		SetChartsize('#'+id,Default);
		
		if ( OrderedData.length>0){
			//Width used for chart is full size if width not defined in parameters
			if (Default['width'] == undefined)
				$('#'+id).width($('#'+id+'Wrapper').width());
			var myPlot = $.jqplot(id, OrderedData, Default);
			$(window).resize(function(){
				//Width used for chart is full size if width not defined in parameters
        		if (Default['width'] == undefined)
					$('#'+id).width($('#'+id+'Wrapper').width());
			    myPlot.replot( { resetAxes: true } );
			});   
		}

		//after display
		SetLegendSize('#'+id,Default);
		SetUiCrossDataSize('#'+id,ConfigSelectorId);
	},
	
	/**
	 * BarChart : display a bar chart with particular options.
	 */ 
	BarChart: function(TableSelector,OptionsSelector,ConfigSelector) {
		var id 					= $(this).attr('id')
		var TableSelectorId 	= '#'+TableSelector;
		var OptionsSelectorId 	= '#'+OptionsSelector;
		var ConfigSelectorId  	= '#'+ConfigSelector;
		//Set default options
		var Default = {
			stackSeries: true,
			seriesDefaults: {
				renderer:$.jqplot.BarRenderer,
				rendererOptions: {
					barMargin: 15,
					highlightMouseOver: true,
					useNegativeColors: false
				}
			},
			axes: {
				xaxis: {
					 tickOptions:{
						showGridline: false
					}
				}
			},
			grid: {
				background: '#FAF9F9',
				borderColor: '#000000',
				borderWidth: 0.5,
				shadow: true
			},
			highlighter: {
				show : true,
				tooltipAxes : 'y',
			},
			cursor: {
				show : false,
				zoom: false, //doesnt work for bar chart
				showTooltip : false
			}
		};
		
		var OrderedData = [];
		var SliderData  = [];
		if ($(OptionsSelectorId).length > 0 && $(TableSelectorId).length > 0 && $(ConfigSelectorId ).length > 0) {
			var OptionsFromSelector	= GetDataFromSelector(OptionsSelectorId);
			var TableData 			= GetDataFromSelector(TableSelectorId);
			var Config 				= GetDataFromSelector(ConfigSelectorId );
			var dataType			= GetDataTypeForEachElement(TableData,Config);
		
			//Set table
			var CrossedData = ModifyToCrossedData(TableData,Config,dataType);
			OrderedData 	= ModifyToDefaultSeries(CrossedData);
			OrderedData		= ModifyToFillHoleInOrderedData(OrderedData);
			OrderedData		= ModifyToSortOrderedData(OrderedData,dataType);
			SliderData		= ModifyToSlideOrderedData(OrderedData,Config);
			
			//Set options
			if ( SliderData.length > 0 ) {
				ModifyToParseType(OptionsFromSelector);
				Default 	= ModifyWithCrossedData(Default,CrossedData,OptionsFromSelector);
				
				Default 	= ModifyWithSuperExtend(Default, OptionsFromSelector);
				Default 	= ModifyForDate(Default,dataType);
				Default 	= ModifyForRenderer(Default);
				Default 	= ModifyForCurrency(Default,dataType,'formatString');
				Default 	= ModifyForTicks(Default,SliderData);
				
				//last modification SliderData
				SliderData	= ModifyToStackSeries(SliderData);
			}else 
				Default 	= ModifyForTitleOnly(Default,OptionsFromSelector);
				
			SliderData = ModifyDataIfEmpty(SliderData);
		}
		
		//before display
		SetChartsize('#'+id,Default);

		if ( OrderedData.length>0){
			//Width used for chart is full size if width not defined in parameters
			if (Default['width'] == undefined)
				$('#'+id).width($('#'+id+'Wrapper').width());
			
			var myPlot = $.jqplot(id, SliderData, Default);
			$(window).resize(function(){
				//Width used for chart is full size if width not defined in parameters
        		if (Default['width'] == undefined){
        			$('#'+id).width($('#'+id+'Wrapper').width());
				    $.each(myPlot.series, function(index, series) { 
					        series.barWidth = undefined; 
					}); 
				    myPlot.replot( { resetAxes: true } );
        		}
					
			});   
		}

		//after display
		AddSliderIfNotDefined('#'+id,ConfigSelectorId,OrderedData);
		SetLegendSize('#'+id,Default);
		SetUiCrossDataSize('#'+id,ConfigSelectorId);
	},

	/** 
	 * ReplotChartOn : Replot Charts If necessary
	 * [targetChart] : selector used to target the chart to replot
	 * [event] to replot the chart
	 * [selectorSource] (optional, default = this)
	 * Config["replot"] = ["Selector used to trigger event","Event",""]
	 */ 

	ReplotChartOn: function(event,targetChart,selectorSource) {
		var selector = selectorSource || this;
		if ($(selector).length > 0 ) {
			$(selector).bind(event, function() {
				if ($(targetChart).length > 0 ) {
					$(targetChart).empty();
					$(targetChart).EvalClass();
				}
	    	});
		}
	}
});
})(jQuery)