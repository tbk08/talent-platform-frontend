from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- AUTH & USER ---
class UserBase(BaseModel):
    email: EmailStr
    role: str = "candidate"  # candidate, company, admin

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- CANDIDATE PROFILE ---
class ProfileBase(BaseModel):
    full_name: str
    bio: Optional[str] = None
    city: str = "Nukus"
    skills: str = ""  # Comma-separated tags
    experience: Optional[str] = ""
    education: Optional[str] = ""
    current_position: Optional[str] = None
    status: str = "open_to_work"
    github: Optional[str] = None
    linkedin: Optional[str] = None
    telegram: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    current_position: Optional[str] = None
    status: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    telegram: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    cv_filename: Optional[str] = None
    cv_parsing_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- COMPANY PROFILE ---
class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    user_id: int
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- JOB VACANCY ---
class JobBase(BaseModel):
    title: str
    description: str
    requirements: str
    skills: str = ""  # Comma-separated tags
    type: str = "office"  # remote, hybrid, office
    experience_level: str = "middle"  # junior, middle, senior, lead
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "UZS"
    city: str = "Nukus"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    skills: Optional[str] = None
    type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    city: Optional[str] = None
    active: Optional[bool] = None

class JobResponse(JobBase):
    id: int
    company_id: int
    active: bool
    created_at: datetime
    company: Optional[CompanyResponse] = None

    class Config:
        from_attributes = True

# --- JOB APPLICATION & AI MATCHING ---
class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    cover_letter: Optional[str] = None
    match_score: float
    match_details: Optional[Dict[str, Any]] = None
    created_at: datetime
    job: Optional[JobResponse] = None
    candidate: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

# --- ROBOTICS PLATFORM ---
class ProjectBase(BaseModel):
    title: str
    description: str
    team_name: Optional[str] = None
    lead_name: Optional[str] = None
    tech_stack: str = ""
    hardware_used: str = ""
    location: str = "Nukus"
    image_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- STARTUP TEAM BUILDER ---
class TeamRequestBase(BaseModel):
    startup_name: str
    description: str
    looking_for: str  # e.g., Co-founder, Frontend Developer
    skills_required: str = ""
    contact_email: EmailStr

class TeamRequestCreate(TeamRequestBase):
    pass

class TeamRequestResponse(TeamRequestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- INTERNSHIPS ---
class InternshipBase(BaseModel):
    company_name: str
    title: str
    description: str
    duration: str = "3 months"
    requirements: Optional[str] = None
    program_type: str = "junior_program"  # university_practice, graduate_program, junior_program
    city: str = "Nukus"

class InternshipCreate(InternshipBase):
    pass

class InternshipResponse(InternshipBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- ANALYTICS ---
class SkillStat(BaseModel):
    skill: str
    count: int

class SalaryStat(BaseModel):
    experience_level: str
    average_salary: float
    currency: str

class RegionStat(BaseModel):
    city: str
    candidate_count: int
    job_count: int

class MarketStatsResponse(BaseModel):
    total_candidates: int
    total_companies: int
    total_jobs: int
    demanded_skills: List[SkillStat]
    average_salaries: List[SalaryStat]
    regional_distribution: List[RegionStat]
