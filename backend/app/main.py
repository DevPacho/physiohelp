from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy.orm import Session 
from typing import Optional

from . import crud, models, schemas
from .database import SessionLocal, engine 

models.Base.metadata.create_all(bind=engine) 

app = FastAPI(
    title="PhysioHelp API",
    description="API for physiotherapy clinical records management",
    version="1.0.0"
) 

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 

def create_pagination_info(total: int, offset: int, limit: int = 12) -> schemas.PaginationInfo:
    return schemas.PaginationInfo(
        total=total,
        page_size=limit,
        current_offset=offset,
        has_next=offset + limit < total,
        has_previous=offset > 0
    )


# USER ENDPOINTS
@app.post("/users/", response_model=schemas.User, status_code=201, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = crud.get_user_by_identification(db, identification=user.identification)
    if db_user:
        raise HTTPException(status_code=400, detail="Identification already registered")
    return crud.create_user(db=db, user=user) 

@app.get("/users/", response_model=schemas.UserListResponse, tags=["Users"])
def read_users(
    offset: int = Query(0, ge=0, description="Number of records to skip"), 
    db: Session = Depends(get_db)
):
    """Get all users with pagination (12 per page)"""
    users = crud.get_users(db, offset=offset, limit=12)
    total_users = crud.get_users_count(db)
    pagination = create_pagination_info(total_users, offset)
    
    return schemas.UserListResponse(users=users, pagination=pagination)

@app.get("/users/{user_id}", response_model=schemas.User, tags=["Users"])
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user 

@app.put("/users/{user_id}", response_model=schemas.User, tags=["Users"])
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if identification is being updated and if it already exists
    if user.identification and user.identification != db_user.identification:
        existing_user = crud.get_user_by_identification(db, identification=user.identification)
        if existing_user:
            raise HTTPException(status_code=400, detail="Identification already registered")
    
    return crud.update_user(db=db, user_id=user_id, user=user)

@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(db=db, user_id=user_id)


# MEDICAL RECORD ENDPOINTS
@app.post("/users/{user_identification}/medical-records/", response_model=schemas.MedicalRecord, status_code=201, tags=["Medical Records"])
def create_medical_record_for_user(
    user_identification: str, medical_record: schemas.MedicalRecordCreate, db: Session = Depends(get_db)
):
    """Create medical record for user"""
    db_user = crud.get_user_by_identification(db, identification=user_identification)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already has a medical record
    existing_record = crud.get_medical_record_by_user_identification(db, user_identification=user_identification)
    if existing_record:
        raise HTTPException(status_code=400, detail="User already has a medical record")
    
    return crud.create_medical_record(db=db, medical_record=medical_record, user_identification=user_identification)

@app.get("/medical-records/", response_model=schemas.MedicalRecordListResponse, tags=["Medical Records"])
def read_medical_records(
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db)
):
    """Get all medical records with pagination (12 per page) - includes all evolutions"""
    medical_records = crud.get_medical_records(db, offset=offset, limit=12)
    total_records = crud.get_medical_records_count(db)
    pagination = create_pagination_info(total_records, offset)
    
    return schemas.MedicalRecordListResponse(medical_records=medical_records, pagination=pagination)

@app.get("/medical-records/{medical_record_id}", response_model=schemas.MedicalRecord, tags=["Medical Records"])
def read_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    """Get medical record by ID - includes all evolutions"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return db_medical_record

@app.put("/medical-records/{medical_record_id}", response_model=schemas.MedicalRecord, tags=["Medical Records"])
def update_medical_record(medical_record_id: int, medical_record: schemas.MedicalRecordUpdate, db: Session = Depends(get_db)):
    """Update medical record by ID"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return crud.update_medical_record(db=db, medical_record_id=medical_record_id, medical_record=medical_record)

@app.delete("/medical-records/{medical_record_id}", status_code=204, tags=["Medical Records"])
def delete_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    """Delete medical record by ID - cascades to delete all evolutions"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    crud.delete_medical_record(db=db, medical_record_id=medical_record_id)


# EVOLUTION ENDPOINTS (Always within a medical record context)
@app.post("/medical-records/{medical_record_id}/evolutions/", response_model=schemas.Evolution, status_code=201, tags=["Evolutions"])
def create_evolution_for_medical_record(
    medical_record_id: int, evolution: schemas.EvolutionCreate, db: Session = Depends(get_db)
):
    """Create evolution for medical record"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return crud.create_evolution(db=db, evolution=evolution, medical_record_id=medical_record_id)

@app.get("/medical-records/{medical_record_id}/evolutions/{evolution_id}", response_model=schemas.Evolution, tags=["Evolutions"])
def read_evolution_by_medical_record(medical_record_id: int, evolution_id: int, db: Session = Depends(get_db)):
    """Get specific evolution by ID within a medical record"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    db_evolution = crud.get_evolution_by_medical_record(db, medical_record_id=medical_record_id, evolution_id=evolution_id)
    if db_evolution is None:
        raise HTTPException(status_code=404, detail="Evolution not found in this medical record")
    
    return db_evolution

@app.put("/medical-records/{medical_record_id}/evolutions/{evolution_id}", response_model=schemas.Evolution, tags=["Evolutions"])
def update_evolution_by_medical_record(
    medical_record_id: int, evolution_id: int, evolution: schemas.EvolutionUpdate, db: Session = Depends(get_db)
):
    """Update evolution by ID within a medical record"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Validate that the evolution belongs to this medical record
    if not crud.validate_evolution_belongs_to_medical_record(db, evolution_id, medical_record_id):
        raise HTTPException(status_code=404, detail="Evolution not found in this medical record")
    
    updated_evolution = crud.update_evolution(db=db, evolution_id=evolution_id, evolution=evolution)
    if updated_evolution is None:
        raise HTTPException(status_code=404, detail="Evolution not found")
    
    return updated_evolution

@app.delete("/medical-records/{medical_record_id}/evolutions/{evolution_id}", status_code=204, tags=["Evolutions"])
def delete_evolution_by_medical_record(medical_record_id: int, evolution_id: int, db: Session = Depends(get_db)):
    """Delete evolution by ID within a medical record"""
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found for this evolution")
    
    # Validate that the evolution belongs to this medical record
    if not crud.validate_evolution_belongs_to_medical_record(db, evolution_id, medical_record_id):
        raise HTTPException(status_code=404, detail="Evolution not found in this medical record")
    
    crud.delete_evolution(db=db, evolution_id=evolution_id)


# HEALTH CHECK ENDPOINT
@app.get("/health", tags=["Health"])
def health_check():
    """API Health check"""
    return {"status": "healthy", "message": "PhysioHelp API is running"}