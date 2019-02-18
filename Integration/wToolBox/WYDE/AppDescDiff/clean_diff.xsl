<?xml version="1.0" encoding="ISO-8859-1" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method = "xml" indent="yes" encoding="ISO-8859-1" />

<xsl:template match="//Presenting/Name/@diff:status"></xsl:template>

<!-- Identity transformation template -->
<xsl:template match="@* | * | comment() | processing-instruction() | text()"> 
	<xsl:copy> 
		<xsl:apply-templates select="@* | * | comment() | processing-instruction() | text()"/> 
	</xsl:copy> 
</xsl:template> 

</xsl:stylesheet>

