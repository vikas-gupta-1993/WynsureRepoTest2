/*!
 * Wyde Ninja jqplot Config Module override
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license<
 *
 */

(function($) {
$.extend($.fn.classfunc,{
	/**
	 * UpdateChart : UpdateChart when cross data Ui element changed.
	 */ 
	UpdateChart: function(ChartSelector, ConfigSelector, ConfigElementToChange){
		var ChartID = '#'+ChartSelector;
		this.change({chId:ChartID,coSe:ConfigSelector,coEl:ConfigElementToChange},function(event) {
			UpdateChartWhenUiCrossDataUsed(event.data.chId,event.data.coSe,event.data.coEl,GetPositionFromRadioId(this.id));
		});
	},
	
	/**
	 * HandleAvailableChoices : UpdateChart when cross data Ui column is checked or unchecked.
	 */ 
	HandleAvailableChoices : function(ChartSelector,ConfigSelector,ChoicesSelector,ConfigElementToChange) {
		var ChartID 	= '#'+ChartSelector;
		//bind a function to click event
		this.click(
			{chId:ChartID,coSe:ConfigSelector,coEl:ConfigElementToChange,chSe:ChoicesSelector},
			function(event) {
				var elementSelected = -1;
				var isDisable = true;
				if (! $(this).hasClass('checkbox-checked-disabled')) {
					if ( $(this).hasClass('checkbox-checked') )
						isDisable = false;
					
					var inputs = $( '#' + event.data.chSe + ' input');
					for( var i = 0 ; i < inputs.length; i ++) {
						var curInput = $(inputs[i]);
						if ( $(this).hasClass('checkbox-checked') && inputs[i].checked == true )
							elementSelected = i;
						curInput.attr('disabled',isDisable);
					}

					UpdateChartWhenUiCrossDataUsed(event.data.chId,event.data.coSe,event.data.coEl,elementSelected);
				}
			}
		);
	}
	
});
})(jQuery);

 /** 
 * GetPositionFromRadioId : return the position of a radio button considering it value
 */
GetPositionFromRadioId = function(radioButtonValue) {
	var StringTable = radioButtonValue.split('_');
	return StringTable[StringTable.length-1].toFloat();
};

 /** 
 * UpdateChartWhenUiCrossDataUsed : cross data UI changes what is displayed by chart, considering:
 * ChartID : 				one chart
 * ConfigSelector : 		one configuration ie current crossed data and current map of data type id
 * ConfigColumnToChange: 	if the change concerned a column, a row or a value
 * ElementChosen:			if the change concerned the element 0 to N of the ConfigColumnToChange
 */
UpdateChartWhenUiCrossDataUsed = function(ChartID,ConfigSelector,ConfigColumnToChange,ElementChosen) {
	var Config = GetDataFromSelector('#'+ConfigSelector);
	if ( Config != undefined ) {
		var columnId = -1;
		switch(ConfigColumnToChange) {
			case 'Columns': columnId = 0;	break;
			case 'Rows': 	columnId = 1;	break;
			case 'Values': 	columnId = 2;	break;
		}
		
		if ( columnId != -1 ){
			//get index of the chosen element and modify cross configuration too
			Config['Cross'][columnId] = GetPositionFromRadiowithMap(ElementChosen,Config['UiCrossMap'],columnId);

			//reset previous slider information if existing
			if ( Config['Slider'] != undefined ) {
				$('#' + Config['Slider'][3]).empty();
				Config['Slider'][1] = 0;
			}
			
			//insert new config in html tag
			$('#'+ConfigSelector).empty();
			$('#'+ConfigSelector).html('\n' + JSON.stringify(Config) + '\n');
			
			//Refresh chart
			if ($(ChartID).length > 0 ) {
				$(ChartID).empty();
				$(ChartID).EvalClass();
			}
		}
	}
};

/** 
 * GetPositionFromRadiowithMap : return the position of a radio button considering a map
 * InMap =  [ [ columns ], [ rows ], [ values] ] : index list
 * example InMap = [ [ 1, -1 ], [ 1 ], [ 0, 1] ]
 */
GetPositionFromRadiowithMap = function(radioButtonValue,InMap,indexInMap) {
	if ( InMap != undefined && radioButtonValue != undefined && radioButtonValue != -1 ) {
		if (indexInMap >= 0 && indexInMap < InMap.length )
			return InMap[indexInMap][radioButtonValue];
	}
	return radioButtonValue;
};