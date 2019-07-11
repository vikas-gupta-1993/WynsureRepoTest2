var arghash = new Array();

function makeSafe(str) {
                return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
function GetArgHash()
{
                var urlquery=location.href.split("?")
                var urlparts=urlquery[1].split("&")
                for (var i=0; i < urlparts.length; i++)
                {
                               var parameter=urlparts[i].split('=')
                                arghash[makeSafe(decodeURIComponent(parameter[0]))]=makeSafe(decodeURIComponent(parameter[1]))
                }
}
GetArgHash()
