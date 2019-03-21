import json
from datetime import datetime
from typing import List
from dataclasses import dataclass
import os
import logging
import calendar
import sys
import shutil
import subprocess
import urllib.request
import urllib.error
from Norm import BLOCS, R_BLOCS, Months, Gender, FrenchCountry_Code_list

sys.argv = ["D:\\Wynsure59-1\\Wynsure\\Python\\Pasrau\\Pasrauu.py", "D:\\Wynsure59-1\\"
                                                                    "Wynsure\\batch\\Out_Python\\",
            "D:\\Wynsure59-1\\Wynsure\\batch\\Out_Python\\Out_Pasrau\\"]
json_folder_path = sys.argv[1]
print(f"Json Folder : {json_folder_path}")
out_pasrau_path = sys.argv[2]
print(f"outpasrau Folder : {out_pasrau_path}")
pasrau_path = str(sys.argv[0]).replace("Pasrauu.py", "")
sys.stdout = open(pasrau_path+'output.txt', 'w')
logging.basicConfig(filename=pasrau_path+'loging.log', level=logging.DEBUG,
                    format='%(asctime)s %(levelname)s %(name)s %(message)s')


def connection_check():
    try:
        url = "http://www.gip-mds.fr/Outil/pasrau-val/"
        urllib.request.urlopen(url, timeout=2)
        return True
    except urllib.error.URLError:
        logging.warning(f"connection is not available")
        return False


def xpath_get(mapping, path):
    elem = mapping
    try:
        for x in path.strip("/").split("/"):
            elem = elem.get(x)
    except AttributeError:
        pass
    if not elem:
        logging.warning(f"Can not find element for path '{path}'")
    return elem


def isbelongtofrance(country_code):
    if country_code in FrenchCountry_Code_list:
        return True


@dataclass
class Rubrique:
    """A rubrique in the PASRAU file."""
    id: int
    label: str
    value: str


