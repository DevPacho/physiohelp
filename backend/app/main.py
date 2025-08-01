from fastapi import Depends, FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict
import io
from io import BytesIO

from . import crud, models, schemas
from .database import SessionLocal, engine
from .pdf_service import PDFService

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# User endpoints
@app.post("/users/", response_model=schemas.User, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = crud.get_user_by_identification(db, identification=user.identification)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this identification already exists")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=list[schemas.User], tags=["Users"])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = crud.get_users(db, offset=skip, limit=limit)
    return users

@app.get("/users/count", tags=["Users"])
def get_users_count(db: Session = Depends(get_db)):
    """Get total count of users"""
    count = crud.get_users_count(db)
    return {"count": count}

@app.get("/users/{user_id}", response_model=schemas.User, tags=["Users"])
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/identification/{identification}", response_model=schemas.User, tags=["Users"])
def read_user_by_identification(identification: str, db: Session = Depends(get_db)):
    """Get user by identification"""
    db_user = crud.get_user_by_identification(db, identification=identification)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/users/{user_id}", response_model=schemas.User, tags=["Users"])
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update user by ID"""
    try:
        db_user = crud.get_user(db, user_id=user_id)
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = crud.update_user(db=db, user_id=user_id, user_update=user_update)
        if updated_user is None:
            raise HTTPException(status_code=500, detail="Error updating user")
        
        return updated_user
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@app.delete("/users/{user_id}", tags=["Users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user by ID"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = crud.delete_user(db=db, user_id=user_id)
    if success:
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Error deleting user")

@app.post("/users/{user_id}/generate-pdf")
async def generate_user_pdf(
    user_id: int, 
    db: Session = Depends(get_db)
):
    """Genera un reporte PDF - Historia clínica o Informe final según el tipo de paciente"""
    try:
        print(f"Generating PDF for user ID: {user_id}")
        
        user = crud.get_user(db, user_id=user_id)
        if user is None:
            print(f"User not found with ID: {user_id}")
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        print(f"User found: {user.name} {user.last_name}, Type: {user.type}")
        
        # Generar PDF según el tipo de paciente
        if user.type == "Particular":
            print("Generating final report for Particular patient...")
            pdf_buffer = PDFService.generate_final_report(user)
            filename_prefix = "Informe_final"
        else:  # user.type == "SOAT"
            print("Generating medical history for SOAT patient...")
            pdf_buffer = PDFService.generate_user_report(user)
            filename_prefix = "Historia_clinica"
        
        print("PDF generated successfully")
        
        # Preparar respuesta con formato de nombre limpio
        import re
        
        # Limpiar nombre y apellido
        safe_name = re.sub(r'[^\w\s]', '', f"{user.name} {user.last_name}")
        safe_name = re.sub(r'\s+', '_', safe_name.strip())
        
        # Limpiar identificación
        safe_identification = re.sub(r'[^\w]', '', user.identification)
        
        filename = f"{filename_prefix}_{safe_name}_{safe_identification}.pdf"
        
        print(f"Filename: {filename}")
        
        # Asegurarse de que el buffer esté al inicio
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(pdf_buffer.read()),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar PDF: {str(e)}")

# Medical Records endpoints
@app.get("/users/{user_identification}/medical-records/", response_model=schemas.MedicalRecord, tags=["Medical Records"])
def get_medical_record(user_identification: str, db: Session = Depends(get_db)):
    """Get medical record for a user by identification"""
    db_user = crud.get_user_by_identification(db, identification=user_identification)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    medical_record = crud.get_medical_record_by_user(db, user_identification=user_identification)
    if medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return medical_record

@app.get("/medical-records/", response_model=list[schemas.MedicalRecord], tags=["Medical Records"])
def get_all_medical_records(skip: int = 0, limit: int = 12, db: Session = Depends(get_db)):
    """Get all medical records with pagination"""
    medical_records = crud.get_medical_records(db, offset=skip, limit=limit)
    return medical_records

@app.get("/medical-records/count", tags=["Medical Records"])
def get_medical_records_count(db: Session = Depends(get_db)):
    """Get total count of medical records"""
    count = crud.get_medical_records_count(db)
    return {"count": count}

@app.post("/users/{user_identification}/medical-records/", response_model=schemas.MedicalRecord, tags=["Medical Records"])
def create_medical_record(
    user_identification: str, 
    medical_record: schemas.MedicalRecordCreate, 
    db: Session = Depends(get_db)
):
    """Create or update medical record for a user by identification"""
    # Buscar usuario por identificación
    db_user = crud.get_user_by_identification(db, identification=user_identification)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar si ya existe una historia clínica para este usuario
    existing_record = crud.get_medical_record_by_user(db, user_identification=user_identification)
    
    if existing_record:
        # Si existe, actualizarla
        medical_record_update = schemas.MedicalRecordUpdate(**medical_record.model_dump())
        updated_record = crud.update_medical_record(db=db, record_id=existing_record.id, medical_record_update=medical_record_update)
        return updated_record
    else:
        # Si no existe, crear una nueva
        db_medical_record = crud.create_user_medical_record(db=db, medical_record=medical_record, user_identification=user_identification)
        if db_medical_record is None:
            raise HTTPException(status_code=400, detail="Could not create medical record")
        return db_medical_record

@app.put("/users/{user_identification}/medical-records/", response_model=schemas.MedicalRecord, tags=["Medical Records"])
def update_medical_record(
    user_identification: str, 
    medical_record_update: schemas.MedicalRecordUpdate, 
    db: Session = Depends(get_db)
):
    """Update medical record for a user by identification"""
    # Buscar usuario por identificación
    db_user = crud.get_user_by_identification(db, identification=user_identification)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Buscar historia clínica existente
    existing_record = crud.get_medical_record_by_user(db, user_identification=user_identification)
    if existing_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Actualizar
    updated_record = crud.update_medical_record(db=db, record_id=existing_record.id, medical_record_update=medical_record_update)
    return updated_record

@app.delete("/medical-records/{medical_record_id}", tags=["Medical Records"])
def delete_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    """Delete a medical record by ID"""
    # Verificar que el medical record existe
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Eliminar el medical record
    success = crud.delete_medical_record(db=db, medical_record_id=medical_record_id)
    if success:
        return {"message": "Medical record deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Error deleting medical record")

# Evolution endpoints
@app.post("/medical-records/{medical_record_id}/evolutions/", response_model=schemas.Evolution, tags=["Evolutions"])
def create_evolution(
    medical_record_id: int,
    evolution: schemas.EvolutionCreate,
    db: Session = Depends(get_db)
):
    """Create evolution for a medical record"""
    db_evolution = crud.create_evolution(db=db, evolution=evolution, medical_record_id=medical_record_id)
    if db_evolution is None:
        raise HTTPException(status_code=400, detail="Could not create evolution")
    return db_evolution

@app.put("/evolutions/{evolution_id}", response_model=schemas.Evolution, tags=["Evolutions"])
def update_evolution(
    evolution_id: int,
    evolution: schemas.EvolutionUpdate,
    db: Session = Depends(get_db)
):
    """Update evolution by ID"""
    db_evolution = crud.update_evolution(db=db, evolution_id=evolution_id, evolution=evolution)
    if db_evolution is None:
        raise HTTPException(status_code=404, detail="Evolution not found")
    return db_evolution

@app.delete("/evolutions/{evolution_id}", tags=["Evolutions"])
def delete_evolution(evolution_id: int, db: Session = Depends(get_db)):
    """Delete evolution by ID"""
    success = crud.delete_evolution(db=db, evolution_id=evolution_id)
    if success:
        return {"message": "Evolution deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Evolution not found")

@app.get("/medical-records/{medical_record_id}/evolutions/{evolution_id}/validate", tags=["Evolutions"])
def validate_evolution_belongs_to_medical_record(
    medical_record_id: int,
    evolution_id: int,
    db: Session = Depends(get_db)
):
    """Validate that an evolution belongs to a specific medical record"""
    is_valid = crud.validate_evolution_belongs_to_medical_record(
        db=db, 
        evolution_id=evolution_id, 
        medical_record_id=medical_record_id
    )
    return {"is_valid": is_valid}