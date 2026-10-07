import os
import re
import uuid
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Annotated, Optional

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from bson import ObjectId
from fastapi import FastAPI, APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from email_service import enquiry_email_html, send_email
from storage import APP_NAME, init_storage, put_object

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
NOTIFY_EMAIL = os.environ["ENQUIRY_NOTIFY_EMAIL"]
MAX_UPLOAD = 5 * 1024 * 1024
ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt"}

app = FastAPI(title="Twisty Wrap Enterprises API")
api = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class Enquiry(BaseDocument):
    reference: str
    created_at: str
    full_name: str
    company: str
    email: EmailStr
    phone: str
    city: str = ""
    product: str = ""
    quantity: str = ""
    specification: str = ""
    message: str = ""
    source_page: str = ""
    attachment_name: Optional[str] = None
    attachment_path: Optional[str] = None
    email_status: str = "pending"


class EnquiryReceipt(BaseModel):
    reference: str
    created_at: str
    message: str


async def notify(enquiry_id: str, data: dict):
    try:
        await send_email(to=NOTIFY_EMAIL, subject=f"New enquiry: {data.get('product') or 'General'} — {data['company']}",
                         html=enquiry_email_html(data))
        status = "sent"
    except Exception as e:
        logger.error(f"Enquiry email failed: {e}")
        status = "failed"
    await db.enquiries.update_one({"_id": ObjectId(enquiry_id)}, {"$set": {"email_status": status}})


def clean(v: Optional[str], limit: int) -> str:
    return (v or "").strip()[:limit]


@api.get("/")
async def root():
    return {"message": "Twisty Wrap Enterprises API", "status": "ok"}


@api.post("/enquiries", response_model=EnquiryReceipt, status_code=201)
async def create_enquiry(
    background: BackgroundTasks,
    full_name: str = Form(...),
    company: str = Form(...),
    email: EmailStr = Form(...),
    phone: str = Form(...),
    city: str = Form(""),
    product: str = Form(""),
    quantity: str = Form(""),
    specification: str = Form(""),
    message: str = Form(""),
    source_page: str = Form(""),
    attachment: Optional[UploadFile] = File(None),
):
    if not all(x.strip() for x in (full_name, company, phone)):
        raise HTTPException(status_code=422, detail="Name, company and phone are required")
    reference = "TWE-" + uuid.uuid4().hex[:8].upper()
    att_name = att_path = None
    if attachment is not None and attachment.filename:
        ext = Path(attachment.filename).suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(status_code=422, detail="Unsupported attachment type")
        content = await attachment.read(MAX_UPLOAD + 1)
        if len(content) > MAX_UPLOAD:
            raise HTTPException(status_code=413, detail="Attachment must be 5 MB or smaller")
        att_name = re.sub(r"[^A-Za-z0-9._-]", "_", attachment.filename)[:120]
        path = f"{APP_NAME}/enquiries/{reference}/{uuid.uuid4()}{ext}"
        try:
            stored = await asyncio.to_thread(put_object, path, content, attachment.content_type or "application/octet-stream")
        except Exception as e:
            logger.error(f"Attachment upload failed: {e}")
            raise HTTPException(status_code=502, detail="Attachment upload failed, please try again")
        att_path = stored["path"]
    enquiry = Enquiry(
        reference=reference, created_at=datetime.now(timezone.utc).isoformat(),
        full_name=clean(full_name, 120), company=clean(company, 160), email=email, phone=clean(phone, 40),
        city=clean(city, 120), product=clean(product, 200), quantity=clean(quantity, 120),
        specification=clean(specification, 300), message=clean(message, 4000), source_page=clean(source_page, 300),
        attachment_name=att_name, attachment_path=att_path,
    )
    result = await db.enquiries.insert_one(enquiry.to_mongo())
    background.add_task(notify, str(result.inserted_id), enquiry.model_dump())
    return EnquiryReceipt(reference=reference, created_at=enquiry.created_at,
                          message="Thank you for your enquiry. Our team will review your requirements and get back to you shortly.")


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
