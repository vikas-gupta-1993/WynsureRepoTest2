/*!
 * Wyde Ninja jqplot Data Module override
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license<
 *
 */
 
 /**
 * parseTypeForTable : transform a value in the corresponding type for Table data
 * DataType : kind of value 
 */ 
String.prototype.parseTypeForTable = function(DataType) {
	var length 		= this.length;
	var negative 	= '';
	var chaine;

	if ( DataType  == 'Currency') {
		if ( this.substring(0,1) == '-') {
			negative 	= '-';
			chaine 		= this.substring(1,length);
		} else
			chaine 		= this.substring(0,length);
		
		//convert chaine to use symbole
		chaine = chaine.replace(/ /g, "").replace(/\&euro;/g, "E");
		length = chaine.length;
		
		//remove $/€ before or after amount
		if ( chaine.match("[0-9]$") && !chaine.match("^[0-9]") )
			chaine = chaine.substring(1,chaine.length);
		else if ( chaine.match("^[0-9]") && !chaine.match("[0-9]$") )
			chaine = chaine.substring(0,chaine.length-1);
		
		//US notation ( ',' each 3 numbers)
		if( chaine.match("^[0-9,]+([.0-9]+)?$") )
			chaine = chaine.replace(/,/g, "");
		else{
			//French notation ( ',' used for '.' )
			if( chaine.match("^[0-9]+([,0-9]+)?$") )
				chaine = chaine.replace(/,/g, ".");
		}
		
		chaine = negative + chaine;

		return chaine.toFloat();
		
	} else if( DataType  == 'Date' ){
		//only the English format date is supported to sort date type
		if (this.substring(2,3) == '/' && this.substring(5,6) == '/')
			if ( $.lang.DateFormat != 'mm/dd/yyyy' )
				return negative + this.substring(3,5) + '/' + this.substring(0,2) + '/' + this.substring(6,this.length);
	}
	return this.substring(0,this.length);
};

 /** 
 * FormatLineDataAsUsable : modify var format according to it type
 * Line: table of string representing a cell data. Example: ['STD', '8$']
 * CrossDataBuilder: table of cell position to use for the line. Example: [1,0]
 * DataType: table of string representing a cell data type. Example: ['String','Currency']
 */
FormatLineDataAsUsable = function(Line,CrossDataBuilder,DataType) {
	if ( Line != undefined && CrossDataBuilder != undefined) {
		//fill line with needed cell
		var results 	= [];
		var CellNumbers = CrossDataBuilder.length
		for ( var i=0; i < CellNumbers; i++ ) 
			results[i] = Line[CrossDataBuilder[i]];
			
		//add one cell if not enoug cell
		if (results.length == 1)
			results[1] = 1;
		else {
			//When last cell is not a number or currency, it cant be calculated ( for example:a date)
			if (DataType[CellNumbers-1] != 'Number' && DataType[CellNumbers-1] != 'Currency')
				results[results.length-1] = 0;
		}
			
		
		// currency must be numbers
		for( var i = 0; i < results.length; i++)
			if (typeof(results[i]) == 'string') 
				results[i] = results[i].parseTypeForTable(DataType[i]);
		
		return results;
	}
	return Line;
}; 

/** 
 * CreateCrossDataBuilder : used information in Config to get what is important in line
 * Config: table of cell number to use to croos data
 */
CreateCrossDataBuilder = function(Config) {
	var Results = [];
	
	for ( var i=0; i < Config.length; i++ ) 
		if (Config[i] != -1)
			Results[Results.length] = Config[i];
	
	return Results;
}; 

/** 
 * FeedCrossDataTableWithLine : create tree crossing data adding a line inside
 * Data: new new cross data table 
 * Line: a lin to add in the data table
 * i: the level in the tree. first call should be 0
 */
FeedCrossDataTableWithLine = function(Data, Line, i) {
	var CellNumbers = Line.length
	if( Line != undefined && Line[i] != undefined ) {
		var Value	= Line[i];
		
		if ( i < CellNumbers - 1 ) {
			if (Data == undefined)
				Data = {};
			if (Value !== '')
				Data[Value] = FeedCrossDataTableWithLine(Data[Value], Line, i+1);
			else
				Data = FeedCrossDataTableWithLine(Data[Value], Line, i+1);
		}else {
			if ( Data == undefined )
				Data = 0;
			
			Data += Value;
		}
	}
	return Data;
};

