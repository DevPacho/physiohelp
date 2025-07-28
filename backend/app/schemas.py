from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List


class EvolutionBase(BaseModel):
    date: date
    observations: str

class EvolutionCreate(EvolutionBase):
    pass

class EvolutionUpdate(BaseModel):
    date: Optional[date] = None
    observations: Optional[str] = None

class Evolution(EvolutionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    medical_record_id: int


class MedicalRecordBase(BaseModel):
    date: date
    user_age: int
    diagnosis: str
    sessions: int
    consultation_reason: str

class MedicalRecordCreate(MedicalRecordBase):
    pass 

class MedicalRecordUpdate(BaseModel):
    date: Optional[date] = None
    user_age: Optional[int] = None
    diagnosis: Optional[str] = None
    sessions: Optional[int] = None
    consultation_reason: Optional[str] = None

class MedicalRecord(MedicalRecordBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_identification: str
    evolutions: List[Evolution] = []


class UserBase(BaseModel):
    name: str
    last_name: str
    identification: str
    gender: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    identification: Optional[str] = None
    gender: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    medical_record: Optional[MedicalRecord] = None 


# Pagination response models
class PaginationInfo(BaseModel):
    total: int
    page_size: int
    current_offset: int
    has_next: bool
    has_previous: bool

class UserListResponse(BaseModel):
    users: List[User]
    pagination: PaginationInfo

class MedicalRecordListResponse(BaseModel):
    medical_records: List[MedicalRecord]
    pagination: PaginationInfo