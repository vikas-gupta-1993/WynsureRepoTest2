import requests
import json
import base64
import urllib3
import os
from xml.etree import ElementTree as ET
from datetime import datetime
import calendar
import shutil
import logging

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


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


def get_basic_header(config):
    acceptance_user = config.get('WydeEnvironment', 'endpoint_user')
    acceptance_pass = config.get('WydeEnvironment', 'endpoint_password')
    basicauth = bytes(base64.b64encode(bytes('%s:%s' % (acceptance_user, acceptance_pass), 'utf-8'))).decode('utf-8')
    header = {
        "Content-Type": "application/json",
        "Authorization": "Basic %s" % basicauth,
        "Accept": "*/*",
        "Host": "home-env.wynsure.com",
        "Accept-encoding": "gzip,deflate",
        "Connection": "keep-alive"
    }
    return header


def get_user_info(config):
    application = config.get('WydeEnvironment', 'application')
    user_name = config.get('Wynsure', 'wynsure_user')
    user_pass = config.get('Wynsure', 'wynsure_password')
    if application == 'wynsuresolution_fr':
        if not user_name:
            user_name = 'Super gestionnaire'
    if application == 'wynsuresolution_US':
        if not user_name:
            user_name = 'Super manager'
    user_info = {
        "login": user_name,
        "password": user_pass,
        "application": application,
    }
    print(user_info)
    return user_info


def get_authorise_token(config):
    header = get_basic_header(config)
    user_info = get_user_info(config)
    endpointurl = config.get('WydeEnvironment', 'endpoint_root_url')
    response = requests.post(f"{endpointurl}restapi/api/rest/wynauth",
                             data=json.dumps(user_info), headers=header, verify=False)
    if response.status_code == 200:
        crm_log.info(f"succesfully authenticated! [{response.status_code}]")
        token = json.loads(response.content)
        return token
    else:
        crm_log.error(f"Error while requesting for authentification token:[{response.status_code}] {response.reason}")


def get_header(config):
    acceptance_user = config.get('WydeEnvironment', 'endpoint_user')
    acceptance_pass = config.get('WydeEnvironment', 'endpoint_password')
    basicauth = bytes(base64.b64encode(bytes('%s:%s' % (acceptance_user, acceptance_pass), 'utf-8'))).decode('utf-8')
    if acceptance_user:
        token = get_authorise_token(config)
        if token:
            access_token = token['access_token']
            if access_token:
                header = {
                    'Content-Type': 'application/json',
                    'Authorization': 'basic %s,bearer %s' % (basicauth, access_token),
                    'Accept': '*/*',
                    'Host': 'home-env.wynsure.com',
                    'Accept-encoding': 'gzip,deflate',
                    'Connection': 'keep-alive'
                }
                return header


def xpath_get(node, path):
    elem = node.findtext(path)
    if not elem:
        crm_log.error(f"Can not find element for path '{path}'")
        raise ValueError(f"Can not find element for path '{path}'")
    return elem


def get_input_data(root):
    taxRateInputs = []
    identifiant = root.get('identifiant')
    for salarie in root.findall('declaration/declaration_bilan/salarie'):
        salarie_dict = dict()
        salarie_dict['identifier'] = identifiant
        salarie_dict['sSN'] = xpath_get(salarie, 'NIR') + str(97 - int(salarie.find('NIR').text) % 97)
        if len(salarie.findall('taux_imposition_PAS')) > 0:
            salarie_dict['rate'] = float(salarie.find('taux_imposition_PAS').text)/100
            salarie_dict['DefaultTaxRate'] = 'false'
        else:
            salarie_dict['rate'] = '0.00'
            salarie_dict['DefaultTaxRate'] = 'true'
        salarie_dict['effectiveDate'] = xpath_get(root, 'declaration/declaration_identification/identifiant_metier')
        taxRateInputs.append(salarie_dict)
    input_data = {"input": {
        "taxRateInputs": taxRateInputs
    },
        "sIRET": xpath_get(root, 'declaration/declaration_identification/SIREN')
        + xpath_get(root, 'declaration/declaration_identification/nic_affectation'),
        "date": datetime.now().strftime('%Y-%m-%d')
    }
    return input_data


