from sqlalchemy.orm import Session
from typing import Optional

from . import models, schemas


# User
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_identification(db: Session, identification: str):
    return db.query(models.User).filter(models.User.identification == identification).first()

def get_users(db: Session, offset: int = 0, limit: int = 12):
    return db.query(models.User).offset(offset).limit(limit).all()

def get_users_count(db: Session):
    return db.query(models.User).count()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


# Medical Record
def get_medical_record(db: Session, medical_record_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()

def get_medical_record_by_user_identification(db: Session, user_identification: str):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.user_identification == user_identification).first()

def get_medical_records(db: Session, offset: int = 0, limit: int = 12):
    return db.query(models.MedicalRecord).offset(offset).limit(limit).all()

def get_medical_records_count(db: Session):
    return db.query(models.MedicalRecord).count()

def create_medical_record(db: Session, medical_record: schemas.MedicalRecordCreate, user_identification: str):
    db_medical_record = models.MedicalRecord(**medical_record.dict(), user_identification=user_identification)
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record

def update_medical_record(db: Session, medical_record_id: int, medical_record: schemas.MedicalRecordUpdate):
    db_medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()
    if db_medical_record:
        for key, value in medical_record.dict(exclude_unset=True).items():
            setattr(db_medical_record, key, value)
        db.commit()
        db.refresh(db_medical_record)
    return db_medical_record

def delete_medical_record(db: Session, medical_record_id: int):
    db_medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()
    if db_medical_record:
        db.delete(db_medical_record)
        db.commit()
    return db_medical_record


# Evolutions (Always related to a medical record)
def get_evolution(db: Session, evolution_id: int):
    return db.query(models.Evolution).filter(models.Evolution.id == evolution_id).first()

def get_evolution_by_medical_record(db: Session, medical_record_id: int, evolution_id: int):
    return db.query(models.Evolution).filter(
        models.Evolution.id == evolution_id,
        models.Evolution.medical_record_id == medical_record_id
    ).first()

def create_evolution(db: Session, evolution: schemas.EvolutionCreate, medical_record_id: int):
    db_evolution = models.Evolution(**evolution.dict(), medical_record_id=medical_record_id)
    db.add(db_evolution)
    db.commit()
    db.refresh(db_evolution)
    return db_evolution

def update_evolution(db: Session, evolution_id: int, evolution: schemas.EvolutionUpdate):
    db_evolution = db.query(models.Evolution).filter(models.Evolution.id == evolution_id).first()
    if db_evolution:
        for key, value in evolution.dict(exclude_unset=True).items():
            setattr(db_evolution, key, value)
        db.commit()
        db.refresh(db_evolution)
    return db_evolution

def delete_evolution(db: Session, evolution_id: int):
    db_evolution = db.query(models.Evolution).filter(models.Evolution.id == evolution_id).first()
    if db_evolution:
        db.delete(db_evolution)
        db.commit()
    return db_evolution

def validate_evolution_belongs_to_medical_record(db: Session, evolution_id: int, medical_record_id: int) -> bool:
    """Validate that an evolution belongs to a specific medical record"""
    evolution = db.query(models.Evolution).filter(
        models.Evolution.id == evolution_id,
        models.Evolution.medical_record_id == medical_record_id
    ).first()
    return evolution is not None