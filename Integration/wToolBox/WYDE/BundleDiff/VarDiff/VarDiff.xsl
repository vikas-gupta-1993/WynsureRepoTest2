<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:output encoding="ISO-8859-1" method="html"/>

	<xsl:template match="/">
		<html>
			<head>
				<title>Var Diff</title>
				<xsl:call-template name="style" />
			</head>
			<body>
				<table>
					<tr>
						<th>Class</th>
						<th>Variable</th>
						<th>Status</th>
					</tr>
					<xsl:call-template name="vardiff" />
				</table>
			</body>
		</html>
	</xsl:template>
	
	<xsl:template name="vardiff">
		<xsl:for-each select="/Changed/Catalog/Changed/MyVariables/*">
			<tr>
				<td><xsl:value-of select="../../@Name" /></td>
				<td><xsl:value-of select="./@Name" /></td>
				<td>
					<xsl:attribute name="class">
	                    <xsl:value-of select="name(.)" />
	                </xsl:attribute> 
					<xsl:value-of select="name(.)" />
				</td>
			</tr>
		</xsl:for-each>
	</xsl:template>

<xsl:template name="style">
<style type="text/css">
td.Changed {
	color: blue;
}
td.Added {
	color: green;
}
td.Deleted {
	color: red;
}
table {
	border: 1px solid black;
}
th, td {
	border: 1px solid lightgray;
}
</style>
</xsl:template>

</xsl:stylesheet>
