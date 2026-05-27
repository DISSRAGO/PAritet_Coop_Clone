import os
from pathlib import Path

HOST = os.getenv("COGI_SOAP_HOST", "https://stend.portmonet.ru")

RKC_PATH = "/csp/rkc/"
SOC_PATH = "/csp/soc/"

ADDRESS_SERVICE = "API2.Social.Address.Service"
LOGIN_SERVICE = "API2.User.Service"
LOGOUT_SERVICE = "API2.OAuth2.Service"
SET_TOKEN_SERVICE = "API2.OAuth2.Service"

REGISTER_SERVICE = "API2.User.ActivationRequestService"
VALIDATE_SERVICE = "API2.User.RegistrationService"
PROFILE_SERVICE = "ApiExt.Paritet.Service"
RESET_PASSWORD_SERVICE = "API2.RestorePassword.Service"
MARKET_SERVICE = "ApiExt.Market.Service"
MARKET_SERVICE1 = "API2.Social.Market.Service"
PAYMENT1_SERVICE = "API2.Interface.Service"
PAYMENT2_SERVICE = "API2.User.ActivationRequestService"
PAYMENT3_SERVICE = "API2.Payment.Transfer.Service"
GROUP_SERVICE = "API2.Social.Group.Service"

COGI_SERVICE = "ApiExt.Cogi.Service"
COGI_COMMUNITY_SERVICE = "ApiExt.Cogi.Community.Service"
COGI_MEMBERS_SERVICE = "ApiExt.Cogi.Members.Service"
COGI_STORY_SERVICE = "ApiExt.Cogi.Story.Service"
COGI_REQUEST_SERVICE = "ApiExt.Cogi.Request.Service"
COGI_PAYMENT_SERVICE = "ApiExt.Cogi.Payment.Service"
COGI_MIGRATION = "ApiExt.Cogi.Migration"
COGI_SITE = "ApiExt.Cogi.SiteConstructor.Service"

# Корень проекта по умолчанию.
# Для backend/modules/cogiteka/core/config.py:
# parents[0] = core
# parents[1] = cogiteka
# parents[2] = modules
# parents[3] = backend
# parents[4] = <repo root>
DEFAULT_ROOT_DIR = Path(__file__).resolve().parents[4]

COGI_PROJECT_DIR = Path(
    os.getenv("COGI_PROJECT_DIR", str(DEFAULT_ROOT_DIR))
).resolve()

DATA_DIR = Path(
    os.getenv("COGI_DATA_DIR", str(COGI_PROJECT_DIR / "data"))
).resolve()

PDF_DIR = DATA_DIR / "pdf"
STYLE_DIR = DATA_DIR / "styles"

STYLE_PATH = os.getenv(
    "COGI_STYLE_PATH",
    "http://localhost:8000/data/styles/",
)

PDF_PATH = os.getenv(
    "COGI_PDF_PATH",
    "http://localhost:8000/data/pdf/",
)

SITE_NAVIGATOR_URL = os.getenv(
    "COGI_SITE_NAVIGATOR_URL",
    "http://localhost:3001/navigator/",
)

START_THANKA_ID = os.getenv("COGI_START_THANKA_ID", "18352")