from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="candidate")  # candidate, company, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    company = relationship("Company", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    city = Column(String, default="Nukus")  # Nukus, Khojeyli, Kungrad, Muynak, etc.
    skills = Column(Text, default="")  # Comma-separated list of skills e.g., "Python, FastAPI, Next.js"
    experience = Column(Text, default="")  # JSON string or text block describing work experience
    education = Column(Text, default="")  # Education history details
    current_position = Column(String, nullable=True)
    status = Column(String, default="open_to_work")  # open_to_work, interviewing, employed, open_for_freelance
    
    # Social links
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    telegram = Column(String, nullable=True)
    
    # CV upload details
    cv_filename = Column(String, nullable=True)
    cv_parsed_text = Column(Text, nullable=True)
    cv_parsing_status = Column(String, default="not_uploaded")  # not_uploaded, parsing, parsed, failed
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    verified = Column(Boolean, default=False)  # Needs admin approval
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    skills = Column(Text, default="")  # Comma-separated list of required skills
    type = Column(String, default="office")  # remote, hybrid, office
    experience_level = Column(String, default="middle")  # junior, middle, senior, lead
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="UZS")
    city = Column(String, default="Nukus")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    status = Column(String, default="applied")  # applied, screening, interview, offer, rejected
    cover_letter = Column(Text, nullable=True)
    match_score = Column(Float, default=0.0)  # Calculated by local AI Matching engine
    match_details = Column(JSON, nullable=True)  # JSON detailing matched/missing skills
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Profile", back_populates="applications")

class Project(Base):
    """Robotics Talent Hub Project"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    team_name = Column(String, nullable=True)
    lead_name = Column(String, nullable=True)
    tech_stack = Column(String, default="")  # Arduino, ESP32, C++, ROS, Raspberry Pi
    hardware_used = Column(String, default="")  # List of hardware
    location = Column(String, default="Nukus")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TeamRequest(Base):
    """Startup Team Builder looking for Co-founders or Developers"""
    __tablename__ = "team_requests"

    id = Column(Integer, primary_key=True, index=True)
    startup_name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    looking_for = Column(String, nullable=False)  # Co-founder, Frontend Dev, UI/UX Designer, PM
    skills_required = Column(String, default="")  # Comma-separated required skills
    contact_email = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Internship(Base):
    """Internship Platform listing opportunities"""
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    duration = Column(String, default="3 months")
    requirements = Column(Text, nullable=True)
    program_type = Column(String, default="junior_program")  # university_practice, graduate_program, junior_program
    city = Column(String, default="Nukus")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
