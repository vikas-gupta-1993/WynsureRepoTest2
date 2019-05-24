import json
from datetime import datetime
from typing import List
from dataclasses import dataclass
import os
import logging
import calendar
import sys
import shutil
import urllib.request
import urllib.error
import shutil
from Norm import BLOCS, R_BLOCS, MONTHS, GENDER, FRENCH_COUNTRYCODE


def setup_logger(log_file):
    logger = logging.getLogger(__name__)
    filehandler = logging.FileHandler(log_file, mode='a')
    filehandler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s : %(message)s'))
    streamhandler = logging.StreamHandler()
    streamhandler.setFormatter(logging.Formatter('%(levelname)s : %(message)s'))
    logger.setLevel(level=logging.DEBUG)
    logger.addHandler(filehandler)
    logger.addHandler(streamhandler)
    return logger


def create_dir(path):
    """Creating directoty if not Exsist."""
    os.makedirs(path, exist_ok=True)
    return path


def get_valid_directory_path(dir_path):
    """Checking and returning the valid Directory."""
    path = ''
    for x in dir_path.split(os.sep):
        path = path+x
        if not os.path.exists(path):
            log.error(f"not found the path {path}")
            raise ValueError(f"not a valid directory {path}")
        path = path+os.sep
    return path


def xpath_get(mapping, path):
    elem = mapping
    try:
        for x in path.strip("/").split("/"):
            elem = elem.get(x)
    except AttributeError:
        pass
    if not elem:
        log.warning(f"Can not find element for path '{path}'")
    return elem


