<?xml version="1.0" encoding="ISO-8859-1" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method = "xml" indent="yes" encoding="ISO-8859-1" />

<xsl:template match="aSqlRefToColumnSetDesc[Name]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Name" /></xsl:call-template></xsl:template>
<xsl:template match="aSqlColumnDesc[Name]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Name" /></xsl:call-template></xsl:template>
<xsl:template match="aSqlListOfColumnSetDesc[Name]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Name" /></xsl:call-template></xsl:template>
<xsl:template match="aMVSqlClassDefRepresentation[Presenting]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Presenting" /></xsl:call-template></xsl:template>
<xsl:template match="aSqlClassDefRepresentation[Presenting]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Presenting" /></xsl:call-template></xsl:template>
<xsl:template match="aSqlTextColumnDesc[Name]"><xsl:call-template name="add_id"><xsl:with-param name="id_path" select="./Name" /></xsl:call-template></xsl:template>

<!-- Add attribute -->
<xsl:template name="add_id"> 
 <xsl:param name="id_path" />
 <xsl:param name="id_name">id</xsl:param>
	<xsl:element name="{name()}"> 
		<xsl:attribute name="{$id_name}"><xsl:value-of select="$id_path" /></xsl:attribute>
		<xsl:apply-templates select="@* | * | comment() | processing-instruction() | text()"/> 
	</xsl:element> 
</xsl:template> 

<!-- Identity transformation template -->
<xsl:template match="@* | * | comment() | processing-instruction() | text()"> 
	<xsl:copy> 
		<xsl:apply-templates select="@* | * | comment() | processing-instruction() | text()"/> 
	</xsl:copy> 
</xsl:template> 

</xsl:stylesheet>

