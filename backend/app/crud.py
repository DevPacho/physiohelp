from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy import or_, func
from typing import Optional
from datetime import datetime, date  

from . import models, schemas


# User functions
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_identification(db: Session, identification: str):
    return db.query(models.User).filter(models.User.identification == identification).first()

def get_users(db: Session, skip: int = 0, limit: int = 12):
    return db.query(models.User).order_by(desc(models.User.id)).offset(skip).limit(limit).all()
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
    """Update user by ID"""
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            return None
        
        # Obtener solo los campos que no son None
        update_data = user_update.dict(exclude_unset=True, exclude_none=True)
        
        # Actualizar solo los campos proporcionados
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
        
    except Exception as e:
        print(f"Error in update_user: {str(e)}")
        db.rollback()
        return None

def delete_user(db: Session, user_id: int):
    """Delete user by ID"""
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            return None
        
        # También eliminar el medical record asociado si existe
        db_medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.user_id == user_id).first()
        if db_medical_record:
            # Eliminar evoluciones asociadas
            db.query(models.Evolution).filter(models.Evolution.medical_record_id == db_medical_record.id).delete()
            # Eliminar medical record
            db.delete(db_medical_record)
        
        # Eliminar usuario
        db.delete(db_user)
        db.commit()
        return True
        
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        db.rollback()
        return False

def search_users_by_identification(db: Session, identification: str, skip: int = 0, limit: int = 100):
    """Buscar usuarios por identificación en toda la base de datos"""
    return db.query(models.User).filter(
        models.User.identification.ilike(f"%{identification}%")
    ).offset(skip).limit(limit).all()


def search_users_by_name_or_identification(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Buscar usuarios por nombre, apellido o identificación en toda la base de datos"""
    return db.query(models.User).filter(
        or_(
            models.User.name.ilike(f"%{search_term}%"),
            models.User.last_name.ilike(f"%{search_term}%"),
            models.User.identification.ilike(f"%{search_term}%")
        )
    ).order_by(desc(models.User.id)).offset(skip).limit(limit).all()

def get_users_count_by_search(db: Session, search_term: str):
    """Obtener conteo de usuarios que coinciden con el término de búsqueda"""
    from sqlalchemy import or_
    return db.query(models.User).filter(
        or_(
            models.User.name.ilike(f"%{search_term}%"),
            models.User.last_name.ilike(f"%{search_term}%"),
            models.User.identification.ilike(f"%{search_term}%")
        )
    ).count()

# Medical Record functions

def get_medical_record(db: Session, medical_record_id: int):
    """Obtener una historia clínica por su ID"""
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()


def get_medical_records(db: Session, offset: int = 0, limit: int = 12):
    return db.query(models.MedicalRecord).order_by(desc(models.MedicalRecord.id)).offset(offset).limit(limit).all()

def get_medical_record_by_user_id(db: Session, user_id: int):
    """Obtener historia clínica por ID de usuario"""
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.user_id == user_id).first()


def get_medical_record_by_user(db: Session, user_identification: str):
    """Buscar medical record por identificación del usuario"""
    user = get_user_by_identification(db, user_identification)
    if user:
        return db.query(models.MedicalRecord).filter(models.MedicalRecord.user_id == user.id).first()
    return None


def get_medical_records_count(db: Session):
    return db.query(models.MedicalRecord).count()

def create_user_medical_record(db: Session, medical_record: schemas.MedicalRecordCreate):
    """Crear medical record usando user_id directamente"""
    medical_record_data = medical_record.dict()
    
    # Procesar fecha si existe
    if medical_record_data.get('date') and isinstance(medical_record_data['date'], str):
        try:
            medical_record_data['date'] = datetime.strptime(medical_record_data['date'], '%Y-%m-%d').date()
        except ValueError:
            try:
                medical_record_data['date'] = datetime.strptime(medical_record_data['date'], '%d/%m/%Y').date()
            except ValueError:
                medical_record_data['date'] = None
    
    # Crear el medical record con user_id directamente del schema
    db_medical_record = models.MedicalRecord(
        diagnosis=medical_record.diagnosis,
        user_id=medical_record.user_id,
        date=medical_record_data.get('date'),
        user_age=medical_record.user_age,
        sessions=medical_record.sessions,
        consultation_reason=medical_record.consultation_reason,
        report=medical_record.report
    )
    
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

def delete_medical_record(db: Session, medical_record_id: int):
    """Delete medical record by ID"""
    try:
        db_medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == medical_record_id).first()
        if not db_medical_record:
            return False  
        
        db.query(models.Evolution).filter(models.Evolution.medical_record_id == medical_record_id).delete()
        
        db.delete(db_medical_record)
        db.commit()
        return True
        
    except Exception as e:
        print(f"Error in delete_medical_record: {str(e)}")
        db.rollback()
        return False

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

# Evolution pagination functions
def get_evolutions_by_medical_record(db: Session, medical_record_id: int, offset: int = 0, limit: int = 5):
    """Get paginated evolutions for a medical record, ordered by ID ascending (oldest first)"""
    return db.query(models.Evolution).filter(
        models.Evolution.medical_record_id == medical_record_id
    ).order_by(models.Evolution.id.asc()).offset(offset).limit(limit).all()

def get_evolutions_count_by_medical_record(db: Session, medical_record_id: int):
    """Get total count of evolutions for a medical record"""
    return db.query(models.Evolution).filter(
        models.Evolution.medical_record_id == medical_record_id
    ).count()