@dataclass
class Bloc:
    """
    A bloc in the PASRAU file.
    Might contain descendant blocs (sub_blocs)
    Contains rubriques.
    """
    id: int
    label: str
    rubriques: List[Rubrique]
    sub_blocs: List['Bloc']

    @classmethod
    def create_bloc(cls, id):
        try:
            return cls(id, BLOCS[id], [], [])
        except KeyError:
            raise KeyError(f"Error cannot find id for bloc creation  id: {id}")

    @classmethod
    def create_bloc_from_label(cls, label):
        try:
            return cls(R_BLOCS[label], label, [], [])
        except KeyError:
            raise KeyError(f"Error cannot find label for bloc creation  label: {label}")

    def append_rubrique(self, id, label, value):
        self.rubriques.append(Rubrique(id, label, value))

    def append_rubrique_from_path(self, id, label, mapping, path):
        value = str(xpath_get(mapping, path))
        self.append_rubrique(id, label, value)

    def append_sub_bloc(self, sub):
        self.sub_blocs.append(sub)

    def write(self, file):
        for r in self.rubriques:
            file.write(str(self.id) + '.' + str(r.id) + ',' + "'" + r.value + "'" + "\n")
        for b in self.sub_blocs:
            b.write(file)

    def append_envoi(self):
        envoi = Bloc.create_bloc_from_label('Envoi')
        envoi.append_rubrique('001', 'Nom du logiciel utilisé', 'Wynsure')
        envoi.append_rubrique('002', "Nom de l'éditeur", 'MPHASIS WYDE')
        # TODO version
        envoi.append_rubrique('003', 'Numéro de version du logiciel utilisé', '5.9')
        envoi.append_rubrique('005', "Code envoi du fichier d'essai ou réel", '02')
        envoi.append_rubrique('006', 'Numéro de version de la norme utilisée', '201710')
        envoi.append_rubrique('008', "Type de l'envoi", '01')
        self.append_sub_bloc(envoi)

    def append_emetteur(self, mapping):
        le_path = 'getClaimTaxDeductionFlowConfig/legalEntity/'
        emetteur = Bloc.create_bloc_from_label('Emetteur')
        siret = xpath_get(mapping, le_path+'sIRET')
        country_code = xpath_get(mapping, le_path+'getDefaultAddress/getCountryShortCode')
        emetteur.append_rubrique('001', "Siren de l'émetteur de l'envoi", siret[:9])
        emetteur.append_rubrique('002', "Nic de l'émetteur de l'envoi", siret[9:])
        emetteur.append_rubrique_from_path('003', "Nom ou raison sociale de l'émetteur", mapping, le_path + 'name')
        emetteur.append_rubrique_from_path('004', "Numéro, extension, nature et libellé de la voie", mapping,
                                           le_path + 'getDefaultAddress/line1')
        if isbelongtofrance(country_code):
            emetteur.append_rubrique_from_path('005', "Code postal", mapping,
                                               le_path + 'getDefaultAddress/zipCode/zipCode')
            emetteur.append_rubrique_from_path('006', "Localité", mapping, le_path + 'getDefaultAddress/zipCode/city')
        else:
            # TODO code pays
            emetteur.append_rubrique('007', "Pays", country_code)
            emetteur.append_rubrique_from_path('008', "Code de distribution à l'étranger ", mapping,
                                               le_path + 'getDefaultAddress/zipCode/zipCode')
        self.append_sub_bloc(emetteur)

    def append_contact_emetteur(self, mapping):
        contact = Bloc.create_bloc_from_label('Contact Emetteur')
        # GAP Civilité hard coded
        ce_path = "getClaimTaxDeductionFlowConfig/getCustomerContact_PASRAUEmission/"
        email = xpath_get(mapping, ce_path + "eMail")
        email = email.replace("_", "")
        contact.append_rubrique('001', 'Code civilité', '01')
        contact.append_rubrique_from_path('002', 'Nom et prénom de la personne à contacter', mapping,
                                          "getClaimTaxDeductionFlowConfig/getContactName_PASRAUEmission")
        contact.append_rubrique('004', 'Adresse mél du contact émetteur', email)
        contact.append_rubrique_from_path('005', 'Adresse téléphonique', mapping, ce_path + "privateFixedPhone")
        self.append_sub_bloc(contact)

    def append_pasrau(self, mapping):
        pasrau = Bloc.create_bloc_from_label('PASRAU')
        pasrau.append_rubrique('001', 'Nature de la déclaration', '11')
        pasrau.append_rubrique('002', 'Type de la déclaration', '01')
        pasrau.append_rubrique('003', 'Numéro de fraction de déclaration', '11')
        pasrau.append_rubrique('004', "Numéro d'ordre de la déclaration", '0')
        # TODO Manage dates
        # changed function argument and taken the maping and convered date accordingly
        declaration_month = xpath_get(mapping, 'month')
        declaration_year = xpath_get(mapping, 'year')
        decclaration_date_str = '010' + str(Months[declaration_month]) + str(declaration_year)
        pasrau.append_rubrique('005', 'Date du mois principal déclaré', decclaration_date_str)
        # Current date when the file is being genereted
        creationdate = datetime.now().strftime("%d%m")+str(datetime.now().year)
        pasrau.append_rubrique('007', 'Date de constitution du fichier', creationdate)
        pasrau.append_rubrique('010', 'Devise de la déclaration', '01')
        self.append_sub_bloc(pasrau)
        return pasrau

    def append_contact_declare(self, mapping):
        contact = Bloc.create_bloc_from_label('Contact chez le déclaré')
        cd_path = "getClaimTaxDeductionFlowConfig/getCustomerContact_PASRAUDeclaration/"
        email = xpath_get(mapping, cd_path+"eMail")
        email = email.replace("_", "")
        contact.append_rubrique_from_path('001', 'Nom et prénom du contact',
                                          mapping, "getClaimTaxDeductionFlowConfig/getContactName_PASRAUDeclaration")
        contact.append_rubrique_from_path('002', 'Adresse téléphonique', mapping, cd_path + "privateFixedPhone")
        contact.append_rubrique('003', 'Adresse mél du contact émetteur', email)
        contact.append_rubrique('004', 'Type', '11')
        self.append_sub_bloc(contact)

    def append_entreprise(self, mapping):
        entreprise = Bloc.create_bloc_from_label('Entreprise')
        le_path = 'getClaimTaxDeductionFlowConfig/legalEntity/'
        siret = xpath_get(mapping, le_path+'sIRET')
        country_code = xpath_get(mapping, le_path + 'getDefaultAddress/getCountryShortCode')
        entreprise.append_rubrique('001', 'SIREN', siret[:9])
        entreprise.append_rubrique('002', 'NIC du siège', siret[9:])
        # TODO Code apen not hard coded
        # taken industrial classification code and remove the char '.' from string
        indclassif_code = xpath_get(mapping, le_path+'getIndustrialClassificationCode')
        indclassif_code = indclassif_code.replace(".", "")
        entreprise.append_rubrique('003', 'Code APEN', indclassif_code)
        entreprise.append_rubrique_from_path('004', "Numéro, extension, nature et libellé de la voie",
                                             mapping, le_path+'getDefaultAddress/line1')
        # entreprise.append_rubrique('004', 'Type', '11')
        if isbelongtofrance(country_code):
            entreprise.append_rubrique_from_path('005', 'Code postal', mapping,
                                                 le_path + 'getDefaultAddress/zipCode/zipCode')
            entreprise.append_rubrique_from_path('006', 'Localité', mapping, le_path + 'getDefaultAddress/zipCode/city')
        else:
            entreprise.append_rubrique('010', "Pays", country_code)
            entreprise.append_rubrique_from_path('011', "Code de distribution à l'étranger ",
                                                 mapping, le_path + 'getDefaultAddress/zipCode/zipCode')
        self.append_sub_bloc(entreprise)
        return entreprise

    def append_etablissement(self, mapping):
        etablissement = Bloc.create_bloc_from_label('Etablissement')
        le_path = 'getClaimTaxDeductionFlowConfig/legalEntity/'
        siret = xpath_get(mapping, le_path+'sIRET')
        country_code = xpath_get(mapping, le_path + 'getDefaultAddress/getCountryShortCode')
        etablissement.append_rubrique('001', 'NIC', siret[9:])
        # TODO Code apet not hard coded
        # taken industrial classification code and remove the char '.' from string
        indclassif_code = xpath_get(mapping, le_path+'getIndustrialClassificationCode')
        indclassif_code = indclassif_code.replace(".", "")
        etablissement.append_rubrique('002', 'Code APET', indclassif_code)
        etablissement.append_rubrique_from_path('003', 'Numéro, extension, nature et libellé de la voie',
                                                mapping, le_path+'getDefaultAddress/line1')
        if isbelongtofrance(country_code):
            etablissement.append_rubrique_from_path('004', 'Code postal ', mapping,
                                                    le_path + 'getDefaultAddress/zipCode/zipCode')
            etablissement.append_rubrique_from_path('005', 'Localité ', mapping,
                                                    le_path + 'getDefaultAddress/zipCode/city')
        else:
            etablissement.append_rubrique('015', "Pays", country_code)
            etablissement.append_rubrique_from_path('016', "Code de distribution à l'étranger ",
                                                    mapping, le_path + 'getDefaultAddress/zipCode/zipCode')
        self.append_sub_bloc(etablissement)
        return etablissement

    def append_versement_organisme(self, mapping):
        versement = Bloc.create_bloc_from_label('Versement organisme')
        versement.append_rubrique('001', 'Identifiant organisme', 'DGFiP')
        versement.append_rubrique_from_path('003', 'BIC', mapping, "getClaimTaxDeductionFlowConfig/bankAccount/bIC")
        versement.append_rubrique_from_path('004', 'IBAN', mapping, "getClaimTaxDeductionFlowConfig/bankAccount/iBAN")
        amount = xpath_get(mapping, "globalAmount/amount")
        versement.append_rubrique('005', 'Montant du versement', "{0:.2f}".format(amount))
        # TODO not hard coded periode de rattachement
        # taken first date of dclaraton month
        declarationmonth = xpath_get(mapping, 'month')
        declarationyear = xpath_get(mapping, 'year')
        decclaration_date_str = '010' + str(Months[declarationmonth]) + str(declarationyear)
        versement.append_rubrique('006', 'Date de début de période de rattachement', decclaration_date_str)
        # taken last day of that month
        declaration_last_day = str(calendar.monthrange(declarationyear, Months[declarationmonth])[-1]) + '0' + str(
            Months[declarationmonth]) + str(declarationyear)
        versement.append_rubrique('007', 'Date de fin de période de rattachement', declaration_last_day)
        versement.append_rubrique('010', 'Mode de paiement', '05')
        self.append_sub_bloc(versement)

    def append_individu(self, mapping):
        individu = Bloc.create_bloc_from_label('Individu')
        idividu_addr_path = 'person/getDefaultAddress/'
        ssn = xpath_get(mapping, "person/getSSNNumber")
        country_code = xpath_get(mapping, idividu_addr_path+'getCountryShortCode')
        individu.append_rubrique('001', "Numéro d'inscription au répertoire", ssn[:-2])
        individu.append_rubrique_from_path('002', 'Nom de famille', mapping, "person/name")
        individu.append_rubrique_from_path('003', 'Nom d\'usage', mapping, "person/priorName")
        individu.append_rubrique_from_path('004', 'Prénoms', mapping, "person/shortName")
        gender_str = xpath_get(mapping, "person/gender")
        individu.append_rubrique('005', 'Sexe', Gender[gender_str])
        birth_date_str = xpath_get(mapping, "person/birthDate")
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        individu.append_rubrique('006', 'Date de naissance', birth_date.strftime("%d%m%Y"))
        individu.append_rubrique_from_path('007', 'Lieu de naissance', mapping, "person/birthPlace/city")
        individu.append_rubrique_from_path('008', 'Numéro, extension, nature et libellé de la voie',
                                           mapping, idividu_addr_path + 'line1')
        if isbelongtofrance(country_code):
            individu.append_rubrique_from_path('009', 'Code postal ',
                                               mapping, idividu_addr_path + 'zipCode/zipCode')
            individu.append_rubrique_from_path('010', 'Localité ',
                                               mapping, idividu_addr_path + 'zipCode/city')
        else:
            individu.append_rubrique('011', "Pays", country_code)
            individu.append_rubrique_from_path('012', "Code de distribution à l'étranger ", mapping,
                                               Idividu_Addr_path + 'zipCode/zipCode')
        # TODO Country code
        # AppendRubriqueFromPath(b, '011', 'Code pays', data, "person/birthCountry")
        birth_zip = xpath_get(mapping, 'person/birthPlace/zipCode')
        birth_country = xpath_get(mapping, 'person/birthCountry')
        birth_country_code = xpath_get(mapping, 'person/getShortCodeOfbirthCountry')
        if birth_country_code in FrenchCountry_Code_list:
            if birth_zip[:2] != 20:
                birth_zipcode = birth_zip[:2]
            else:
                if birth_date.year < 1976:
                    birth_zipcode = '20'
                else:
                    if birth_zip[2] == '2':
                        birth_zipcode = '2B'
                    else:
                        birth_zipcode = '2A'
        else:
            birth_zipcode = '99'
        individu.append_rubrique('014', 'Code département de naissance',  birth_zipcode)
        individu.append_rubrique('015', 'Code pays de naissance', birth_Country_Code)
        self.append_sub_bloc(individu)
        return individu

    def append_versement_individu(self, mapping):
        versement = Bloc.create_bloc_from_label('Versement individu')
        # TODO Date
        versement.append_rubrique('001', 'Date de versement', '01012018')
        rate = xpath_get(mapping, 'getTaxRate')
        tax_amount = xpath_get(mapping, 'getTaxAmount/amount')
        # TODO Rémunération nette fiscale
        net_fiscal = tax_amount / rate
        versement.append_rubrique('002', 'Rémunération nette fiscale', "{0:.2f}".format(net_fiscal))
        versement.append_rubrique('003', 'Numéro de versement', '1')
        versement.append_rubrique('006', 'Taux de prélèvement à la source', "{0:.2f}".format(rate))
        # TODO => manage different type du taux / rubrique 008 id
        # either we write a function to get 007 type de taux or
        tax_name = xpath_get(mapping, 'GetTaxname')
        if "Metropole" in tax_name:
            tax_code = '17'
        elif 'Guadeloupe' in tax_name:
            tax_code = '27'
        elif 'GuyaneMayotte' in tax_name:
            tax_code = '37'
        else:
            tax_code = '01'
        versement.append_rubrique('007', 'Type du taux de prélèvement à la source', tax_code)
        if tax_code == '01':
            versement.append_rubrique_from_path('008', 'Identifiant du taux de prélèvement à la source', mapping,
                                                'getIdentifier')
        versement.append_rubrique('009', 'Montant du prélèvement à la source', "{0:.2f}".format(tax_amount))
        self.append_sub_bloc(versement)

    def total_rubrique(self):
        """Give the total number of rubriques (lines) in the file"""
        result = len(self.rubriques)
        for sub in self.sub_blocs:
            result += sub.total_rubrique()
        return result

    def append_total(self):
        total = Bloc.create_bloc_from_label("Total de l'envoi")
        total_rubrique = self.total_rubrique() + 2  # Add the 2 rubriques that has not been added yet
        total.append_rubrique('001', 'Nombre total de rubriques', str(total_rubrique))
        total.append_rubrique('002', 'Nombre de déclarations', "1")
        self.append_sub_bloc(total)