/** 
 * ModifyToCrossedData : From an array in two dimensions, cross data
 * Data: the original table of data picked from html
 * Config: the original configuration picked from html
 * DataType: the original data type picked from html
 * Return : a 2D array.
 * Example : Config = [0,1,2]
 * var FromArray = [
 *	['C1', 'C2', 'C3'],
 *	['A', '1', '10'],
 *	['A', '2', '10'],
 *	['A', '2', '20'],
 *	['B', '1', '30'],
 *	['B', '2', '20'],
 *	['C', '3', '10'],
 *	['C', '3', '10']
 *	];
 * var ToArray =  = {
 *  	'A' : 		{ "1" : 10, "2" : 30},
 *  	'B' : 		{ "1" : 30, "2" : 20, "3" : 0},
 *  	'C' : 		{ "1" : 0, "2" : 0,  "3" : 20}
 *  	};
 * If column 1 is -1 (ie [-1,1,2]), the column is not used and a different array is created: 
 * var ToArray =  = { 
 *		"1" : 40, 
 *		"2" : 50, 
 *		"3" : 20},
 *  	};
 * If column 1 & 3 is -1 (ie [-1,0,-1]), the column and value is not used and a different array is created (number of row elements): 
 * var ToArray =  = { 
 *		"A" : 3, 
 *		"B" : 2, 
 *		"C" : 2},
 *  	};
 */
ModifyToCrossedData = function(Data,Config,DataType){
	if ( Config != undefined && Config['Cross']!= undefined && Data != undefined ) {
		var Results;
		var LineNumbers = Data.length;
		var Line;
		if ( LineNumbers > 1 ) {
			var CrossDataBuilder = CreateCrossDataBuilder(Config['Cross']); //table used to know how analyse Data
			
			if ( CrossDataBuilder.length > 0 )
				for ( i = BeginingDataLineNumber; i < LineNumbers; i++ ) {
					Line 	= FormatLineDataAsUsable(Data[i],CrossDataBuilder,DataType);
					Results = FeedCrossDataTableWithLine(Results,Line,0);
				}
		}
	}
	if ( Results == undefined || Results == 0) 
		return {};
	else
		return Results;
};

/** 
 * ModifyToDefaultSeries : From an array in two dimensions, create an array int tree dimensions for jqplot function
 * Array2D: tree of data
 * return : a 3D array
 * example :
 * var Array2D = {
 *  	'A' : 		{ "1" : 10, "2" : 30, "3" : 0},
 *  	'B' : 		{ "1" : 30, "2" : 20, "3" : 0},
 *  	'C' : 		{ "1" : 0, "2" : 0,  "3" : 20}
 *  	};
 * Array3D [0][0][0]= 1;
 * Array3D [0][0][1]= 10;
 * Array3D [0][1][0]= 2;
 * Array3D [0][1][1]= 30;
 * Array3D [0][2][0]= 3;
 * Array3D [0][2][1]= 0;
 * Array3D [1][0][0]= 1;
 * Array3D [1][0][1]= 30;
 * .....
 */ 
ModifyToDefaultSeries = function(Array2D){
	var Array3D = [];
	var i 		= 0;
	var j;
	
	for ( var KeyColumnLabel in Array2D ) {
		if ( typeof(Array2D[KeyColumnLabel]) == "object" ) {
			//when tree columns are used
			Array3D[i] = [];

			j = 0;
			for ( var KeyRowLabel in Array2D[KeyColumnLabel] ) {
				Array3D[i][j] = [ KeyRowLabel.parseType() , Array2D[KeyColumnLabel][KeyRowLabel] ];
				j++;
			}
			
		} else {
			//when the two last columns are used
			if ( Array3D[0] == undefined )
				Array3D[0] = [];
			
			Array3D[0][i] = [ KeyColumnLabel.parseType() , Array2D[KeyColumnLabel] ];
		}
		i++;
	}
	
	return Array3D;
};

 /** 
 * ModifyToFillHoleInOrderedData : When OrderedData get several column with different size, this function equalize each column to the same size.
 * OrderedData: table ot ordered data
 * Example: OrderedData = [ 
 * [ ['a',1],['b',2],['c',3] ], 
 * [ ['a',0],['c',5] ]
 * ]
 * OrderedData = ModifyToFillHoleInOrderedData(OrderedData) //the label 'b' is added to the second column
 * OrderedData == [ 
 * [ ['a',1],['b',2],['c',3] ], 
 * [ ['a',0],['b',0],['c',5] ]
 * ]
 */ 
