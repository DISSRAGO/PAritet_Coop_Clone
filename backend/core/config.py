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


# config.py лежит здесь:
# /srv/clone/cogi_Clone/cogiAPI/app/config.py
#
# parents[0] = app
# parents[1] = cogiAPI
# parents[2] = cogi_Clone
COGI_PROJECT_DIR = Path(
    os.getenv(
        "COGI_PROJECT_DIR",
        Path(__file__).resolve().parents[2],
    )
)

DATA_DIR = Path(os.getenv("COGI_DATA_DIR", COGI_PROJECT_DIR / "data"))
PDF_DIR = DATA_DIR / "pdf"
STYLE_DIR = DATA_DIR / "styles"

STYLE_PATH = os.getenv(
    "COGI_STYLE_PATH",
    "http://localhost:8000/cogi/data/styles/",
)

PDF_PATH = os.getenv(
    "COGI_PDF_PATH",
    "http://localhost:8000/cogi/data/pdf/",
)

SITE_NAVIGATOR_URL = os.getenv(
    "COGI_SITE_NAVIGATOR_URL",
    "http://localhost:3000/navigator/",
)

START_THANKA_ID = os.getenv("COGI_START_THANKA_ID", "18352")