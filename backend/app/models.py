from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    last_name = Column(String, index=True)
    identification = Column(String, unique=True, index=True)
    gender = Column(String)
    address = Column(String, nullable=True) 
    phone = Column(String, nullable=True) 
    type = Column(String, nullable=True, default="SOAT")  

    # Relationship with MedicalRecord
    medical_record = relationship("MedicalRecord", back_populates="user", uselist=False)

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  
    date = Column(Date, nullable=True)
    user_age = Column(Integer, nullable=True)
    diagnosis = Column(String, nullable=True)
    sessions = Column(Integer, nullable=True)
    consultation_reason = Column(String, nullable=True)
    report = Column(String, nullable=True)

    
    user = relationship("User", back_populates="medical_record")
    evolutions = relationship("Evolution", back_populates="medical_record")

class Evolution(Base):
    __tablename__ = "evolutions"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    date = Column(Date)
    observations = Column(String)

    medical_record = relationship("MedicalRecord", back_populates="evolutions")