def create_pasrau_file_from_mapping(file, jsonfile):
    with open(file, 'r', encoding="UTF8") as fl:
        data = json.load(fl)
        root = Bloc(0, 'Root', [], [])
        root.append_envoi()
        root.append_emetteur(data)
        root.append_contact_emetteur(data)
        pasrau = root.append_pasrau(data)
        pasrau.append_contact_declare(data)
        entreprise = pasrau.append_entreprise(data)
        etablissement = entreprise.append_etablissement(data)
        etablissement.append_versement_organisme(data)
        for individu_data in data['getListWithPersonDeductions']:
            individu = etablissement.append_individu(individu_data)
            for versement_data in individu_data['claimLogs']:
                individu.append_versement_individu(versement_data)
        root.append_total()
    pasrau_file = jsonfile.replace(".json", "")+".pasrau"
    of = out_pasrau_path+pasrau_file
    with open(of, 'w', encoding="ISO 8859-1") as f:
        root.write(f)
    if connection_check():
        subprocess.call([pasrau_path+'fr.cnav.norme.neorau.val.product-win32.win32.x86_64\\Validation_pasrau.bat', of],
                        stdout=sys.stdout)
    else:
        print(f"Connection is not avalable,cannot validate pasrau file")


json_files = [x for x in os.listdir(json_folder_path) if x.endswith("json")]
for json_file in json_files:
    json_file_path = os.path.join(json_folder_path, json_file)
    create_pasrau_file_from_mapping(json_file_path, json_file)
    if not os.path.exists(json_folder_path + 'Archive'):
        os.makedirs(json_folder_path + 'Archive')
    if os.path.isfile(json_folder_path + 'Archive//'+json_file):
        shutil.copy2(json_file_path, json_folder_path + 'Archive')
        os.remove(json_file_path)
    else:
        shutil.move(json_file_path, json_folder_path + 'Archive')
