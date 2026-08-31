from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import date, datetime
from typing import Optional, List, Union

# ==================== EVOLUTION SCHEMAS ====================

class EvolutionBase(BaseModel):
    date: str  
    observations: str

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                try:
                    # Convert DD/MM/YYYY to YYYY-MM-DD
                    parsed_date = datetime.strptime(v, '%d/%m/%Y')
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    raise ValueError('Date must be in YYYY-MM-DD or DD/MM/YYYY format')
        elif isinstance(v, datetime):
            return v.strftime('%Y-%m-%d')
        elif isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        else:
            raise ValueError('Date must be a string, date, or datetime object')

class EvolutionCreate(EvolutionBase):
    pass

class EvolutionUpdate(BaseModel):
    date: Optional[str] = None  
    observations: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                try:
                    parsed_date = datetime.strptime(v, '%d/%m/%Y')
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    raise ValueError('Date must be in YYYY-MM-DD or DD/MM/YYYY format')
        elif isinstance(v, datetime):
            return v.strftime('%Y-%m-%d')
        elif isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        else:
            raise ValueError('Date must be a string, date, or datetime object')

class Evolution(EvolutionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    medical_record_id: int
    evolution_number: Optional[int] = None

# ==================== MEDICAL RECORD SCHEMAS ====================

class MedicalRecordBase(BaseModel):
    date: Optional[str] = None  
    user_age: Optional[int] = None
    diagnosis: Optional[str] = None
    sessions: Optional[int] = None
    consultation_reason: Optional[str] = None
    report: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                try:
                    parsed_date = datetime.strptime(v, '%d/%m/%Y')
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    raise ValueError('Date must be in YYYY-MM-DD or DD/MM/YYYY format')
        elif isinstance(v, datetime):
            return v.strftime('%Y-%m-%d')
        elif isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        else:
            raise ValueError('Date must be a string, date, or datetime object')

class MedicalRecordCreate(MedicalRecordBase):
    user_id: int

class MedicalRecordUpdate(BaseModel):
    date: Optional[str] = None  
    user_age: Optional[int] = None
    diagnosis: Optional[str] = None
    sessions: Optional[int] = None
    consultation_reason: Optional[str] = None
    report: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                try:
                    parsed_date = datetime.strptime(v, '%d/%m/%Y')
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    raise ValueError('Date must be in YYYY-MM-DD or DD/MM/YYYY format')
        elif isinstance(v, datetime):
            return v.strftime('%Y-%m-%d')
        elif isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        else:
            raise ValueError('Date must be a string, date, or datetime object')

class MedicalRecord(MedicalRecordBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    

# ==================== USER SCHEMAS ====================

class UserBase(BaseModel):
    name: str
    last_name: str
    identification: str
    gender: str
    address: str = None
    phone: str = None
    type: str = "SOAT"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    identification: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    type: Optional[str] = "SOAT"

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    medical_record: Optional[MedicalRecord] = None

class UserWithMedicalRecord(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    medical_record: Optional[MedicalRecord] = None

# ==================== RESPONSE SCHEMAS ====================

class UserListResponse(BaseModel):
    users: List[User]
    total: int
    offset: int
    limit: int

class PaginationInfo(BaseModel):
    total: int
    page_size: int
    current_offset: int
    has_next: bool
    has_previous: bool

class MedicalRecordListResponse(BaseModel):
    medical_records: List[MedicalRecord]
    pagination: PaginationInfo