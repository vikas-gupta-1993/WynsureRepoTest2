
BLOCS = {
    'S10.G00.00': 'Envoi',
    'S10.G00.01': 'Emetteur',
    'S10.G00.02': 'Contact Emetteur',
    'S20.G00.05': 'PASRAU',
    'S20.G00.07': 'Contact chez le déclaré',
    'S21.G00.06': 'Entreprise',
    'S21.G00.11': 'Etablissement',
    'S21.G00.20': 'Versement organisme',
    'S21.G00.30': 'Individu',
    'S21.G00.31': 'Changements Individu',
    'S21.G00.50': 'Versement individu',
    'S21.G00.56': 'Régularisation du prélèvement à la source',
    'S90.G00.90': "Total de l'envoi",
}

# reversed dictionary
R_BLOCS = dict((v, k) for k, v in BLOCS.items())

MONTHS = {
    'Month_Jan': '01',
    'Month_Feb': '02',
    'Month_Mar': '03',
    'Month_APR': '04',
    'Month_May': '05',
    'Month_Jun': '06',
    'Month_Jul': '07',
    'Month_Aug': '08',
    'Month_Sep': '09',
    'Month_Oct': '10',
    'Month_Nov': '11',
    'Month_Dec': '12',
}
GENDER = {
    'gFemale': '01',
    'gMale':  '02'
}
FRENCH_COUNTRYCODE = ['FR', 'GP', 'BL', 'MF', 'MQ', 'GF', 'RE', 'PM', 'YT', 'WF', 'PF', 'NC', 'MC']
