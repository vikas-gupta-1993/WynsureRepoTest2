<%@ Page Language="vbscript" Debug="true" AspCompat="true" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Globalization" %>
<%
Dim key as String
Dim path As String = Server.MapPath("WydeWeb-Client-Collect-" & DateTime.Today.ToString("yyyy-MM-dd") & ".log")
Dim textFile As StreamWriter = File.AppendText(path)

'''''' log POST data
If Request.Form.AllKeys.Length > 0
   textFile.Write(DateTime.Today.ToString("dd-MM-yyyy") & " " & DateTime.Now.ToString("HH:mm:ss") & " ")
   For Each key in Request.Form.Keys
      textFile.Write(" " & key & "='" & Request.Form(key) & "'")
      'textFile.WriteLine()
   Next key
   textFile.WriteLine()
End If

'''''' log GET data
If Request.QueryString.AllKeys.Length > 0
   textFile.Write(DateTime.Today.ToString("dd-MM-yyyy") & " " & DateTime.Now.ToString("HH:mm:ss") & " ")
   For Each key in Request.QueryString.Keys
      textFile.Write(" " & key & "='" & Request.QueryString(key) & "'")
      'textFile.WriteLine()
   Next key
   textFile.WriteLine()
End If
   
textFile.Flush()
textFile.Close()
%>