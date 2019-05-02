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
    acceptance_user = config.get('WydeEnvironment', 'acceptanceUser')
    acceptance_pass = config.get('WydeEnvironment', 'acceptancePass')
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
    user_name = config.get('WydeEnvironment', 'Wynsure-User')
    user_pass = config.get('WydeEnvironment', 'Wysure-Pass')
    application = config.get('WydeEnvironment', 'application')
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
    endpointurl = config.get('WydeEnvironment', 'EndPointURL')
    print(endpointurl)
    response = requests.post(endpointurl + "restapi/api/rest/wynauth", data=json.dumps(user_info), headers=header, verify=False)
    if response.status_code >= 500:
        crm_log.error(f"[!] [{response.status_code}] Server Error")
        return None
    elif response.status_code == 404:
        crm_log.error(f"[!] [{response.status_code}] URL not found: [{api_url}]")
        return None
    elif response.status_code == 401:
        crm_log.error(f"[!] [{response.status_code}] Authentication Failed")
        return None
    elif response.status_code >= 400:
        crm_log.error(f"[!] [{response.status_code}] Bad Request")
        print(response.content)
        return None
    elif response.status_code >= 300:
        crm_log.error(f"[!] [{response.status_code}] Unexpected redirect.")
        return None
    elif response.status_code == 200:
        crm_log.info(f"succesfully authenticated! [{response.status_code}]")
        token = json.loads(response.content)
        return token
    else:
        crm_log.error(f"[?] Unexpected Error: [HTTP {response.status_code}]: Content: {response.content}")
        return None


def get_header(config):
    acceptance_user = config.get('WydeEnvironment', 'acceptanceUser')
    acceptance_pass = config.get('WydeEnvironment', 'acceptancePass')
    basicauth = bytes(base64.b64encode(bytes('%s:%s' % (acceptance_user, acceptance_pass), 'utf-8'))).decode('utf-8')
    wynauth = get_authorise_token(config)['access_token']
    header = {
        'Content-Type': 'application/json',
        'Authorization': 'basic %s,bearer %s' % (basicauth, wynauth),
        'Accept': '*/*',
        'Host': 'home-env.wynsure.com',
        'Accept-encoding': 'gzip,deflate',
        'Connection': 'keep-alive'
    }
    print(basicauth)
    return header


def get_input_data(root):
    taxRateInputs = []
    identifiant = root.get('identifiant')
    for salarie in root.findall('declaration/declaration_bilan/salarie'):
        salarie_dict = dict()
        salarie_dict['identifier'] = identifiant
        salarie_dict['sSN'] = salarie.find('NIR').text + str(97 - int(salarie.find('NIR').text) % 97)
        salarie_dict['taxData'] = 'Taux Imposition Metropole'
        if len(salarie.findall('taux_imposition_PAS')) > 0:
            salarie_dict['rate'] = salarie.find('taux_imposition_PAS').text
            salarie_dict['DefaultTaxRate'] = 'false'
        else:
            salarie_dict['rate'] = '0.00'
            salarie_dict['DefaultTaxRate'] = 'true'
        salarie_dict['effectiveDate'] = root.findtext('declaration/declaration_identification/identifiant_metier')
        effective_date = datetime.strptime(salarie_dict['effectiveDate'], "%Y-%m-%d")
        next_month = calendar.nextmonth(effective_date.year,effective_date.month)
        end_date = str(next_month[0]) + str(next_month[-1]) + str(calendar.monthrange(next_month[0], next_month[-1])[-1])
        end_date = datetime.strptime(end_date, "%Y%m%d")
        salarie_dict['endDate'] = end_date.strftime("%Y-%m-%d")
        taxRateInputs.append(salarie_dict)
    input_data = {"input": {
        "taxRateInputs": taxRateInputs
    },
        "sIRET": root.findtext('declaration/declaration_identification/SIREN') + root.findtext('declaration/declaration_identification/nic_affectation'),
        "date": datetime.now().strftime('%Y-%m-%d')
    }
    print(input_data)
    return input_data


def manage_pasrau_crm(config):
    global crm_log
    python_log_path = os.path.join(config.get('WydeEnvironment', 'env-root'), 'Log', 'Python')
    crm_log = setup_logger(os.path.join(python_log_path, datetime.now().strftime("%d%m%Y")) + '.log')
    crm_log.info("test")
    input_crm_file_path = os.path.join(config.get('WydeEnvironment', 'wf-root'), 'batch', 'IN_APPLI', 'Pasraucrm')
    if not os.path.exists(input_crm_file_path):
        crm_log.info(f"Create directory for file at location: {input_crm_file_path}")
        os.mkdir(input_crm_file_path)
    python_log_path = os.path.join(config.get('WydeEnvironment', 'env-root'), 'Log', 'Python')
    if not os.path.exists(python_log_path):
        crm_log.info(f"Create directory for file at location: {python_log_path}")
        os.mkdir(python_log_path)
    header = get_header(config)
    endpointurl = config.get('WydeEnvironment', 'EndPointURL')
    crm_files = [x for x in os.listdir(input_crm_file_path) if x.endswith(".xml")]
    for crm_file in crm_files:
        crm_file_path = os.path.join(input_crm_file_path, crm_file)
        root = ET.parse(crm_file_path).getroot()
        input_data = get_input_data(root)
        r = requests.post(endpointurl+"restapi/api/rpc/aSLIFR_Manage_SetPersonOverriddenTaxRate/CreateOverriddenTaxRates", data=json.dumps(input_data), headers=header, verify=False)
        print(r.content)
        crm_log.info(f"output : {r.content}")
        os.makedirs(os.path.join(input_crm_file_path, 'Archive'), exist_ok=True)
        if os.path.isfile(os.path.join(input_crm_file_path, 'Archive', crm_file)):
            shutil.copy2(crm_file_path, os.path.join(input_crm_file_path, 'Archive'))
            os.remove(crm_file_path)
        else:
            shutil.move(crm_file_path, os.path.join(input_crm_file_path, 'Archive'))