def isbelong_france(country_code):
    if country_code in FRENCH_COUNTRYCODE:
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
    id: str
    label: str
    rubriques: List[Rubrique]
    sub_blocs: List['Bloc']

    @classmethod
    def create_bloc(cls, bloc_id):
        try:
            return cls(bloc_id, BLOCS[bloc_id], [], [])
        except KeyError:
            raise KeyError(f"Error cannot find id for bloc creation  id: {bloc_id}")

    @classmethod
    def create_bloc_from_label(cls, label):
        try:
            return cls(R_BLOCS[label], label, [], [])
        except KeyError:
            raise KeyError(f"Error cannot find label for bloc creation  label: {label}")

    def append_rubrique(self, rubrique_id, label, value):
        self.rubriques.append(Rubrique(rubrique_id, label, value))

    def append_rubrique_from_path(self, rubrique_id, label, mapping, path):
        value = str(xpath_get(mapping, path))
        self.append_rubrique(rubrique_id, label, value)

    def append_sub_bloc(self, sub):
        self.sub_blocs.append(sub)

    def append_address(self, rubrique_id, mapping, defaultaddress_path):
        country_code = xpath_get(mapping, defaultaddress_path+'getCountryShortCode')
        if isbelong_france(country_code):
            self.append_rubrique_from_path(rubrique_id[0], "Code postal",
                                           mapping, defaultaddress_path+'zipCode/zipCode')
            self.append_rubrique_from_path(rubrique_id[1], "Localité", mapping, defaultaddress_path+'zipCode/city')
        else:
            self.append_rubrique(rubrique_id[2], "Pays", country_code)
            self.append_rubrique_from_path(rubrique_id[3], "Code de distribution à l'étranger ",
                                           mapping, defaultaddress_path+'zipCode/zipCode')

    def is_regularisation_not_found(self, mapping):
        reverse_log = xpath_get(mapping, 'reversedLog')
        if reverse_log is None:
            return True

    def write(self, pasrau_file):
        for r in self.rubriques:
            pasrau_file.write(str(self.id) + '.' + str(r.id) + ',' + "'" + r.value + "'" + "\n")
        for b in self.sub_blocs:
            b.write(pasrau_file)

    def append_envoi(self, wynsure_version):
        envoi = Bloc.create_bloc_from_label('Envoi')
        envoi.append_rubrique('001', 'Nom du logiciel utilisé', 'Wynsure')
        envoi.append_rubrique('002', "Nom de l'éditeur", 'MPHASIS WYDE')
        envoi.append_rubrique('003', 'Numéro de version du logiciel utilisé', wynsure_version)
        envoi.append_rubrique('005', "Code envoi du fichier d'essai ou réel", '02')
        envoi.append_rubrique('006', 'Numéro de version de la norme utilisée', '201710')
        envoi.append_rubrique('008', "Type de l'envoi", '01')
        self.append_sub_bloc(envoi)

    def append_emetteur(self, mapping):
        le_path = 'getClaimTaxDeductionFlowConfig/legalEntity/'
        emetteur = Bloc.create_bloc_from_label('Emetteur')
        siret = xpath_get(mapping, le_path+'sIRET')
        emetteur.append_rubrique('001', "Siren de l'émetteur de l'envoi", siret[:9])
        emetteur.append_rubrique('002', "Nic de l'émetteur de l'envoi", siret[9:])
        emetteur.append_rubrique_from_path('003', "Nom ou raison sociale de l'émetteur", mapping, le_path + 'name')
        emetteur.append_rubrique_from_path('004', "Numéro, extension, nature et libellé de la voie", mapping,
                                           le_path + 'getDefaultAddress/line1')
        emetteur.append_address(('005', '006', '007', '008'), mapping, le_path+'getDefaultAddress/')
        self.append_sub_bloc(emetteur)

    def append_contact_emetteur(self, mapping):
        contact = Bloc.create_bloc_from_label('Contact Emetteur')
        ce_path = "getClaimTaxDeductionFlowConfig/getCustomerContact_PASRAUEmission/"
        email = xpath_get(mapping, ce_path + "eMail").replace("_", "")
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
        declaration_month = xpath_get(mapping, 'month')
        declaration_year = xpath_get(mapping, 'year')
        declaration_date = '01' + MONTHS[declaration_month] + str(declaration_year)
        pasrau.append_rubrique('005', 'Date du mois principal déclaré', declaration_date)
        """ Current date of file being generated """
        creation_date = datetime.now().strftime("%d%m%Y")
        pasrau.append_rubrique('007', 'Date de constitution du fichier', creation_date)
        pasrau.append_rubrique('009', 'Identifiant métier', str(declaration_year) + MONTHS[declaration_month] + '01')
        pasrau.append_rubrique('010', 'Devise de la déclaration', '01')
        self.append_sub_bloc(pasrau)
        return pasrau

    def append_contact_declare(self, mapping):
        contact = Bloc.create_bloc_from_label('Contact chez le déclaré')
        cd_path = "getClaimTaxDeductionFlowConfig/getCustomerContact_PASRAUDeclaration/"
        email = xpath_get(mapping, cd_path+"eMail").replace("_", "")
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
        entreprise.append_rubrique('001', 'SIREN', siret[:9])
        entreprise.append_rubrique('002', 'NIC du siège', siret[9:])
        """"Industrial classification code should be value of code appen"""
        indclassif_code = xpath_get(mapping, le_path+'getIndustrialClassificationCode').replace(".", "")
        entreprise.append_rubrique('003', 'Code APEN', indclassif_code)
        entreprise.append_rubrique_from_path('004', "Numéro, extension, nature et libellé de la voie",
                                             mapping, le_path+'getDefaultAddress/line1')
        entreprise.append_address(('005', '006', '010', '011'), mapping, le_path + 'getDefaultAddress/')
        self.append_sub_bloc(entreprise)
        return entreprise

    def append_etablissement(self, mapping):
        etablissement = Bloc.create_bloc_from_label('Etablissement')
        le_path = 'getClaimTaxDeductionFlowConfig/legalEntity/'
        siret = xpath_get(mapping, le_path+'sIRET')
        etablissement.append_rubrique('001', 'NIC', siret[9:])
        """"Industrial classification code should be value of code appet"""
        indclassif_code = xpath_get(mapping, le_path+'getIndustrialClassificationCode').replace(".", "")
        etablissement.append_rubrique('002', 'Code APET', indclassif_code)
        etablissement.append_rubrique_from_path('003', 'Numéro, extension, nature et libellé de la voie',
                                                mapping, le_path+'getDefaultAddress/line1')
        etablissement.append_address(('004', '005', '015', '016'), mapping, le_path + 'getDefaultAddress/')
        self.append_sub_bloc(etablissement)
        return etablissement

    def append_versement_organisme(self, mapping):
        versement = Bloc.create_bloc_from_label('Versement organisme')
        versement.append_rubrique('001', 'Identifiant organisme', 'DGFiP')
        versement.append_rubrique_from_path('003', 'BIC', mapping, "getClaimTaxDeductionFlowConfig/bankAccount/bIC")
        versement.append_rubrique_from_path('004', 'IBAN', mapping, "getClaimTaxDeductionFlowConfig/bankAccount/iBAN")
        amount = xpath_get(mapping, "globalAmount/amount")
        versement.append_rubrique('005', 'Montant du versement', "{0:.2f}".format(amount))
        """First day of month of declaration"""
        declarationmonth = xpath_get(mapping, 'month')
        declarationyear = xpath_get(mapping, 'year')
        declaration_date = '01' + MONTHS[declarationmonth] + str(declarationyear)
        versement.append_rubrique('006', 'Date de début de période de rattachement', declaration_date)
        """last day of month of declaration """
        declaration_last_day = str(calendar.monthrange(declarationyear,
                                                       int(MONTHS[declarationmonth]))[-1]) + MONTHS[declarationmonth]
        declaration_last_day = declaration_last_day + str(declarationyear)
        versement.append_rubrique('007', 'Date de fin de période de rattachement', declaration_last_day)
        versement.append_rubrique('010', 'Mode de paiement', '05')
        self.append_sub_bloc(versement)

    def append_individu(self, mapping):
        individu = Bloc.create_bloc_from_label('Individu')
        idividu_addr_path = 'person/getDefaultAddress/'
        ssn = xpath_get(mapping, "person/getSSNNumber")
        individu.append_rubrique('001', "Numéro d'inscription au répertoire", ssn[:-2])
        individu.append_rubrique_from_path('002', 'Nom de famille', mapping, "person/name")
        individu.append_rubrique_from_path('003', 'Nom d\'usage', mapping, "person/shortName")
        individu.append_rubrique_from_path('004', 'Prénoms', mapping, "person/shortName")
        gender_str = xpath_get(mapping, "person/gender")
        individu.append_rubrique('005', 'Sexe', GENDER[gender_str])
        birth_date_str = xpath_get(mapping, "person/birthDate")
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        individu.append_rubrique('006', 'Date de naissance', birth_date.strftime("%d%m%Y"))
        individu.append_rubrique_from_path('007', 'Lieu de naissance', mapping, "person/birthPlace/city")
        individu.append_rubrique_from_path('008', 'Numéro, extension, nature et libellé de la voie',
                                           mapping, idividu_addr_path + 'line1')
        individu.append_address(('009', '010', '011', '012'), mapping, idividu_addr_path)
        birth_zip = xpath_get(mapping, 'person/birthPlace/zipCode')
        birth_country_code = xpath_get(mapping, 'person/getShortCodeOfbirthCountry')
        """ birth zipcode should be according to nom """
        if birth_country_code in FRENCH_COUNTRYCODE:
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
        individu.append_rubrique('015', 'Code pays de naissance', birth_country_code)
        self.append_sub_bloc(individu)
        return individu

    def append_versement_individu(self, mapping):
        versement = Bloc.create_bloc_from_label('Versement individu')
        reverse_log = xpath_get(mapping, 'reversedLog')
        disbursement_date_str = xpath_get(mapping, 'getDisbursementDate')
        disbursement_date = datetime.strptime(disbursement_date_str, "%Y-%m-%d")
        versement.append_rubrique('001', 'Date de versement', disbursement_date.strftime("%d%m%Y"))
        rate = xpath_get(mapping, 'getTaxRate')
        identifier = xpath_get(mapping, 'getIdentifier')
        is_default_taxrate = xpath_get(mapping, 'isDefaultTaxRate')
        tax_amount = xpath_get(mapping, 'amount/amount')
        # need to do Rémunération nette fiscale
        net_fiscal = tax_amount / rate
        versement.append_rubrique('002', 'Rémunération nette fiscale', "{0:.2f}".format(net_fiscal))
        versement.append_rubrique('003', 'Numéro de versement', '1')
        versement.append_rubrique('006', 'Taux de prélèvement à la source', "{0:.2f}".format(rate))
        """ according to tax tax code will be given in file """
        tax_name = xpath_get(mapping, 'getTaxname')
        tax_code = ''
        if identifier == '' or is_default_taxrate == 'true':
            if "Metropole" in tax_name:
                tax_code = '17'
            elif 'Guadeloupe' in tax_name:
                tax_code = '27'
            elif 'GuyaneMayotte' in tax_name:
                tax_code = '37'
            else:
                log.warning(f"Not matching with any of tax")
        else:
            tax_code = '01'
        versement.append_rubrique('007', 'Type du taux de prélèvement à la source', tax_code)
        if tax_code == '01':
            versement.append_rubrique_from_path('008', 'Identifiant du taux de prélèvement à la source', mapping,
                                                'getIdentifier')
        if reverse_log is None:
            versement.append_rubrique('009', 'Montant du prélèvement à la source', "{0:.2f}".format(tax_amount))
        else:
            versement.append_rubrique('009', 'Montant du prélèvement à la source', '0.00')
        self.append_sub_bloc(versement)
        return versement

    def append_regularisation(self, mapping):
        reverse_tax_amount = xpath_get(mapping, 'amount/amount')
        reverse_tax_rate = xpath_get(mapping, 'reversedLog/getTaxRate')
        regularisation = Bloc.create_bloc_from_label('Régularisation du prélèvement à la source')
        regularisation.append_rubrique_from_path('001', 'Mois de l\'erreur', mapping, 'GetMonthAndYear')
        regularisation.append_rubrique('002', 'Type d\'erreur', '03')
        regularisation.append_rubrique('003', 'Régularisation de la rémunération nette fiscale',
                                       "{0:.2f}".format(reverse_tax_amount))
        regularisation.append_rubrique('006', 'Taux déclaré le mois de l’erreur',
                                       "{0:.2f}".format(reverse_tax_rate))
        regularisation.append_rubrique('007', 'Montant de la régularisation du prélèvement à'
                                              ' la source', "{0:.2f}".format(reverse_tax_amount))
        self.append_sub_bloc(regularisation)

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


