import json
import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from .config import settings
from .database import engine, Base, get_db
from . import models, schemas, auth, ai_matching

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development we allow all; customize for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists"
        )
    
    hashed_pw = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_pw,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Pre-create candidate profile or company profile depending on role
    if user.role == "candidate":
        profile = models.Profile(
            user_id=user.id,
            full_name=user.email.split("@")[0].title(),
            city="Nukus"
        )
        db.add(profile)
    elif user.role == "company":
        company = models.Company(
            user_id=user.id,
            name=f"{user.email.split('@')[0].upper()} Corp",
            verified=False # Requires admin verification
        )
        db.add(company)
        
    db.commit()
    return user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retrieve user's name
    name = user.email.split("@")[0].title()
    if user.role == "candidate" and user.profile:
        name = user.profile.full_name
    elif user.role == "company" and user.company:
        name = user.company.name

    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": name
    }

# --- CANDIDATE PROFILE ENDPOINTS ---

@app.get("/api/profile", response_model=schemas.ProfileResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "candidate":
        raise HTTPException(status_code=400, detail="User is not a candidate")
    if not current_user.profile:
        # Fallback profile creation
        profile = models.Profile(user_id=current_user.id, full_name=current_user.email.split("@")[0].title())
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return current_user.profile

@app.put("/api/profile", response_model=schemas.ProfileResponse)
def update_profile(
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=400, detail="User is not a candidate")
        
    profile = current_user.profile
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@app.post("/api/profile/upload-cv", response_model=schemas.ProfileResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=400, detail="User is not a candidate")
        
    file_bytes = await file.read()
    
    # Call local AI CV Parser
    parsed_data = ai_matching.parse_cv_pdf(file_bytes)
    
    if "error" in parsed_data:
        raise HTTPException(status_code=400, detail=parsed_data["error"])
        
    profile = current_user.profile
    profile.cv_filename = file.filename
    profile.cv_parsed_text = parsed_data.get("raw_text", "")
    profile.cv_parsing_status = "parsed"
    
    # Autofill profile details if parsed
    if parsed_data.get("full_name") and parsed_data["full_name"] != "Candidate Name":
        profile.full_name = parsed_data["full_name"]
    if parsed_data.get("skills"):
        # Append or overwrite skills
        profile.skills = parsed_data["skills"]
    if parsed_data.get("telegram"):
        profile.telegram = parsed_data["telegram"]
    if parsed_data.get("github"):
        profile.github = parsed_data["github"]
    if parsed_data.get("linkedin"):
        profile.linkedin = parsed_data["linkedin"]
        
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

# --- COMPANY ENDPOINTS ---

@app.get("/api/companies", response_model=List[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).filter(models.Company.verified == True).all()

@app.get("/api/companies/pending", response_model=List[schemas.CompanyResponse])
def get_pending_companies(
    admin: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Company).filter(models.Company.verified == False).all()

@app.post("/api/companies/{id}/verify", response_model=schemas.CompanyResponse)
def verify_company(
    id: int,
    admin: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    company = db.query(models.Company).filter(models.Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.verified = True
    db.commit()
    db.refresh(company)
    return company

@app.get("/api/companies/my", response_model=schemas.CompanyResponse)
def get_my_company(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "company":
        raise HTTPException(status_code=400, detail="User is not a company rep")
    if not current_user.company:
        company = models.Company(user_id=current_user.id, name=f"{current_user.email.split('@')[0].upper()} Corp")
        db.add(company)
        db.commit()
        db.refresh(company)
    return current_user.company

@app.put("/api/companies/my", response_model=schemas.CompanyResponse)
def update_my_company(
    company_in: schemas.CompanyUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "company":
        raise HTTPException(status_code=400, detail="User is not a company rep")
        
    company = current_user.company
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
        
    db.commit()
    db.refresh(company)
    return company

# --- JOB VACANCY ENDPOINTS ---

@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def get_jobs(
    q: Optional[str] = None,
    city: Optional[str] = None,
    type: Optional[str] = None,
    experience_level: Optional[str] = None,
    skills: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Job).filter(models.Job.active == True)
    
    if q:
        query = query.filter(
            (models.Job.title.ilike(f"%{q}%")) | 
            (models.Job.description.ilike(f"%{q}%"))
        )
    if city:
        query = query.filter(models.Job.city.ilike(f"%{city}%"))
    if type:
        query = query.filter(models.Job.type == type)
    if experience_level:
        query = query.filter(models.Job.experience_level == experience_level)
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        for s in skill_list:
            query = query.filter(models.Job.skills.ilike(f"%{s}%"))
            
    return query.order_by(models.Job.created_at.desc()).all()

@app.get("/api/jobs/my", response_model=List[schemas.JobResponse])
def get_my_jobs(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "company":
        raise HTTPException(status_code=400, detail="User is not a company")
    return db.query(models.Job).filter(models.Job.company_id == current_user.company.id).all()

@app.get("/api/jobs/{id}", response_model=schemas.JobResponse)
def get_job(id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/api/jobs", response_model=schemas.JobResponse)
def create_job(
    job_in: schemas.JobCreate,
    current_user: models.User = Depends(auth.require_company),
    db: Session = Depends(get_db)
):
    # Verify company is approved
    if not current_user.company.verified:
        raise HTTPException(
            status_code=403,
            detail="Your company account is pending moderator approval. You cannot post jobs yet."
        )
        
    job = models.Job(
        company_id=current_user.company.id,
        **job_in.model_dump()
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@app.put("/api/jobs/{id}", response_model=schemas.JobResponse)
def update_job(
    id: int,
    job_in: schemas.JobUpdate,
    current_user: models.User = Depends(auth.require_company),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(
        models.Job.id == id,
        models.Job.company_id == current_user.company.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
        
    update_data = job_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
        
    db.commit()
    db.refresh(job)
    return job

# --- JOB APPLICATION & AI MATCHING ENDPOINTS ---

@app.post("/api/jobs/{id}/apply", response_model=schemas.ApplicationResponse)
def apply_to_job(
    id: int,
    app_in: schemas.ApplicationCreate,
    current_user: models.User = Depends(auth.require_candidate),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(models.Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Candidate profile not set up")
        
    # Check duplicate application
    existing_app = db.query(models.Application).filter(
        models.Application.job_id == id,
        models.Application.candidate_id == profile.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    # Perform AI matching score calculation
    match_result = ai_matching.calculate_match(
        candidate_skills_str=profile.skills,
        candidate_experience=profile.experience or "",
        candidate_bio=profile.bio or "",
        job_skills_str=job.skills,
        job_description=job.description,
        job_requirements=job.requirements
    )

    db_app = models.Application(
        job_id=id,
        candidate_id=profile.id,
        cover_letter=app_in.cover_letter,
        match_score=match_result["score"],
        match_details=match_result
    )
    
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@app.get("/api/jobs/{id}/applications", response_model=List[schemas.ApplicationResponse])
def get_job_applications(
    id: int,
    current_user: models.User = Depends(auth.require_recruiter_or_admin),
    db: Session = Depends(get_db)
):
    if current_user.role == "company":
        job = db.query(models.Job).filter(
            models.Job.id == id,
            models.Job.company_id == current_user.company.id
        ).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or unauthorized")
            
    # Return all applications sorted by matching score descending
    return db.query(models.Application).filter(
        models.Application.job_id == id
    ).order_by(models.Application.match_score.desc()).all()

@app.get("/api/applications", response_model=List[schemas.ApplicationResponse])
def get_my_applications(
    current_user: models.User = Depends(auth.require_candidate),
    db: Session = Depends(get_db)
):
    return db.query(models.Application).filter(
        models.Application.candidate_id == current_user.profile.id
    ).order_by(models.Application.created_at.desc()).all()

@app.put("/api/applications/{id}", response_model=schemas.ApplicationResponse)
def update_application_status(
    id: int,
    app_in: schemas.ApplicationUpdate,
    current_user: models.User = Depends(auth.require_recruiter_or_admin),
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Recruiter can only update status if application belongs to their job
    if current_user.role == "company" and application.job.company_id != current_user.company.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    application.status = app_in.status
    db.commit()
    db.refresh(application)
    return application

# --- ROBOTICS ENDPOINTS ---

@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()

@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(
    project_in: schemas.ProjectCreate,
    current_user: models.User = Depends(auth.get_current_user), # Candidates/companies can share robotics projects
    db: Session = Depends(get_db)
):
    project = models.Project(**project_in.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# --- STARTUP TEAM BUILDER ENDPOINTS ---

@app.get("/api/team-requests", response_model=List[schemas.TeamRequestResponse])
def get_team_requests(db: Session = Depends(get_db)):
    return db.query(models.TeamRequest).order_by(models.TeamRequest.created_at.desc()).all()

@app.post("/api/team-requests", response_model=schemas.TeamRequestResponse)
def create_team_request(
    request_in: schemas.TeamRequestCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    request = models.TeamRequest(**request_in.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

# --- INTERNSHIP ENDPOINTS ---

@app.get("/api/internships", response_model=List[schemas.InternshipResponse])
def get_internships(
    program_type: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Internship)
    if program_type:
        query = query.filter(models.Internship.program_type == program_type)
    if city:
        query = query.filter(models.Internship.city.ilike(f"%{city}%"))
    return query.order_by(models.Internship.created_at.desc()).all()

@app.post("/api/internships", response_model=schemas.InternshipResponse)
def create_internship(
    internship_in: schemas.InternshipCreate,
    current_user: models.User = Depends(auth.require_recruiter_or_admin),
    db: Session = Depends(get_db)
):
    internship = models.Internship(**internship_in.model_dump())
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship

# --- AI RECOMMENDATIONS & LABOR ANALYTICS ---

@app.get("/api/analytics/recommender", response_model=List[schemas.JobResponse])
def get_ai_recommendations(
    current_user: models.User = Depends(auth.require_candidate),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile or not profile.skills:
        # Default to latest jobs if profile skills are empty
        return db.query(models.Job).filter(models.Job.active == True).order_by(models.Job.created_at.desc()).limit(5).all()

    # Load all active jobs
    jobs = db.query(models.Job).filter(models.Job.active == True).all()
    recommended_jobs = []

    # Simple rank by matching score
    for job in jobs:
        match_result = ai_matching.calculate_match(
            candidate_skills_str=profile.skills,
            candidate_experience=profile.experience or "",
            candidate_bio=profile.bio or "",
            job_skills_str=job.skills,
            job_description=job.description,
            job_requirements=job.requirements
        )
        if match_result["score"] >= 40:  # Only recommend jobs with at least 40% match
            recommended_jobs.append((job, match_result["score"]))
            
    # Sort by matching score descending
    recommended_jobs.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in recommended_jobs[:5]] # Top 5 recommendations

@app.get("/api/analytics/market", response_model=schemas.MarketStatsResponse)
def get_market_analytics(db: Session = Depends(get_db)):
    total_candidates = db.query(models.Profile).count()
    total_companies = db.query(models.Company).filter(models.Company.verified == True).count()
    total_jobs = db.query(models.Job).filter(models.Job.active == True).count()

    # 1. Calculate top skills requested
    all_jobs = db.query(models.Job.skills).filter(models.Job.active == True).all()
    skill_counts = {}
    for j_skills, in all_jobs:
        if j_skills:
            for s in j_skills.split(","):
                s = s.strip()
                if s:
                    # Clean/normalize
                    s_clean = s.title()
                    skill_counts[s_clean] = skill_counts.get(s_clean, 0) + 1
                    
    top_skills = [
        schemas.SkillStat(skill=k, count=v) 
        for k, v in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    ]
    
    # Fallback to defaults if no jobs seeded yet
    if not top_skills:
        top_skills = [
            schemas.SkillStat(skill="Python", count=18),
            schemas.SkillStat(skill="JavaScript", count=15),
            schemas.SkillStat(skill="TypeScript", count=12),
            schemas.SkillStat(skill="Next.js", count=10),
            schemas.SkillStat(skill="FastAPI", count=8),
            schemas.SkillStat(skill="Arduino / IoT", count=6),
        ]

    # 2. Average Salaries (Grouped by Experience Level)
    experience_levels = ["junior", "middle", "senior", "lead"]
    avg_salaries = []
    for el in experience_levels:
        avg_res = db.query(
            func.avg(models.Job.salary_min), 
            func.avg(models.Job.salary_max)
        ).filter(
            models.Job.experience_level == el,
            models.Job.active == True
        ).first()
        
        # Calculate overall average
        min_s = avg_res[0] or 0
        max_s = avg_res[1] or 0
        overall_avg = (min_s + max_s) / 2
        
        # Default mock salaries in UZS if no data is found in DB
        defaults = {
            "junior": 4_500_000,
            "middle": 10_000_000,
            "senior": 20_000_000,
            "lead": 32_000_000
        }
        
        avg_salaries.append(
            schemas.SalaryStat(
                experience_level=el.title(),
                average_salary=overall_avg if overall_avg > 0 else defaults[el],
                currency="UZS"
            )
        )

    # 3. Regional Distribution
    cities_in_kk = ["Nukus", "Khojeyli", "Kungrad", "Muynak", "Chimbay", "Turtkul", "Beruni"]
    regional_dist = []
    for city in cities_in_kk:
        cand_count = db.query(models.Profile).filter(models.Profile.city.ilike(city)).count()
        job_count = db.query(models.Job).filter(models.Job.city.ilike(city), models.Job.active == True).count()
        regional_dist.append(
            schemas.RegionStat(
                city=city,
                candidate_count=cand_count,
                job_count=job_count
            )
        )

    return schemas.MarketStatsResponse(
        total_candidates=total_candidates,
        total_companies=total_companies,
        total_jobs=total_jobs,
        demanded_skills=top_skills,
        average_salaries=avg_salaries,
        regional_distribution=regional_dist
    )