ModifyToFillHoleInOrderedData = function(OrderedData) {
	var CurrentLabel;
	var LabelChecked = [];
	var Found;
	
	if ( OrderedData != undefined) {
		for ( var i = 0; i < OrderedData.length; i++ ) {
			if ( OrderedData[i] != undefined) {
				for ( var j = 0; j < OrderedData[i].length; j++ ) {
					CurrentLabel = OrderedData[i][j][0];
					if ( LabelChecked[CurrentLabel] == undefined ) {
						//verify if this one is existing in each cell from other column
						for ( var k = 0; k < OrderedData.length; k++ ) {
							if ( k != i ) {
								Found = false;
								for ( var l = 0; l < OrderedData[k].length; l++ )
									if ( OrderedData[k][l][0].toString() == CurrentLabel.toString() ) {
										Found = true;
										break;
									}
								
								//if not existing, we had it to the column
								if ( !Found ) {
									OrderedData[k][OrderedData[k].length] = [];
									OrderedData[k][OrderedData[k].length - 1][0] = OrderedData[i][j][0];
									switch ( typeof(OrderedData[i][j][1]) ) {
										case 'number':
											OrderedData[k][OrderedData[k].length - 1][1] = 0;
											break;
										case 'string':
											OrderedData[k][OrderedData[k].length - 1][1] = '';
											break;
									 }
								}
							}
						}
						//perf: Avoid to check the label twice
						LabelChecked[CurrentLabel] = true;
					}
				}
			}
		}
	}
	
	return OrderedData;
};

/**
* date_sort_asc : callbacks provided to the array sort method below
* return 1 if date1 > date2, 0 if =, -1 if <
*/
date_sort_asc = function (date1, date2) {
  // This is a comparison function that will result in dates being sorted in
  // ASCENDING order. As you can see, JavaScript's native comparison operators
  // can be used to compare dates. This was news to me.
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};

 /** 
 * ModifyToSortOrderedData : sort element of OrderedData. work only for X axis
 * Example: if DataType[DataType.length-2] = 'Date' and OrderedData = [ 
 * [ ['01/01/11',1],['01/01/09',2],['01/01/10',3] ], 
 * [ ['01/01/10',0],['01/01/11',5],['01/01/09',5] ]
 * ]
 * OrderedData = ModifyToSortOrderedData(OrderedData,OptionsFromSelector,dataType) //in this example, the sort is related to dates label
 * OrderedData == [ 
 * [ ['01/01/09',2],['01/01/10',3],['01/01/11',1] ], 
 * [ ['01/01/09',5],['01/01/10',0],['01/01/11',5] ]
 * ]
 */ 
ModifyToSortOrderedData = function(OrderedData,DataType) {
	if ( OrderedData != undefined && DataType.length >= 2) {
		var DateSort = 'Dates';
	
		var SortToDo;
		var CurrentLabel;
		var Dates 			= [];
		var CurClassement 	= [];
		var StringDate;
		var Array3DResult 	= [];
		var Day;
		var Month;
		var FullYear;
		var i,j;
	
		if ( DataType != undefined && DataType[DataType.length-2] != undefined && DataType[DataType.length-2] == 'Date' )
			SortToDo = DateSort;
		
		switch ( SortToDo ) {
			case DateSort:
				for ( i = 0; i < OrderedData.length; i++ ) {
					if ( OrderedData[i] != undefined) {
						Array3DResult[i] 	= []
						
						for ( j = 0; j < OrderedData[i].length; j++ ) {
							CurrentLabel 				= OrderedData[i][j][0];
							NewDate 					= new Date(CurrentLabel);
							Dates[j] 					= NewDate;
							CurClassement[CurrentLabel] = j; //save current classement will help to sort OrderedData
						}
						
						Dates.sort(date_sort_asc);
						
						for ( j = 0; j < Dates.length; j++ ) {
							DayString 	= Dates[j].getDate();
							MonthString = Dates[j].getMonth() + 1;
							FullYear 	= Dates[j].getFullYear();
							delete Dates[j];
							if ( DayString < 10 ) 	DayString	= '0' + DayString;
							if ( MonthString < 10 ) MonthString = '0' + MonthString;
							
							StringDate 			= MonthString + '/' + DayString + '/' + FullYear;
							Array3DResult[i][j] = OrderedData[i][CurClassement[StringDate]];
						}
						Dates= [];
					}
				}
				break;
			default : 
				Array3DResult = OrderedData;
				break;
		}				
		return Array3DResult;
	}
	
	return OrderedData;
};

