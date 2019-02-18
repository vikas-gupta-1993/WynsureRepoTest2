// Update value of tag <synchro_at> in index.xml for a specifc Wynsure version
// Argument in Command Line:
//  /INDEX_FILE: Path of IndexFile.xml
//  /FOR_VERSION: Wynsure Version
//  /DATE_TIME: value to set in field <synchro_at>

var ReturnCode_ChangeDone = 0;

var ReturnCode_IndexFile_Not_Found = 2;

var IndexFileArgName = '/INDEX_FILE:';
var WynsureVersionArgName = '/WYNSURE_VERSION:';
var DateTimeArgName = '/DATE_TIME:';

var cNodeWynsureVersion="version";
var cAttributeTitleWynsureVersion="title";
var cNodeApplication="application";
var cNodeSynchroAt="SynchroAt";

// Extract Argument From Command Line
var Args = WScript.Arguments;
var CommandLine = "";
for (i = 0; i < Args.length; i++) {
	CommandLine = CommandLine + ' ' + Args(i);
}

AllArgs = new Array(3);
AllArgs[0] = IndexFileArgName;
AllArgs[1] = WynsureVersionArgName
	AllArgs[2] = DateTimeArgName;
ArgumentsValue = new Array(3);
GetArgumentsValue(CommandLine, AllArgs, ArgumentsValue);
theIndexFile = ArgumentsValue[0];
theWynsureVersion = ArgumentsValue[1];
DateTimetoSet = ArgumentsValue[2];

// Extract SQL request in Integration Report File
var ReturnCode = UpdateSynchroAtForAWynsureVersion(theIndexFile, theWynsureVersion, DateTimetoSet);
WScript.Quit(0);


function UpdateSynchroAtForAWynsureVersion(IndexFile, WynsureVersion, DateTime) {
	//var xmlDoc= document.implementation.createDocument("", "", null);
	var IndexFileDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
	IndexFileDoc.async = false;
	IndexFileDoc.resolveExternals = false;
	IndexFileDoc.validateOnParse = false;

	IndexFileDoc.load(IndexFile);
	
  // Search Node for WynsureVersion
  var VersionNode = FindNodeWithNodeNameAndAttributeNameValue(IndexFileDoc.documentElement, cNodeWynsureVersion, 
                                                              cAttributeTitleWynsureVersion, WynsureVersion);
  
  
  // Update sub nodes Application -> SynchroAt at new value
  SetSubNodeValueFromRootNode(IndexFileDoc, VersionNode, cNodeApplication, cNodeSynchroAt, DateTimetoSet);
   
  IndexFileDoc.save(IndexFile);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

function Trim(theString) {
	var curString = theString;

	var FirstRank = 0;
	while ((FirstRank < curString.length) && (curString.charAt(FirstRank) == " "))
		FirstRank++;

	var LastRank = curString.length - 1;
	while ((LastRank >= 0) && (curString.charAt(LastRank) == " "))
		LastRank--;

	curString = (LastRank <= 0) ? '' : curString.substring(FirstRank, LastRank + 1);
	return curString;
}

function GetArgumentsValue(CommandLine, Arguments, ArgumentsValue) {
	var NbArgToSeek = Arguments.length;

	for (i = 0; i < NbArgToSeek; i++) {
		var curArgToSeek = Arguments[i];
		var curArgPositionInCommandLine = CommandLine.search(curArgToSeek);

		// for each argument catches the character through next arguments
		//   /CUR_ARGUMENT:anytextanytextanytextanytextanytextanytextanytextanytext/FOLLOWING_ARGUMENT:
		//                 | -> FirstRankAfterCurrentArgument                      |-> FirstRankOfFollowingArgument
		if (curArgPositionInCommandLine != -1) {
			// rank of first characters after current argument
			var FirstRankAfterCurrentArgument = curArgPositionInCommandLine + curArgToSeek.length;
			var FirstRankOfFollowingArgument = 0;

			// rank of first characters of the FIRST Following arguments
			for (j = 0; j < NbArgToSeek; j++) {
				if (j != i) {
					var RankOfTestedArgument = CommandLine.search(Arguments[j]);

					if ((RankOfTestedArgument != -1) && (RankOfTestedArgument >= FirstRankAfterCurrentArgument))
						FirstRankOfFollowingArgument = (FirstRankOfFollowingArgument == 0) ? RankOfTestedArgument : Math.min(FirstRankOfFollowingArgument, RankOfTestedArgument);
				}
			}
			if (FirstRankOfFollowingArgument == 0)
				FirstRankOfFollowingArgument = CommandLine.length;

			var PartOfCommandLineForCurrentArgument = CommandLine.substring(FirstRankAfterCurrentArgument, FirstRankOfFollowingArgument);

			ArgumentsValue[i] = Trim(PartOfCommandLineForCurrentArgument);
		}
	}
}

function FindNodeWithNodeNameAndAttributeNameValue(ParentNode, NodeName, AttributeName, AttributeValue)
{
  var NodeList = ParentNode.selectNodes(NodeName);
  var FoundNode;
  for (var i=0; i < NodeList.length; i++) 
  {
    var curNode = NodeList.item(i);
    var curAttribute= curNode.getAttributeNode(AttributeName);
    
    if (curAttribute.value == AttributeValue)
    {
      FoundNode = curNode;
      break;
    }
  }
    
  return FoundNode;
}

function SetSubNodeValueFromRootNode(XmlDoc, NodeList, InvolvedNodesName, SubNodesName, value)
{
  var InvolvedNodes = NodeList.selectNodes(InvolvedNodesName);
  
  for (var i=0; i < InvolvedNodes.length; i++)
  {
    var curInvolvedNode = InvolvedNodes.item(i);
    var subNode = curInvolvedNode.selectSingleNode(SubNodesName);
    
    if (subNode != null)
      subNode.text=value;
    else
    {
      var newSubNode = XmlDoc.createNode(1, SubNodesName, "");
      newSubNode.text = value;
      
      var tmpNode = curInvolvedNode.insertBefore(newSubNode, curInvolvedNode.childNodes.item(1));
    }
  }
} 