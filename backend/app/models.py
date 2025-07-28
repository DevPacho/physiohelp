from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    last_name = Column(String, index=True)
    identification = Column(String, unique=True, index=True)
    gender = Column(String)

    # Relationship
    medical_record = relationship("MedicalRecord", back_populates="user", uselist=False, cascade="all, delete-orphan")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    user_age = Column(Integer)
    diagnosis = Column(String)
    sessions = Column(Integer)
    consultation_reason = Column(String)
    user_identification = Column(String, ForeignKey("users.identification"))

    # Relationships
    user = relationship("User", back_populates="medical_record")
    evolutions = relationship("Evolution", back_populates="medical_record", cascade="all, delete-orphan")

class Evolution(Base):
    __tablename__ = "evolutions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    observations = Column(String)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))

    # Relationship
    medical_record = relationship("MedicalRecord", back_populates="evolutions")