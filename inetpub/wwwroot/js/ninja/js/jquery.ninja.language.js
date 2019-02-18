/*!
 * Wyde Ninja Language Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
/*
 * Translated default messages for the jQuery wyde.form plugin.
 */
(function ($) {

	$.extend($.lang, {
		numberFormat: {
			EN: {aSep: ',', aDec: '.'},
			FR: {aSep: ' ', aDec: ','}
		},
		getNumberFormat: function() {
			return this.numberFormat[$.lang.LanguageCode.toUpperCase()];
		},
		mlYouMustFillWithAtLeastChars: {
			EN: "You must fill with at least {0} characters",
			FR: "Vous devez saisir au moins {0} caract&egrave;res"
		},
		mlValueShouldBeLessThan: {
			EN: "Value should be less than {0}",
			FR: "La valeur doit &ecirc;tre inf&eacute;rieure &agrave; {0}"
		},
		mlValueShouldBeLessThanOrEqual: {
			EN: "Value should be less than {0} or equal",
			FR: "La valeur doit &ecirc;tre inf&eacute;rieure &agrave; {0} ou &eacute;gale"
		},
		mlDateShouldBeGreaterThan: {
			EN: "Date should be greater than {0} or equal",
			FR: "La valeur doit &ecirc;tre sup&eacute;rieure &agrave; {0} ou &eacute;gale"
		},
		mlValueShouldBeGreaterThan: {
			EN: "Value should be greater than {0}",
			FR: "La valeur doit &ecirc;tre sup&eacute;rieure &agrave; {0}"
		},
		mlValueGreaterThanOrEqual: {
			EN: "Value should be greater than {0} or equal",
			FR: "La valeur doit &ecirc;tre sup&eacute;rieure &agrave; {0} ou &eacute;gale"
		},
		mlValueShouldBeAFraction: {
			EN: "Value should be a fraction",
			FR: "La valeur doit &ecirc;tre une fraction"
		},
		mlValueIsForbidden: {
			EN: "Value {0} is forbidden",
			FR: "La valeur {0} est interdite"
		},
		mlFormatShouldBeNumeric: {
			EN: "Format should be numeric",
			FR: "Le format doit &ecirc;tre num&eacute;rique"
		},
		mlFormatShouldBeInteger: {
			EN: "Format should be an integer",
			FR: "La valeur doit &ecirc;tre un entier"
		},
		mlFormatShouldBeAlphaNumeric: {
			EN: "Format should be an alpha-numeric (no accents allowed)",
			FR: "La valeur doit &ecirc;tre alpha num&eacute;rique sans accent"
		},
		mlPleaseValidateThisSection: {
			EN: "Please validate this section",
			FR: "Merci de valider cette section"
		},
		mlFormatShouldBeAphaNumericAccent: {
			EN: "Value should be an alpha",
			FR: "La valeur doit &ecirc;tre alpha num&eacute;rique"
		},
		mlFormatShouldBeAlphabetic: {
			EN: "Value should be alphabetic",
			FR: "La valeur doit &ecirc;tre alphab&ecirc;tique sans accent"
		},
		mlFormatShouldBeAlphabeticAccent: {
			EN: "Value should be an alpha (accents allowed)",
			FR: "La valeur doit &ecirc;tre alphab&ecirc;tique"
		},
		mlValueIsNotMail: {
			EN: "Value is not an email",
			FR: "La valeur n'est pas un email"
		},
		mlValueShouldNotContainDigit: {
			EN: "Field should not contain any digit",
			FR: "La valeur ne doit pas contenir de chiffres"
		},
		mlIsRequired: {
			EN: "is required",
			FR: "est obligatoire"
		},
		mlFieldIsRequired: {
			EN: "field is required",
			FR: "Ce champ est obligatoire"
		},
		mlNotValidDate: {
			EN: "not a valid date ({0})",
			FR: "Ce n'est pas une date valide ({0})"
		},
		mlPasswordNotLongEnough: {
			EN: "The password is not long enough",
			FR: "Le mot de passe n'est pas assez long"
		},
		mlPasswordDoesNotHasUppercaseLetter: {
			EN: "The password should have at least one uppercase letter [A-Z]",
			FR: "Le mot de passe doit avoir au moins un caractère en majuscule [A-Z]"
		},
		mlPasswordDoesNotHasLowercaseLetter: {
			EN: "The password should have at least one lowercase letter [a-z]",
			FR: "Le mot de passe doit avoir au moins un caractère en minuscule [a-z]"
		},
		mlPasswordDoesNotHasNumber: {
			EN: "The password should have at least one number (0-9)",
			FR: "Le mot de passe doit avoir au moins un numéro (0-9)"
		},
		mlPasswordNotConsistent: {
			EN: "The passwords are not the same",
			FR: "Les mot de passes ne sont pas les mêmes"
		},
		mlSelected: {
			EN: "Selected",
			FR: "Sélectioné(e)(s)"
		},
		mlNoneSelected: {
			EN: "None Selected",
			FR: "Aucun(e) Selectione(e)"
		}
	});
})(jQuery);