/** 
 * ModifyToSlideOrderedData : Keep only usefull elements corresponding to the slider position.
 *  the filter depends of Config: if 'slider' is present, the slider must be used
 *  Config["slider"] = ["Where begin the display","position from the beggining","number of result by page","ID used to display chart"]
 * Example: OrderedData = [ 
 * [ ['01/01/09',2],['01/01/10',3],['01/01/11',1],['01/01/12',1],['01/01/13',1] ] 
 * ]
 * if Config["slider"] == ["cBeginning",0,2] 
 * ModifyToSlideOrderedData(OrderedData,Config) == [ 
 * [ ['01/01/09',2],['01/01/10',3] ]
 * ]
 * if Config = ["cBeginning",2,2],
 * ModifyToSlideOrderedData(OrderedData,Config) == [ 
 * [ ['01/01/13',1] ]
 * ]
 * if Config = ["cEnd",0, 2],
 * ModifyToSlideOrderedData(OrderedData,Config) == [ 
 * [ ['01/01/12',1],['01/01/13',1] ]
 * ]
 * if Config = ["cEnd",2, 2],
 * ModifyToSlideOrderedData(OrderedData,Config) == [ 
 * [ ['01/01/09',2] ]
 * ]
 */ 
ModifyToSlideOrderedData = function(OrderedData,Config) {
	
	if ( Config["Slider"] != undefined ) {
		var BegPos			= Config["Slider"][0];
		var CurrentPos		= Config["Slider"][1];
		var NbByPage		= Config["Slider"][2];
		var NewOrderedData 	= [];
		
		if ( OrderedData != undefined && OrderedData.length > 0 ) {
			var OrderedDataDepth = OrderedData[0].length;
			if ( BegPos == "cEnd" ) {
				CurrentPos = OrderedDataDepth - NbByPage * (CurrentPos + 1 ) ;
				if ( CurrentPos <0 ) {
					NbByPage	+= CurrentPos; //less results than possible
					CurrentPos 	= 0;
				}
			} else
				CurrentPos 		*= NbByPage;
			
			var ValueToAdd;
			var CurrentValue;
			for ( var i = 0; i < OrderedData.length; i++) {
				NewOrderedData[i] 	= [];
				ValueToAdd 			= 0;
				CurrentValue 		= CurrentPos;
				while ( CurrentValue < OrderedDataDepth && ValueToAdd <NbByPage ) {
					NewOrderedData[i][ValueToAdd] = OrderedData[i][CurrentValue];
					CurrentValue++;
					ValueToAdd++;
				}
			}
			return NewOrderedData;
		}
	}
	return OrderedData;
};

/** 
 * ModifyToStackSeries : OrderedData must have a different look (stackseries) to be used bu some charts (like bar chart).
 * the sort depend of options (the chart options give information about axis display)
 * Example: OrderedData = [ 
 * [ ['01/01/11',1],['01/01/09',2],['01/01/10',3] ], 
 * [ ['01/01/10',0],['01/01/11',5],['01/01/09',5] ]
 * ]
 * OrderedData = ModifyToStackSeries(OrderedData)
 * OrderedData == [ 
 * [ 2,3,1 ], 
 * [ 5,5,0 ]
 * ]
 */ 
ModifyToStackSeries = function(OrderedData) {
	if ( OrderedData != undefined)
		for ( var i = 0; i < OrderedData.length; i++ )
			if ( OrderedData[i] != undefined)
				for ( var j = 0; j < OrderedData[i].length; j++ )
					OrderedData[i][j] = OrderedData[i][j][1];

	return OrderedData;
};

