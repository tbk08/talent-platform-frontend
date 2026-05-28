from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from . import models, auth

def seed_db():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding database...")
        
        # 1. CREATE USERS
        
        # Admin
        admin_user = models.User(
            email="admin@ittap.uz",
            hashed_password=auth.get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        
        # Candidates
        c1 = models.User(email="aybek@ittap.uz", hashed_password=auth.get_password_hash("password123"), role="candidate")
        c2 = models.User(email="nilufar@ittap.uz", hashed_password=auth.get_password_hash("password123"), role="candidate")
        c3 = models.User(email="jasur@ittap.uz", hashed_password=auth.get_password_hash("password123"), role="candidate")
        c4 = models.User(email="azat@ittap.uz", hashed_password=auth.get_password_hash("password123"), role="candidate")
        c5 = models.User(email="saodat@ittap.uz", hashed_password=auth.get_password_hash("password123"), role="candidate")
        
        db.add_all([c1, c2, c3, c4, c5])
        db.commit() # Save users to get IDs
        
        # Candidate Profiles
        p1 = models.Profile(
            user_id=c1.id,
            full_name="Aybek Davletov",
            bio="IT student at Karakalpak State University (KSU), passionate about backend web development. Building REST APIs and microservices.",
            city="Nukus",
            skills="Python, FastAPI, SQL, PostgreSQL, Docker, Git, Linux",
            experience="Intern backend developer at KSU computer center (6 months). Built student portal API routes using FastAPI.",
            education="B.S. in Computer Science, Karakalpak State University (Expected 2027)",
            current_position="Backend Developer Student",
            status="open_to_work",
            github="https://github.com/aybek_dev",
            linkedin="https://linkedin.com/in/aybek-davletov",
            telegram="aybek_dev"
        )
        
        p2 = models.Profile(
            user_id=c2.id,
            full_name="Nilufar Temurxanova",
            bio="Self-taught Frontend engineer from Nukus, building beautiful web UIs. Passionate about interactive designs, glassmorphism, and neon aesthetics.",
            city="Nukus",
            skills="JavaScript, TypeScript, React, Next.js, HTML, CSS, Tailwind CSS, Figma, UI/UX",
            experience="Freelance UI/UX designer and React developer (1.5 years). Designed and coded portfolio websites for regional startups.",
            education="Self-taught online bootcamps, IT Park Nukus Web Dev Course graduate",
            current_position="Freelance Frontend Developer",
            status="open_to_work",
            github="https://github.com/nilu_front",
            linkedin="https://linkedin.com/in/nilufar-t",
            telegram="nilu_codes"
        )
        
        p3 = models.Profile(
            user_id=c3.id,
            full_name="Jasur Allambergenov",
            bio="Embedded systems designer and robotics engineer. Winner of regional RoboFest 2025. Love combining hardware and software for ecological IoT projects.",
            city="Khojeyli",
            skills="Arduino, ESP32, C++, Embedded, IoT, Raspberry Pi, ROS, Microcontrollers, Firmware",
            experience="Junior firmware developer at Nukus AgroTech Lab (1 year). Maintained solar-powered soil moisture telemetry sensors.",
            education="Diploma in Electrical Engineering, Khojeyli Technical College",
            current_position="IoT & Embedded Engineer",
            status="open_for_freelance",
            github="https://github.com/jasur_robotics",
            linkedin="https://linkedin.com/in/jasur-allambergenov",
            telegram="jasur_robotics"
        )

        p4 = models.Profile(
            user_id=c4.id,
            full_name="Azat Sabirov",
            bio="Junior python developer. Interested in data analysis and backend systems. Experienced in writing web scrapers and automation scripts.",
            city="Kungrad",
            skills="Python, Django, SQLite, Git, Linux",
            experience="Pet projects: built a telegram bot for Kungrad local train schedules and a web scraper for real estate values.",
            education="A.S. in Applied Mathematics, Kungrad Vocational School",
            current_position="Junior Python Dev",
            status="open_to_work",
            github="https://github.com/azat_kungrad",
            telegram="azat_sabir"
        )
        
        p5 = models.Profile(
            user_id=c5.id,
            full_name="Saodat Joldasbaeva",
            bio="Ex-IT Park Karakalpakstan intern. Managing software product life-cycles, wireframing, and running agile team sprints.",
            city="Nukus",
            skills="Product Management, Figma, Agile, Scrum, UI/UX, Project Management",
            experience="Project assistant at IT Park Karakalpakstan (9 months). Facilitated team communication and helped draft PRDs.",
            education="B.A. in Management, Nukus State Pedagogical Institute",
            current_position="Junior Product Manager",
            status="interviewing",
            linkedin="https://linkedin.com/in/saodat-j",
            telegram="saodat_j"
        )
        
        db.add_all([p1, p2, p3, p4, p5])
        db.commit()
        
        # Companies & Reps
        com1_user = models.User(email="contact@nukussoftware.uz", hashed_password=auth.get_password_hash("company123"), role="company")
        com2_user = models.User(email="hr@karakalpakiot.uz", hashed_password=auth.get_password_hash("company123"), role="company")
        com3_user = models.User(email="info@aralcoding.uz", hashed_password=auth.get_password_hash("company123"), role="company")
        
        db.add_all([com1_user, com2_user, com3_user])
        db.commit()
        
        co1 = models.Company(
            user_id=com1_user.id,
            name="Nukus Software House",
            description="Leading software development house in Karakalpakstan. We build enterprise web portals, accounting ERP systems, and custom automation tools for regional businesses.",
            website="https://nukussoftware.uz",
            address="Tatibayev Str 24, Nukus",
            industry="Software Development",
            verified=True
        )
        
        co2 = models.Company(
            user_id=com2_user.id,
            name="Karakalpak IoT Solutions",
            description="High-tech engineering startup in Nukus. We design smart hardware devices, agricultural sensors, and smart city telemetry tools optimized for the Aral Sea ecological region.",
            website="https://karakalpakiot.uz",
            address="Beruni Avenue, IT Park Building, Nukus",
            industry="IoT & Hardware",
            verified=True
        )
        
        co3 = models.Company(
            user_id=com3_user.id,
            name="Aral Coding Academy & Lab",
            description="Ecosystem center in Muynak offering programming courses and starting a digital agency for localized tourism applications.",
            website="https://aralcoding.uz",
            address="Jalpak Str, Muynak",
            industry="Education & IT Consulting",
            verified=False # Pending admin approval
        )
        
        db.add_all([co1, co2, co3])
        db.commit()
        
        # 2. CREATE JOB VACANCIES
        
        j1 = models.Job(
            company_id=co1.id,
            title="Python Backend Developer",
            description="We are looking for a backend engineer to lead our database and API services. You will build high-quality REST APIs, manage database queries, and deploy applications using Docker.",
            requirements="Excellent Python proficiency. Practical experience with FastAPI or Django. Good knowledge of relational databases (PostgreSQL/SQL). Understanding of git and containerization.",
            skills="Python, FastAPI, PostgreSQL, Docker, Git, SQL",
            type="office",
            experience_level="middle",
            salary_min=10000000,
            salary_max=16000000,
            salary_currency="UZS",
            city="Nukus"
        )
        
        j2 = models.Job(
            company_id=co1.id,
            title="Frontend Developer (React / Next.js)",
            description="Join our product team to build fast, beautiful, responsive user interfaces. You will collaborate with Figma designers and translate designs into robust TypeScript code.",
            requirements="Strong HTML/CSS/JS fundamentals. Production experience with React and Next.js. Familiarity with Tailwind CSS and TypeScript import architectures.",
            skills="JavaScript, TypeScript, React, Next.js, Tailwind CSS, CSS, HTML",
            type="hybrid",
            experience_level="middle",
            salary_min=9000000,
            salary_max=14000000,
            salary_currency="UZS",
            city="Nukus"
        )

        j3 = models.Job(
            company_id=co2.id,
            title="Embedded Systems & IoT Engineer",
            description="We are looking for a hardware-software enthusiast to design microcontroller firmware. You will work on water monitoring sensors and connect them to web servers.",
            requirements="Strong knowledge of C++ and microcontrollers (ESP32, Arduino, STM32). Experience with communication protocols like MQTT, I2C, SPI. Basic electrical knowledge.",
            skills="Arduino, ESP32, C++, Embedded, IoT, Firmware, Microcontrollers",
            type="office",
            experience_level="middle",
            salary_min=8000000,
            salary_max=12000000,
            salary_currency="UZS",
            city="Nukus"
        )

        j4 = models.Job(
            company_id=co2.id,
            title="Junior Python / Data Engineer",
            description="Assist our IoT team in gathering telemetry data, formatting it, and piping it to dashboards. Learn database writing and automated graphing.",
            requirements="Familiarity with Python syntax. Basic understanding of SQL databases. Passion for working with data. Git experience.",
            skills="Python, SQLite, Git, SQL",
            type="remote",
            experience_level="junior",
            salary_min=4500000,
            salary_max=6500000,
            salary_currency="UZS",
            city="Nukus"
        )
        
        db.add_all([j1, j2, j3, j4])
        db.commit()

        # 3. CREATE ROBOTICS PROJECTS
        
        rob1 = models.Project(
            title="Smart Solar Irrigation Controller",
            description="An ESP32-based automated system that monitors soil moisture and regulates water valves. It uses solar panels for self-powering and transmits data via LoRaWAN to a web dashboard, optimized for water saving in Muynak's arid fields.",
            team_name="Aral GreenTech",
            lead_name="Jasur Allambergenov",
            tech_stack="C++, Arduino, LoRaWAN, ESP32",
            hardware_used="ESP32 Module, Capacitive Soil Moisture Sensors, 12V Solenoid Valve, 20W Solar Panel",
            location="Muynak"
        )

        rob2 = models.Project(
            title="Autonomous Trash Sorting Rover",
            description="A wheeled robot that navigates indoor spaces and uses a camera + local tensorflow-lite computer vision on a Raspberry Pi to classify trash (paper, plastic, metal) and sort it using servo-driven arms.",
            team_name="Nukus RoboLab",
            lead_name="Salamat Kdirbaev",
            tech_stack="Python, ROS, C++, Linux",
            hardware_used="Raspberry Pi 4, Arduino Mega, WebCam, DC Gear Motors, SG90 Servos",
            location="Nukus"
        )
        
        db.add_all([rob1, rob2])
        db.commit()

        # 4. CREATE STARTUP TEAM BUILDER REQUESTS
        
        req1 = models.TeamRequest(
            startup_name="Aral Tourism AR Guide",
            description="We are building an augmented reality mobile guide to display historical ships and facts about the Aral Sea museum in Muynak. Need a designer to shape the UX/UI.",
            looking_for="Co-founder & UI/UX Designer",
            skills_required="Figma, UI/UX, React Native",
            contact_email="founder@araltour.uz"
        )

        req2 = models.TeamRequest(
            startup_name="Darya Water Analyzer",
            description="Developing a portable chemical testing device for water salinity. Looking for an IoT programmer to write firmware and send sensor readings to mobile apps.",
            looking_for="Embedded Developer",
            skills_required="C++, Arduino, ESP32, Bluetooth",
            contact_email="hello@daryaiot.uz"
        )
        
        req3 = models.TeamRequest(
            startup_name="Takyir Delivery Bot",
            description="Local Nukus e-commerce delivery startup. Need a web developer to build the storefront dashboard.",
            looking_for="Frontend Developer",
            skills_required="React, TypeScript, Next.js, Tailwind CSS",
            contact_email="hr@takyir.uz"
        )

        db.add_all([req1, req2, req3])
        db.commit()

        # 5. CREATE INTERNSHIPS
        
        int1 = models.Internship(
            company_name="Nukus Software House",
            title="Frontend React Intern",
            description="A structured 3-month paid internship program where you will study advanced React Hooks, CSS state management, and build practical features for real corporate clients. Top performers will get full-time offers.",
            duration="3 months",
            requirements="Basic HTML, CSS, JavaScript. Understanding of JSON and fetch calls. Passion for crafting interfaces.",
            program_type="junior_program",
            city="Nukus"
        )

        int2 = models.Internship(
            company_name="Karakalpak IoT Solutions",
            title="IoT Systems Integrator (University Practice)",
            description="Work closely with senior engineers in our electronics lab. You will assemble, solder, test, and package environmental monitoring sensors. Suitable for KSU or Nukus branch of TUIT engineering students.",
            duration="4 months",
            requirements="Familiarity with electronics basics. Solder skills are a plus. Permission from your academic dean for practice.",
            program_type="university_practice",
            city="Nukus"
        )
        
        int3 = models.Internship(
            company_name="Aral Coding Academy & Lab",
            title="Python backend junior trainee",
            description="Learn server structure in Muynak coding center. Focuses on REST APIs, SQLite, and deployment to Linux VMs.",
            duration="3 months",
            requirements="Familiarity with python syntax. Command line basics.",
            program_type="graduate_program",
            city="Muynak"
        )

        db.add_all([int1, int2, int3])
        db.commit()

        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
