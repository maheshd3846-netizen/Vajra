-- VAJRA Migration 00012: Comprehensive Production Demo Dataset (20 Companies & 25 Diverse Internships)

-- 1. Insert 20 Partner Companies into public.companies
INSERT INTO public.companies (
  id,
  name,
  website,
  industry,
  logo_url,
  description,
  is_verified,
  verification_status,
  status,
  official_email,
  contact_email,
  company_size,
  headquarters,
  city,
  state,
  country,
  trust_score,
  created_at,
  updated_at
) VALUES 
('c0000000-0000-0000-0000-000000000001', 'TechNova Solutions', 'https://technovasolutions.io', 'Enterprise Software', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80', 'Leading enterprise cloud transformation and IoT solutions provider powering Fortune 500 digital systems.', true, 'verified', 'active', 'careers@technovasolutions.io', 'contact@technovasolutions.io', '250-500 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 95, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000002', 'ByteForge Technologies', 'https://byteforge.dev', 'Software Development', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80', 'High-growth full-stack software development studio building modern web and mobile applications.', true, 'verified', 'active', 'hr@byteforge.dev', 'contact@byteforge.dev', '50-100 employees', 'Hyderabad, Telangana', 'Hyderabad', 'Telangana', 'India', 92, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000003', 'CloudNest Labs', 'https://cloudnestlabs.com', 'Cloud & DevOps', 'https://images.unsplash.com/photo-1542744094-3a3172720180?w=120&auto=format&fit=crop&q=80', 'Specialized cloud infrastructure, Kubernetes orchestration, and continuous integration architecture consultancy.', true, 'verified', 'active', 'recruitment@cloudnestlabs.com', 'hello@cloudnestlabs.com', '100-250 employees', 'Pune, Maharashtra', 'Pune', 'Maharashtra', 'India', 94, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000004', 'PixelStack Software', 'https://pixelstack.tech', 'Web Engineering', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80', 'Modern web engineering agency pioneering high-performance React and Next.js applications.', true, 'verified', 'active', 'jobs@pixelstack.tech', 'contact@pixelstack.tech', '20-50 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 91, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000005', 'CodeSprint Technologies', 'https://codesprint.in', 'FinTech & Banking', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80', 'Enterprise Java microservices and scalable high-frequency financial platform developers.', true, 'verified', 'active', 'talent@codesprint.in', 'info@codesprint.in', '500+ employees', 'Chennai, Tamil Nadu', 'Chennai', 'Tamil Nadu', 'India', 96, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000006', 'VisionAI Labs', 'https://visionailabs.ai', 'Artificial Intelligence', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80', 'Deep tech AI research studio focused on computer vision, autonomous perception, and robotics.', true, 'verified', 'active', 'careers@visionailabs.ai', 'contact@visionailabs.ai', '50-100 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 98, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000007', 'QuantumSoft Solutions', 'https://quantumsoft.io', 'Data Analytics', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80', 'Big data analytics, business intelligence dashboards, and predictive decision intelligence frameworks.', true, 'verified', 'active', 'hr@quantumsoft.io', 'contact@quantumsoft.io', '100-250 employees', 'Gurugram, Haryana', 'Gurugram', 'Haryana', 'India', 90, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000008', 'SkyNet Digital', 'https://skynetdigital.net', 'Mobile Engineering', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80', 'Mobile-first product lab engineering native Android and cross-platform Flutter applications.', true, 'verified', 'active', 'hiring@skynetdigital.net', 'contact@skynetdigital.net', '50-100 employees', 'Noida, Uttar Pradesh', 'Noida', 'Uttar Pradesh', 'India', 89, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000009', 'NextWave Technologies', 'https://nextwavetech.com', 'Frontend Architecture', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=120&auto=format&fit=crop&q=80', 'Next-generation web UI studio specializing in micro-frontends and modern design systems.', true, 'verified', 'active', 'careers@nextwavetech.com', 'contact@nextwavetech.com', '100-250 employees', 'Hyderabad, Telangana', 'Hyderabad', 'Telangana', 'India', 93, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000010', 'BluePeak Systems', 'https://bluepeaksystems.com', 'Cybersecurity', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80', 'Cyber defense, ethical penetration testing, and Zero Trust security management firm.', true, 'verified', 'active', 'secops@bluepeaksystems.com', 'contact@bluepeaksystems.com', '250-500 employees', 'Mumbai, Maharashtra', 'Mumbai', 'Maharashtra', 'India', 97, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000011', 'Innovexa Solutions', 'https://innovexasolutions.com', 'Full Stack Development', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=80', 'End-to-end MERN stack product incubator powering SaaS startups across Asia and Europe.', true, 'verified', 'active', 'talent@innovexasolutions.com', 'contact@innovexasolutions.com', '50-100 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 92, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000012', 'CoreMatrix Labs', 'https://corematrixlabs.com', 'Backend Engineering', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=120&auto=format&fit=crop&q=80', 'High-throughput enterprise backend engineering firm built on Java Spring and distributed databases.', true, 'verified', 'active', 'careers@corematrixlabs.com', 'contact@corematrixlabs.com', '100-250 employees', 'Pune, Maharashtra', 'Pune', 'Maharashtra', 'India', 94, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000013', 'LogicLoop Software', 'https://logicloopsoftware.io', 'Python & Microservices', 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=120&auto=format&fit=crop&q=80', 'Python microservices and FastAPI architecture specialists for API-driven SaaS platforms.', true, 'verified', 'active', 'hr@logicloopsoftware.io', 'contact@logicloopsoftware.io', '20-50 employees', 'Hyderabad, Telangana', 'Hyderabad', 'Telangana', 'India', 91, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000014', 'InnoSpark Technologies', 'https://innosparktech.com', 'UI/UX & Frontend', 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=120&auto=format&fit=crop&q=80', 'Product design agency creating intuitive UI/UX experiences and responsive React frontends.', true, 'verified', 'active', 'design@innosparktech.com', 'contact@innosparktech.com', '50-100 employees', 'Chennai, Tamil Nadu', 'Chennai', 'Tamil Nadu', 'India', 90, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000015', 'FusionStack Pvt Ltd', 'https://fusionstack.in', 'Data & Distributed Systems', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80', 'Distributed data pipeline and blockchain protocol engineering firm for fintech enterprises.', true, 'verified', 'active', 'hiring@fusionstack.in', 'contact@fusionstack.in', '100-250 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 93, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000016', 'AlphaCode Systems', 'https://alphacodesystems.com', 'Software Testing & QA', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&auto=format&fit=crop&q=80', 'Automated QA testing frameworks, Selenium pipelines, and API load testing specialists.', true, 'verified', 'active', 'qa@alphacodesystems.com', 'contact@alphacodesystems.com', '50-100 employees', 'Gurugram, Haryana', 'Gurugram', 'Haryana', 'India', 88, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000017', 'CyberShield Security', 'https://cybershield.sec', 'Information Security', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80', 'Application security audit, penetration testing, and OWASP compliance auditing firm.', true, 'verified', 'active', 'careers@cybershield.sec', 'contact@cybershield.sec', '100-250 employees', 'Mumbai, Maharashtra', 'Mumbai', 'Maharashtra', 'India', 96, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000018', 'DataVerse Analytics', 'https://dataverseanalytics.ai', 'AI & Machine Learning', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80', 'Predictive modeling, Pandas/NumPy analytics, and Machine Learning engineering lab.', true, 'verified', 'active', 'jobs@dataverseanalytics.ai', 'contact@dataverseanalytics.ai', '50-100 employees', 'Hyderabad, Telangana', 'Hyderabad', 'Telangana', 'India', 95, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000019', 'CloudFusion Technologies', 'https://cloudfusiontech.com', 'DevOps & SRE', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80', 'Site reliability engineering, AWS Terraform deployment, and Docker container automation.', true, 'verified', 'active', 'sre@cloudfusiontech.com', 'contact@cloudfusiontech.com', '100-250 employees', 'Noida, Uttar Pradesh', 'Noida', 'Uttar Pradesh', 'India', 93, NOW(), NOW()),

('c0000000-0000-0000-0000-000000000020', 'BrightMind AI', 'https://brightmindai.io', 'Generative AI & LLMs', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', 'Next-gen Generative AI research lab building custom LLM agents and RAG vector applications.', true, 'verified', 'active', 'ai@brightmindai.io', 'contact@brightmindai.io', '20-50 employees', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 99, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  industry = EXCLUDED.industry,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_verified = EXCLUDED.is_verified,
  verification_status = EXCLUDED.verification_status,
  status = EXCLUDED.status,
  official_email = EXCLUDED.official_email,
  contact_email = EXCLUDED.contact_email,
  company_size = EXCLUDED.company_size,
  headquarters = EXCLUDED.headquarters,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  trust_score = EXCLUDED.trust_score,
  updated_at = NOW();

-- 2. Insert 25 Realistic Internships into public.internships (Status = approved)
INSERT INTO public.internships (
  id,
  company_id,
  title,
  description,
  location,
  type,
  requirements,
  skills_needed,
  salary_range,
  stipend,
  duration,
  eligibility,
  deadline,
  openings_count,
  status,
  created_at,
  updated_at
) VALUES

-- 1. Frontend Developer (React.js)
('i0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'Frontend Developer Intern (React)', 
'Join NextWave Technologies to build responsive, component-driven web interfaces using React.js, TypeScript, and Tailwind CSS. You will collaborate with product designers to implement pixel-perfect user interfaces, integrate REST API endpoints, and optimize web app performance.',
'Bengaluru, Karnataka', 'hybrid', 
ARRAY['Strong proficiency in JavaScript ES6+ & TypeScript', 'Experience building React.js component trees', 'Understanding of REST APIs and async state management', 'Familiarity with Git and modern CSS frameworks like Tailwind'],
ARRAY['React', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Redux'],
'₹28,000 / month', '₹28,000 / month', '6 Months', 'B.Tech / BE / MCA Students (3rd & 4th Year)', CURRENT_DATE + INTERVAL '30 days', 3, 'approved', NOW(), NOW()),

-- 2. Next.js Full Stack Engineer
('i0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'Next.js Full Stack Developer Intern', 
'PixelStack Software is seeking a motivated Next.js Developer Intern to work on server-side rendered and App Router web platforms. You will develop React Server Components, construct API routes, integrate PostgreSQL databases, and build ultra-fast SaaS applications.',
'Remote', 'remote',
ARRAY['Hands-on experience with Next.js App Router and React', 'Proficiency in TypeScript and Node.js', 'Understanding of Server Actions and SQL database queries', 'Familiarity with Vercel deployment pipelines'],
ARRAY['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
'₹35,000 / month', '₹35,000 / month', '6 Months', 'B.Tech / BE (CS/IT) 2025/2026 Batch', CURRENT_DATE + INTERVAL '25 days', 2, 'approved', NOW(), NOW()),

-- 3. React & UI Engineer Intern
('i0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000014', 'React & UI Engineer Intern', 
'Work with InnoSpark Technologies design team to translate Figma design systems into scalable React component libraries. You will focus on micro-interactions, responsive layouts, accessibility compliance, and CSS animations.',
'Chennai, Tamil Nadu', 'hybrid',
ARRAY['Proficiency in HTML5, CSS3, and JavaScript', 'Experience with React hooks and component lifecycle', 'Eye for UI design details and Figma translation', 'Knowledge of responsive design principles'],
ARRAY['React', 'JavaScript', 'CSS', 'HTML', 'Figma', 'Responsive Design'],
'₹25,000 / month', '₹25,000 / month', '3 Months', 'Open to all Engineering & Design Undergraduates', CURRENT_DATE + INTERVAL '20 days', 4, 'approved', NOW(), NOW()),

-- 4. Angular Developer Intern
('i0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Angular Developer Intern', 
'TechNova Solutions is looking for an Angular Developer Intern to build enterprise web portals. You will write clean TypeScript code, work with RxJS observables, integrate RESTful APIs, and participate in Agile code reviews.',
'Bengaluru, Karnataka', 'on-site',
ARRAY['Solid understanding of TypeScript and Object-Oriented Programming', 'Familiarity with Angular framework architecture (Modules, Components, Services)', 'Understanding of RxJS and HTTP client integration'],
ARRAY['Angular', 'TypeScript', 'RxJS', 'HTML5', 'CSS3', 'REST API'],
'₹30,000 / month', '₹30,000 / month', '6 Months', 'B.Tech CS/IT/ECE 4th Year', CURRENT_DATE + INTERVAL '35 days', 2, 'approved', NOW(), NOW()),

-- 5. Vue.js Frontend Engineer
('i0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Vue.js Frontend Engineer Intern', 
'ByteForge Technologies needs a creative Vue.js Frontend Developer Intern to craft reactive web applications using Vue 3, Composition API, and Nuxt.js.',
'Remote', 'remote',
ARRAY['Proficiency in JavaScript and Vue.js 3 Composition API', 'Experience with state management using Pinia or Vuex', 'Understanding of web performance optimization'],
ARRAY['Vue.js', 'Nuxt.js', 'JavaScript', 'Tailwind CSS', 'HTML5'],
'₹26,000 / month', '₹26,000 / month', '4 Months', 'Undergraduate Engineering Students', CURRENT_DATE + INTERVAL '18 days', 2, 'approved', NOW(), NOW()),

-- 6. Backend Developer (Node.js)
('i0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Backend Developer Intern (Node.js & Express)', 
'Build scalable server-side applications at ByteForge Technologies. Responsibilities include developing RESTful APIs with Node.js and Express, managing MongoDB collections, implementing JWT authentication, and writing unit tests.',
'Hyderabad, Telangana', 'hybrid',
ARRAY['Strong command of JavaScript/Node.js asynchronous programming', 'Experience building REST APIs with Express.js', 'Knowledge of MongoDB/Mongoose or SQL databases', 'Understanding of JWT security and middleware'],
ARRAY['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT', 'TypeScript'],
'₹32,000 / month', '₹32,000 / month', '6 Months', 'B.Tech / MCA Final Year Students', CURRENT_DATE + INTERVAL '28 days', 3, 'approved', NOW(), NOW()),

-- 7. Java Spring Boot Developer
('i0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005', 'Java Spring Boot Developer Intern', 
'CodeSprint Technologies is hiring a Java Developer Intern for high-performance financial microservices. You will work with Core Java, Spring Boot, Hibernate ORM, and MySQL database optimization.',
'Chennai, Tamil Nadu', 'on-site',
ARRAY['Strong OOP knowledge in Java 11/17', 'Hands-on experience with Spring Boot framework', 'Understanding of relational databases (MySQL/PostgreSQL)', 'Basic knowledge of Maven and Git'],
ARRAY['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'REST API', 'Maven'],
'₹38,000 / month', '₹38,000 / month', '6 Months', 'B.Tech CS/IT 2025/2026 Batch', CURRENT_DATE + INTERVAL '40 days', 5, 'approved', NOW(), NOW()),

-- 8. Python Backend Developer
('i0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000013', 'Python Backend Developer Intern (Django)', 
'LogicLoop Software is recruiting a Python Backend Intern to design data processing APIs using Django and Flask. You will write clean Python code, design database schemas, and optimize query execution.',
'Hyderabad, Telangana', 'remote',
ARRAY['Strong Python programming skills', 'Experience with Django or Flask web frameworks', 'Understanding of relational database modeling (PostgreSQL)', 'Knowledge of RESTful API principles'],
ARRAY['Python', 'Django', 'Flask', 'PostgreSQL', 'REST API', 'Redis'],
'₹30,000 / month', '₹30,000 / month', '6 Months', 'B.Tech / B.Sc Computer Science Students', CURRENT_DATE + INTERVAL '22 days', 3, 'approved', NOW(), NOW()),

-- 9. FastAPI Developer Intern
('i0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000013', 'FastAPI Microservices Developer Intern', 
'Build high-speed asynchronous APIs with Python FastAPI at LogicLoop Software. You will work with Pydantic validation models, AsyncPG, Docker containers, and OpenAPI documentation.',
'Pune, Maharashtra', 'remote',
ARRAY['Proficiency in Python 3.9+ async/await syntax', 'Hands-on project experience with FastAPI', 'Understanding of Docker containerization', 'Familiarity with PostgreSQL database design'],
ARRAY['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API'],
'₹32,000 / month', '₹32,000 / month', '4 Months', 'Engineering Undergraduate / Postgraduate', CURRENT_DATE + INTERVAL '15 days', 2, 'approved', NOW(), NOW()),

-- 10. Full Stack Developer (MERN)
('i0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000011', 'Full Stack Developer Intern (MERN Stack)', 
'Innovexa Solutions is looking for a versatile MERN Stack Intern to build end-to-end web features. You will work across React frontends, Node.js/Express APIs, MongoDB schemas, and Tailwind CSS styling.',
'Bengaluru, Karnataka', 'hybrid',
ARRAY['Proficiency across React, Node.js, Express, and MongoDB', 'Experience with TypeScript and modern JavaScript', 'Understanding of Git workflow and pull requests', 'Ability to build responsive web apps from scratch'],
ARRAY['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
'₹40,000 / month', '₹40,000 / month', '6 Months', 'B.Tech CS/IT/ECE 3rd & 4th Year', CURRENT_DATE + INTERVAL '30 days', 4, 'approved', NOW(), NOW()),

-- 11. Full Stack Developer (Java)
('i0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000012', 'Full Stack Java Engineer Intern', 
'CoreMatrix Labs is seeking a Full Stack Java Intern to build enterprise web dashboards. You will combine Java Spring Boot backends with React frontend interfaces and PostgreSQL databases.',
'Pune, Maharashtra', 'on-site',
ARRAY['Strong Java Spring Boot knowledge', 'Familiarity with React.js or Angular', 'Proficiency in SQL database design', 'Basic understanding of Docker containers'],
ARRAY['Java', 'Spring Boot', 'React', 'PostgreSQL', 'TypeScript', 'Docker'],
'₹42,000 / month', '₹42,000 / month', '6 Months', 'B.Tech CS/IT 2025/2026 Batch', CURRENT_DATE + INTERVAL '30 days', 3, 'approved', NOW(), NOW()),

-- 12. AI & Computer Vision Engineer
('i0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000006', 'AI & Computer Vision Engineer Intern', 
'Join VisionAI Labs to develop deep learning models for image recognition, object detection, and video stream processing. You will work with PyTorch, OpenCV, YOLO, and TensorRT optimization pipelines.',
'Bengaluru, Karnataka', 'hybrid',
ARRAY['Strong Python math/algorithm background', 'Experience with PyTorch or TensorFlow', 'Hands-on computer vision project experience with OpenCV', 'Familiarity with Convolutional Neural Networks (CNNs)'],
ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Computer Vision', 'OpenCV'],
'₹50,000 / month', '₹50,000 / month', '6 Months', 'B.Tech/M.Tech/MS in CS, AI, or Data Science', CURRENT_DATE + INTERVAL '20 days', 2, 'approved', NOW(), NOW()),

-- 13. Generative AI & LLM Intern
('i0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000020', 'Generative AI & LLM Research Intern', 
'BrightMind AI is offering a cutting-edge research internship to build RAG (Retrieval-Augmented Generation) systems, fine-tune open-weight LLMs (Llama/Mistral), and build AI agent workflows using LangChain.',
'Bengaluru, Karnataka', 'remote',
ARRAY['Deep understanding of Large Language Models and NLP', 'Proficiency in Python and PyTorch', 'Experience with LangChain, LlamaIndex, or OpenAI APIs', 'Understanding of vector databases (FAISS, Chroma, Pinecone)'],
ARRAY['Python', 'PyTorch', 'LLMs', 'NLP', 'LangChain', 'OpenAI API', 'Transformers'],
'₹55,000 / month', '₹55,000 / month', '6 Months', 'B.Tech/M.Tech CS/AI Final Year Students', CURRENT_DATE + INTERVAL '25 days', 2, 'approved', NOW(), NOW()),

-- 14. Data Science & ML Intern
('i0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000018', 'Data Science & Machine Learning Intern', 
'DataVerse Analytics is looking for a Data Science Intern to clean complex datasets, perform exploratory data analysis, build predictive Machine Learning models (Random Forest, XGBoost), and present statistical insights.',
'Hyderabad, Telangana', 'hybrid',
ARRAY['Proficiency in Python data stack (Pandas, NumPy, Scikit-learn)', 'Strong SQL querying and data manipulation skills', 'Understanding of statistical analysis and hypothesis testing'],
ARRAY['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Data Visualization'],
'₹45,000 / month', '₹45,000 / month', '6 Months', 'B.Tech / M.Sc / MCA Students', CURRENT_DATE + INTERVAL '30 days', 3, 'approved', NOW(), NOW()),

-- 15. Data Analyst Intern
('i0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000007', 'Data Analyst Intern', 
'QuantumSoft Solutions seeks a detail-oriented Data Analyst Intern to create Power BI dashboards, write SQL queries, extract business insights, and automate weekly reporting metrics.',
'Gurugram, Haryana', 'hybrid',
ARRAY['Advanced SQL skills (joins, aggregations, window functions)', 'Experience with Power BI or Tableau visualization tools', 'Proficiency in Excel and basic Python scripting'],
ARRAY['SQL', 'Python', 'Power BI', 'Excel', 'Pandas', 'Data Analysis'],
'₹28,000 / month', '₹28,000 / month', '4 Months', 'Graduates / Postgraduates in Science/Engineering/Commerce', CURRENT_DATE + INTERVAL '20 days', 4, 'approved', NOW(), NOW()),

-- 16. DevOps & Cloud Engineer
('i0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000003', 'DevOps & Cloud Engineer Intern', 
'CloudNest Labs is recruiting a DevOps Intern to automate CI/CD build pipelines, containerize microservices with Docker, manage Kubernetes clusters, and provision AWS infrastructure using Terraform.',
'Pune, Maharashtra', 'remote',
ARRAY['Hands-on Linux command line proficiency', 'Understanding of Docker containerization and Dockerfiles', 'Basic knowledge of Kubernetes and AWS cloud concepts', 'Familiarity with GitHub Actions or Jenkins CI/CD'],
ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
'₹36,000 / month', '₹36,000 / month', '6 Months', 'B.Tech CS/IT/ECE Final Year', CURRENT_DATE + INTERVAL '25 days', 2, 'approved', NOW(), NOW()),

-- 17. Cloud Infrastructure (AWS) Intern
('i0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000019', 'AWS Cloud Infrastructure Intern', 
'CloudFusion Technologies is seeking an AWS Cloud Intern to configure EC2 instances, S3 storage buckets, VPC networking, IAM security policies, and Serverless Lambda functions.',
'Noida, Uttar Pradesh', 'remote',
ARRAY['Understanding of core AWS services (EC2, S3, RDS, Lambda)', 'Basic Linux administration and bash scripting', 'Understanding of networking principles (DNS, HTTP, Subnets)'],
ARRAY['AWS', 'Linux', 'Docker', 'Python', 'Networking', 'Terraform'],
'₹34,000 / month', '₹34,000 / month', '5 Months', 'Engineering Undergraduates', CURRENT_DATE + INTERVAL '30 days', 3, 'approved', NOW(), NOW()),

-- 18. Cybersecurity Analyst Intern
('i0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000017', 'Cybersecurity & Application Security Intern', 
'CyberShield Security is looking for an AppSec Intern to conduct OWASP vulnerability assessments, perform penetration testing with Burp Suite, analyze packet captures in Wireshark, and audit source code.',
'Mumbai, Maharashtra', 'on-site',
ARRAY['Understanding of OWASP Top 10 vulnerabilities', 'Experience using Burp Suite, Nmap, and Wireshark', 'Solid understanding of TCP/IP networking and Linux OS'],
ARRAY['Networking', 'OWASP', 'Burp Suite', 'Wireshark', 'Linux', 'Ethical Hacking'],
'₹35,000 / month', '₹35,000 / month', '6 Months', 'B.Tech CS/IT or Cybersecurity Certifications (CEH/EJPT)', CURRENT_DATE + INTERVAL '20 days', 2, 'approved', NOW(), NOW()),

-- 19. Network Security Intern
('i0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000010', 'Network Security & SOC Analyst Intern', 
'BluePeak Systems is hiring a SOC Intern to monitor security logs, inspect SIEM events, audit firewall rules, and assist in incident response procedures.',
'Mumbai, Maharashtra', 'hybrid',
ARRAY['Strong networking basics (OSI model, Subnetting, Firewalls)', 'Hands-on Linux command line skills', 'Scripting knowledge in Python or Bash'],
ARRAY['Linux', 'Networking', 'Python', 'OWASP', 'Penetration Testing'],
'₹32,000 / month', '₹32,000 / month', '6 Months', 'B.Tech CS/IT Students', CURRENT_DATE + INTERVAL '25 days', 2, 'approved', NOW(), NOW()),

-- 20. Android App Developer
('i0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000008', 'Native Android Developer Intern (Kotlin)', 
'SkyNet Digital is seeking an Android Developer Intern to build native mobile apps using Kotlin, Jetpack Compose, Retrofit, and Coroutines.',
'Noida, Uttar Pradesh', 'hybrid',
ARRAY['Proficiency in Kotlin and Android SDK', 'Experience with Jetpack Compose UI or XML layouts', 'Understanding of REST API integration via Retrofit'],
ARRAY['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'REST API', 'Git'],
'₹30,000 / month', '₹30,000 / month', '6 Months', 'B.Tech CS/IT/ECE 3rd & 4th Year', CURRENT_DATE + INTERVAL '30 days', 3, 'approved', NOW(), NOW()),

-- 21. Flutter Mobile Developer
('i0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000008', 'Flutter Cross-Platform Developer Intern', 
'Build iOS and Android apps with Flutter and Dart at SkyNet Digital. Responsibilities include state management (Provider/Bloc), Firebase integration, and UI widget development.',
'Remote', 'remote',
ARRAY['Proficiency in Dart programming language', 'Experience building Flutter apps', 'Understanding of state management (Provider/Bloc)', 'Familiarity with Firebase integration'],
ARRAY['Flutter', 'Dart', 'Firebase', 'REST API', 'Git', 'Mobile App Development'],
'₹28,000 / month', '₹28,000 / month', '4 Months', 'Open to all Engineering Undergraduates', CURRENT_DATE + INTERVAL '20 days', 2, 'approved', NOW(), NOW()),

-- 22. UI/UX Product Designer
('i0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000014', 'UI/UX Product Design Intern', 
'InnoSpark Technologies is hiring a creative UI/UX Intern to design wireframes, user journeys, interactive Figma prototypes, and design systems for web and mobile apps.',
'Chennai, Tamil Nadu', 'remote',
ARRAY['Mastery of Figma design tools', 'Strong portfolio showcasing wireframing & prototyping', 'Understanding of user research and usability testing'],
ARRAY['Figma', 'UI/UX', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
'₹25,000 / month', '₹25,000 / month', '3 Months', 'Students & Fresh Graduates with Design Portfolio', CURRENT_DATE + INTERVAL '15 days', 2, 'approved', NOW(), NOW()),

-- 23. QA Automation Engineer
('i0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000016', 'QA Automation Engineer Intern', 
'AlphaCode Systems is recruiting a QA Automation Intern to write automated web test scripts using Selenium WebDriver, execute Postman API collection tests, and report bug logs.',
'Gurugram, Haryana', 'on-site',
ARRAY['Programming knowledge in Java or Python', 'Experience with Selenium WebDriver framework', 'Understanding of API testing using Postman'],
ARRAY['Selenium', 'Java', 'Python', 'TestNG', 'Postman', 'API Testing'],
'₹27,000 / month', '₹27,000 / month', '6 Months', 'B.Tech / BCA / MCA Graduates', CURRENT_DATE + INTERVAL '28 days', 3, 'approved', NOW(), NOW()),

-- 24. Blockchain Developer Intern
('i0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000015', 'Blockchain & Smart Contract Developer Intern', 
'FusionStack Pvt Ltd is seeking a Blockchain Developer Intern to write Solidity smart contracts, deploy EVM dApps, and integrate Web3.js/Ethers.js frontend libraries.',
'Bengaluru, Karnataka', 'remote',
ARRAY['Hands-on experience with Solidity and EVM architecture', 'Familiarity with Hardhat or Foundry testing frameworks', 'Understanding of Web3.js or Ethers.js integration'],
ARRAY['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'TypeScript'],
'₹48,000 / month', '₹48,000 / month', '6 Months', 'B.Tech CS/IT Final Year Students', CURRENT_DATE + INTERVAL '22 days', 2, 'approved', NOW(), NOW()),

-- 25. IoT & Embedded Systems Intern
('i0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000001', 'IoT & Embedded Systems Engineer Intern', 
'TechNova Solutions is hiring an IoT Intern to build micro-controller firmware using C/C++, program ESP32 and Raspberry Pi boards, and publish sensor data via MQTT protocols.',
'Bengaluru, Karnataka', 'on-site',
ARRAY['Strong command of C/C++ embedded programming', 'Experience working with Arduino, ESP32, or Raspberry Pi', 'Understanding of MQTT, I2C, and SPI communication protocols'],
ARRAY['C', 'C++', 'Embedded Systems', 'IoT', 'Raspberry Pi', 'Arduino', 'MQTT'],
'₹26,000 / month', '₹26,000 / month', '6 Months', 'B.Tech ECE/EEE/CS Students', CURRENT_DATE + INTERVAL '30 days', 2, 'approved', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  requirements = EXCLUDED.requirements,
  skills_needed = EXCLUDED.skills_needed,
  salary_range = EXCLUDED.salary_range,
  stipend = EXCLUDED.stipend,
  duration = EXCLUDED.duration,
  eligibility = EXCLUDED.eligibility,
  deadline = EXCLUDED.deadline,
  openings_count = EXCLUDED.openings_count,
  status = EXCLUDED.status,
  updated_at = NOW();
