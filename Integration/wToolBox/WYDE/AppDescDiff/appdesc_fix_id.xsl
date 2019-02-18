<?xml version="1.0" encoding="ISO-8859-1" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method = "xml" indent="yes" encoding="ISO-8859-1" />
<xsl:template match="Id"></xsl:template>
<xsl:template match="Version"></xsl:template>
<xsl:template match="FunctionalDomainsDescriptor"></xsl:template>
<xsl:template match="aWFPickerBagManagerGroupDescriptor[Name]"><xsl:call-template name="add_id"><xsl:with-param name="path" select="./WorkingClassDef" /></xsl:call-template></xsl:template>
<xsl:template match="aWFDesktopGroupDescriptor[Name]"><xsl:call-template name="add_id"><xsl:with-param name="path" select="./Name" /></xsl:call-template></xsl:template>
<xsl:template match="aWFManagerGroupDescriptor[Name]"><xsl:call-template name="add_id"><xsl:with-param name="path" select="./Name" /></xsl:call-template></xsl:template>
<xsl:template match="aWFBrokerChoice[Name]"><xsl:call-template name="add_id"><xsl:with-param name="path" select="./Name" /></xsl:call-template></xsl:template>

<!-- Add attribute -->
<xsl:template name="add_id"> 
 <xsl:param name="path" />
 <xsl:param name="name">id</xsl:param>
	<xsl:element name="{name()}"> 
		<xsl:attribute name="{$name}"><xsl:value-of select="$path" /></xsl:attribute>
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

