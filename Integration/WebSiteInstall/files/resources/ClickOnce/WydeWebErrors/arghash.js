var arghash = new Array();
function URLDecode(encoded)
{
	// Replace + with ' '
	// Replace %xx with equivalent character
	// Put [ERROR] in output if %xx is invalid.
	var HEXCHARS = "0123456789ABCDEFabcdef"; 
	var plaintext = "";
	var i = 0;
	while (i < encoded.length) {
    var ch = encoded.charAt(i);
	  if (ch == "+") {
	    plaintext += " ";
  	  i++;
	  } else if (ch == "%") {
		 	if (i < (encoded.length-2) 
 				&& HEXCHARS.indexOf(encoded.charAt(i+1)) != -1 
 				&& HEXCHARS.indexOf(encoded.charAt(i+2)) != -1 ) {
			 		plaintext += unescape( encoded.substr(i,3) );
			 		i += 3;
			} else {
	 			alert( 'Bad escape combination near ...' + encoded.substr(i) );
		 		plaintext += "%[ERROR]";
		 		i++;
		 	}
		} else {
	   	plaintext += ch;
	   	i++;
		}
	} // while
	return plaintext;
};

function GetArgHash()
{
	urlquery=location.href.split("?")
	urlparts=urlquery[1].split("&")
	for (i=0; i < urlparts.length; i++)
	{
		parameter=urlparts[i].split('=')
		arghash[URLDecode(parameter[0])]=URLDecode(parameter[1])
	}
}
GetArgHash()