def manage_pasrau_crm(config):
    global crm_log
    python_log_path = os.path.join(config.get('WydeEnvironment', 'env-root'), 'Log', 'Python')
    crm_log = setup_logger(os.path.join(python_log_path, datetime.now().strftime("%d%m%Y")) + '.log')
    pasrau_crm_input = config.get('PASRAU_CRM', 'pasrau_crm_input')
    if pasrau_crm_input:
        input_crm_file_path = pasrau_crm_input
    else:
        input_crm_file_path = os.path.join(config.get('WydeEnvironment', 'wf-root'), 'batch', 'IN_APPLI', 'PASRAUCRM')
    if not os.path.exists(input_crm_file_path):
        crm_log.info(f"Create directory for file at location: {input_crm_file_path}")
        os.mkdir(input_crm_file_path)
    if not os.path.exists(python_log_path):
        crm_log.info(f"Create directory for file at location: {python_log_path}")
        os.mkdir(python_log_path)
    os.makedirs(os.path.join(input_crm_file_path, 'Archive'), exist_ok=True)
    header = get_header(config)
    user_info = get_user_info(config)
    basic_auth_bytes = bytes(
        base64.b64encode(bytes('%s:%s' % (user_info['login'], user_info['password']), 'utf-8'))).decode('utf-8')
    endpointurl = config.get('WydeEnvironment', 'endpoint_root_url')
    localhost_envurl = config.get('WydeEnvironment', 'localhost_envurl')
    endpoint_suffix = config.get('PASRAU_CRM', 'endpoint_suffix')
    if not endpoint_suffix:
        endpoint_suffix = 'restapi / api / rpc / aSLIFR_Manage_SetPASRAUTaxRate / CreatePasrauTaxRates'
    crm_log.info(f"endpoint url : {endpointurl}")
    crm_log.info(f"endpoint_with_suffix : {endpointurl}{endpoint_suffix}")
    crm_log.info(f"input_crm_file_path : {input_crm_file_path}")
    crm_files = [x for x in os.listdir(input_crm_file_path) if x.endswith(".xml")]
    for crm_file in crm_files:
        crm_file_path = os.path.join(input_crm_file_path, crm_file)
        root = ET.parse(crm_file_path).getroot()
        input_data = get_input_data(root)
        crm_log.info(f"input data of {crm_file}: {input_data} ")
        print(f"header:{header}")
        acceptance_user = config.get('WydeEnvironment', 'endpoint_user')
        # For calling business service on local environment
        if header:
            response = requests.post(f"{endpointurl}{endpoint_suffix}", data=json.dumps(input_data), headers=header,
                                     verify=False)
        else:
            print("Basic %s" % basic_auth_bytes)
            response = requests.post(f"{localhost_envurl}{endpoint_suffix}", data=json.dumps(input_data),
                                     headers={"Authorization": "Basic %s" % basic_auth_bytes}, verify=False)
        if response.status_code == 200:
            crm_log.info(f"succesfully called the business service! [{response.status_code}]")
            output = json.loads(response.content)
            print(output)
            for persontaxdescription in output['_Result']['persontaxdescription']:
                crm_log.info(f"successfully overridden tax rate of Person:{persontaxdescription['name']} {persontaxdescription['firstname']}"
                             f" with ssn: {persontaxdescription['sSN']} and  rate: {persontaxdescription['rate']}")
            for errorPersontaxdescription in output['_Result']['errorPersontaxdescription']:
                if errorPersontaxdescription['name']:
                    crm_log.warning(f"error found overridden tax rate of Person:{errorPersontaxdescription['name']}"
                                    f" {errorPersontaxdescription['firstname']}"
                                    f" ssn:{errorPersontaxdescription['sSN']} error : {errorPersontaxdescription['error']}")
                else:
                    crm_log.warning(f"Not found the person with SSN:{errorPersontaxdescription['sSN']}")
        elif response.status_code == 400:
            output = json.loads(response.content)
            crm_log.info(f"output : {output}")
            crm_log.warning(f"Output::Exception-{output['error']['innererror']['detailsFromException']['error']['errorMessage']}")
            crm_log.warning(f"for more detail of exception {output}[{response.status_code}]")
        else:
            crm_log.error(
                f"Error while requesting for business service:[{response.status_code}] {response.reason}")
        if os.path.isfile(os.path.join(input_crm_file_path, 'Archive', crm_file)):
            shutil.copy2(crm_file_path, os.path.join(input_crm_file_path, 'Archive'))
            os.remove(crm_file_path)
        else:
            shutil.move(crm_file_path, os.path.join(input_crm_file_path, 'Archive'))
