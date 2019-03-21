import math
from enum import Enum

BLOCS = {
    'S10.G00.00': 'Envoi',
    'S10.G00.01': 'Emetteur',
    'S10.G00.02': 'Contact Emetteur',
    'S90.G00.90': "Total de l'envoi",
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

Months ={
    'Month_Jan' : 1,
    'month_Feb' : 2,
    'Month_Mar' : 3,
    'Month_APR' : 4,
    'Month_may' : 5,
    'Month_Jun' : 6,
    'Month_Jul' : 7,
    'Month_Aug' : 8,
    'Month_Sep' : 9,
    'Month_Oct' : 10,
    'Month_Nov' : 11,
    'Month_Dec' : 12,
}
Gender ={
    'gFemale': '01',
    'gMale':  '02'
}

FrenchCountry_Code_list = ['FR', 'GP' , 'BL' ,'MF','MQ', 'GF', 'RE','PM', 'YT', 'WF', 'PF','NC','MC']