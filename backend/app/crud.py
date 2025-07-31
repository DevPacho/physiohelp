from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, date  

from . import models, schemas


# User functions
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_identification(db: Session, identification: str):
    return db.query(models.User).filter(models.User.identification == identification).first()

def get_users(db: Session, offset: int = 0, limit: int = 12):
    return db.query(models.User).offset(offset).limit(limit).all()

def get_users_count(db: Session):
    return db.query(models.User).count()

def get_total_users(db: Session):
    return db.query(models.User).count()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user_update.dict(exclude_unset=True).items():
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


# Medical Record functions
def get_medical_record(db: Session, medical_record_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()

def get_medical_record_by_user(db: Session, user_identification: str):
    """Buscar medical record por identificación del usuario"""
    user = get_user_by_identification(db, user_identification)
    if user:
        return db.query(models.MedicalRecord).filter(models.MedicalRecord.user_id == user.id).first()
    return None

def get_medical_records(db: Session, offset: int = 0, limit: int = 12):
    return db.query(models.MedicalRecord).offset(offset).limit(limit).all()

def get_medical_records_count(db: Session):
    return db.query(models.MedicalRecord).count()

def create_user_medical_record(db: Session, medical_record: schemas.MedicalRecordCreate, user_identification: str):
    """Crear medical record usando la identificación del usuario"""
    user = get_user_by_identification(db, user_identification)
    if not user:
        return None
    
    medical_record_data = medical_record.dict()
    
    if medical_record_data.get('date') and isinstance(medical_record_data['date'], str):
        try:
            medical_record_data['date'] = datetime.strptime(medical_record_data['date'], '%Y-%m-%d').date()
        except ValueError:
            try:
                medical_record_data['date'] = datetime.strptime(medical_record_data['date'], '%d/%m/%Y').date()
            except ValueError:
                medical_record_data['date'] = None
    
    db_medical_record = models.MedicalRecord(**medical_record_data, user_id=user.id)
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record

def update_medical_record(db: Session, record_id: int, medical_record_update: schemas.MedicalRecordUpdate):
    """Actualizar medical record por ID"""
    db_medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if db_medical_record:
        update_data = medical_record_update.dict(exclude_unset=True)
        
        if 'date' in update_data and update_data['date'] and isinstance(update_data['date'], str):
            try:
                update_data['date'] = datetime.strptime(update_data['date'], '%Y-%m-%d').date()
            except ValueError:
                try:
                    update_data['date'] = datetime.strptime(update_data['date'], '%d/%m/%Y').date()
                except ValueError:
                    update_data['date'] = None
        
        for key, value in update_data.items():
            setattr(db_medical_record, key, value)
        db.commit()
        db.refresh(db_medical_record)
    return db_medical_record

def create_evolution(db: Session, evolution: schemas.EvolutionCreate, medical_record_id: int):
    evolution_data = evolution.dict()
    
    if evolution_data.get('date') and isinstance(evolution_data['date'], str):
        try:
            evolution_data['date'] = datetime.strptime(evolution_data['date'], '%Y-%m-%d').date()
        except ValueError:
            try:
                evolution_data['date'] = datetime.strptime(evolution_data['date'], '%d/%m/%Y').date()
            except ValueError:
                raise ValueError('Invalid date format')
    
    db_evolution = models.Evolution(**evolution_data, medical_record_id=medical_record_id)
    db.add(db_evolution)
    db.commit()
    db.refresh(db_evolution)
    return db_evolution

def update_evolution(db: Session, evolution_id: int, evolution: schemas.EvolutionUpdate):
    db_evolution = db.query(models.Evolution).filter(models.Evolution.id == evolution_id).first()
    if db_evolution:
        update_data = evolution.dict(exclude_unset=True)
        
        if 'date' in update_data and update_data['date'] and isinstance(update_data['date'], str):
            try:
                update_data['date'] = datetime.strptime(update_data['date'], '%Y-%m-%d').date()
            except ValueError:
                try:
                    update_data['date'] = datetime.strptime(update_data['date'], '%d/%m/%Y').date()
                except ValueError:
                    raise ValueError('Invalid date format')
        
        for key, value in update_data.items():
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