def create_pasrau_file_from_mapping(json_file, out_pasrau_path, wynsure_version):
    with open(json_file, 'r', encoding="UTF8") as fl:
        data = json.load(fl)
        root = Bloc('0', 'Root', [], [])
        root.append_envoi(wynsure_version)
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
                versement = individu.append_versement_individu(versement_data)
                if not versement.is_regularisation_not_found(versement_data):
                    versement.append_regularisation(versement_data)
        root.append_total()
    pasrau_file = (str(json_file).split('\\'))[-1].replace(".json", "")+".pasrau"
    out_pasrau = os.path.join(out_pasrau_path, pasrau_file)
    with open(out_pasrau, 'w', encoding="ISO 8859-1") as f:
        root.write(f)


def manage_pasrau(config):
    """managing the Pasrau file"""
    global log
    input_json = get_valid_directory_path(os.path.join(config.get('WydeEnvironment', 'wf-root'),
                                                       'batch', 'OUT_APPLI', 'PASRAU'))
    out_python = get_valid_directory_path(os.path.join(config.get('WydeEnvironment', 'wf-root'), 'batch', 'OUT_PYTHON'))
    out_pasrau = create_dir(os.path.join(out_python, 'PASRAU'))
    python_log = get_valid_directory_path(os.path.join(config.get('WydeEnvironment', 'env-root'), 'Log', 'Python'))
    pasrau = get_valid_directory_path(os.path.join(config.get('WydeEnvironment', 'wf-root'), 'Python', 'Pasrau_File'))
    wyn_version = config.get('WydeEnvironment', 'wynsure-version')
    log = setup_logger(os.path.join(python_log, datetime.now().strftime("%d%m%Y")) + '.log')
    log.info(f"Json Folder : {input_json}")
    log.info(f"pasrau Folder : {out_pasrau}")
    log.info(f"log folder : {python_log}")
    log.info(f"Pasrau.py: {pasrau}")
    json_files = [x for x in os.listdir(input_json) if x.endswith("json")]
    if len(json_files) == 0:
        log.info('No json file is available for convert Pasrau file')
    else:
        log.info(f"total {len(json_files)} number of json file has been executed for converting pasrau file.")
        log.info(f"Please see more log detail in {(datetime.now().strftime('%d%m%Y')) + '.log'} file")
    for json_file in json_files:
        json_file_path = os.path.join(input_json, json_file)
        try:
            create_pasrau_file_from_mapping(json_file_path, out_pasrau, wyn_version)
        except Exception as e:
            log.error(f"Exception While running Pasrau.py : {str(e)} "
                      f"For more log please find log file {python_log} ")
            log.exception(f"Exception in in Pasrau py:{str(e)}")
            raise
        archive_dir = create_dir(os.path.join(input_json, 'Archive'))
        if os.path.isfile(os.path.join(input_json, 'Archive', json_file)):
            shutil.copy2(json_file_path, archive_dir)
            os.remove(json_file_path)
        else:
            shutil.move(json_file_path, archive_dir)
