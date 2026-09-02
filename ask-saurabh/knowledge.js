// Knowledge base for the "Ask Saurabh" widget.
// This is the ONLY source of facts the assistant may use. Keep it accurate and
// up to date — edit this file and redeploy the Worker to change what it knows.

export const KNOWLEDGE = `
# Saurabh Nair — profile

## Snapshot
- Role: Full Stack Data Scientist and AI/ML Architect.
- Current employer: Jet2 Travel Technologies (Senior Machine Learning Engineer), leading Generative AI initiatives.
- Experience: 8+ years in production ML and data science across travel, fintech, insurance, and technology services.
- Based in Mumbai, India; works remotely.
- Focus areas: Generative AI & LLMs, MLOps, Recommendation Systems.
- Languages spoken: English, Hindi, Marathi, Gujarati, Malayalam, French, Spanish.
- Outside work: national-level hockey player, Taekwondo black belt.
- Contact: email nsaurabh777.ai@gmail.com · LinkedIn linkedin.com/in/nsaurabh777 · GitHub github.com/nsaurabh777 · Portfolio nsaurabh777.github.io

## Experience

### Jet2 Travel Technologies — Senior Machine Learning Engineer (Apr 2024 – present, Pune, remote)
Promoted from Machine Learning Engineer.
- Spearheaded a multi-class, multi-label intent classification model using Mistral Generative AI on Snowflake Cortex, reaching 93% accuracy within two months; won the Team of the Year Award 2024–25.
- Built an LLM-as-a-Judge framework to arbitrate edge-case misclassifications between semantically similar intent classes, improving model reliability and decision confidence.
- Engineered a low-latency property recommendation platform: Two-Tower candidate generation with LightGBM/XGBoost reranking, OpenSearch vector retrieval, and Redis caching; benchmarked serverless vs. containerised serving across SageMaker, EKS, and ECS Fargate.
- Served models in real time via SageMaker Endpoints behind API Gateway and Lambda.
- Recognised with Employee of the Quarter (Jul–Sep 2024) and nominated for Employee of the Year.

### Jet2 Travel Technologies — Machine Learning Engineer (Aug 2022 – Mar 2024, Pune, remote)
- Architected a centrally governed Snowflake data science architecture integrating AWS SageMaker, Dataiku DSS, Hex, Tableau, Streamlit, and Snowsight, with role-based access, naming standards, and CI/CD-driven Dev/Stage/Prod promotion.
- Led migration of core ML projects from Dataiku DSS to AWS SageMaker, improving scalability, version control, and cost efficiency.
- Designed an MLOps governance framework in Dataiku DSS automating model lifecycle, approvals, and deployment workflows.
- Integrated Azure Artifact Registry with Snyk Enterprise across Dataiku, Hex, and SageMaker to secure the Python/PyPI supply chain in production.
- Built drift-aware automated retraining triggers and a real-time Tableau operational monitoring dashboard for production pipelines.
- Recognised with Employee of the Quarter (Jan–Mar 2023).

### Paytm — Data Scientist, Team Lead (Feb 2022 – Aug 2022, Mumbai)
- Built a CatBoost propensity model predicting payment likelihood and preferred communication channel, lifting conversion ~40% and reducing spend on ineffective channels.
- Designed a regression-based optimiser for customer touchpoint frequency (notifications/calls).
- Engineered a behavioural segmentation algorithm in Python for precision targeting and personalisation.
- Unified omnichannel KPIs into interactive strategy dashboards, cutting decision latency by 45%.
- Received the Rising Star Award.

### Servify — Data Scientist, Assistant Manager (Apr 2019 – Feb 2022, Mumbai)
- Built ARIMA/SARIMA/LSTM forecasting ensembles for business planning.
- Deployed an Isolation Forest / ensemble fraud detection pipeline flagging anomalous claims at 73% recall, reducing fraudulent activity ~20%.
- Shipped CNN (TensorFlow) classification and FastAI semantic segmentation models for phone crack/defect detection, cutting fraudulent post-damage protection-plan purchases by 97% (92% validation recall).
- Built data imputation pipelines with LightGBM and XGBoost.
- Ran deep exploratory analysis on fraud patterns that informed product pricing strategy.

### Servify — Data Analyst (Jun 2017 – Apr 2019, Mumbai)
- Built an automated reporting system with Django REST Framework and RabbitMQ, delivering real-time analytics and removing 4–5s synchronous waits; completed reports served via S3 presigned URLs.
- Delivered Inventory Management System (IMS) analytics with the supply chain team.
- Led physical-to-system inventory reconciliation initiatives.
- Built a web-scraping pipeline capturing specs and pricing for 10,000+ smartphone SKUs.
- Optimised and refactored SQL queries, improving data extraction speed by 60%.

## Skills
- Programming & frameworks: Python, R, SQL, Django REST Framework, Terraform, Docker.
- Machine learning & AI: Generative AI / LLMs (Mistral, Anthropic Claude), LLM-as-a-Judge, RAG, NLP, Computer Vision, Time Series Forecasting, Recommendation Systems (Two-Tower), Deep Learning, CatBoost, XGBoost, LightGBM, TensorFlow, FastAI.
- MLOps & deployment: model deployment automation, drift-based retraining, model monitoring, CI/CD, model lifecycle governance, Dataiku DSS, AWS SageMaker.
- Cloud & data engineering: Snowflake, Snowflake Cortex, AWS (SageMaker, Lambda, API Gateway, ECS Fargate, EKS, S3), Azure, GCP, Redis, OpenSearch, Kafka, Spark, Hadoop, Hive, Druid.
- Analytics & visualisation: Tableau, Streamlit, Superset, Hex, Snowsight, Pandas, PySpark, Seaborn.
- Databases: Snowflake, MySQL, PostgreSQL, MongoDB, Hive.
- Security, governance & automation: Snyk, Azure Artifact Registry, RabbitMQ, role-based access control, data governance, n8n.

## Selected projects
- Multi-Label Intent Classification — Mistral on Snowflake Cortex with an LLM-as-a-Judge arbitration layer; 93% accuracy in 60 days; won Team of the Year 2024–25.
- Recommendation Engine (Properties) — Two-Tower model served via SageMaker Endpoints with API Gateway and Lambda, orchestrated across ECS Fargate / EKS, with Redis caching and OpenSearch retrieval.
- Conversion & Channel Optimization — CatBoost propensity models and cadence optimisers lifting conversion ~40%; omnichannel dashboards cut decision latency 45%.
- Forecasting & Fraud Detection — ARIMA/SARIMA/LSTM ensembles plus Isolation Forest fraud models at 73% recall.
- Crack & Defect Detection — CNN classification and FastAI segmentation on phone images; cut fraudulent plan purchases 97%.
- Async Reporting Engine — Django + RabbitMQ decoupled report generation from the frontend; results delivered via S3 presigned URLs.
- ShrinklitPDF — Streamlit web app and Python API that compresses image-heavy PDFs to a target file size while preserving document structure (PyMuPDF, Pillow). Live demo available. github.com/nsaurabh777/shrinklitPDF

## Education
- MBA Tech (IT), NMIMS University — Mukesh Patel School of Technology Management & Engineering, Mumbai, 2012–2017. Major in Business Intelligence & Analytics. CGPA 3.21/4.

## Certifications
- Build Product 10x Faster with GenAI — Analytics Vidhya (Jul 2025)
- Reimagining GenAI: Common Mistakes & Best Practices
- Ethics in the Age of Generative AI
- n8n: A Complete Guide to the Automation Tool
- Machine Learning — Analytics Vidhya (Oct 2021)
- Natural Language Processing — Analytics Vidhya (Oct 2021)
- Ethical Hacking (2015)

## Awards & recognition
- Team of the Year 2024–25, Jet2 Travel Technologies — Intent Classification (Generative AI).
- Employee of the Quarter x2, Jet2 (Jan–Mar 2023; Jul–Sep 2024); Employee of the Year nominee.
- Speaker, DataHack Summit 2023 (Analytics Vidhya) — "End-to-End ML Pipeline for Predictive Maintenance using OCR & NLP".
- Rising Star Award, Paytm.
- 6th place, Analytics Vidhya Job-a-thon (national).
- Personal recommendation letter from the CEO of Patronus Creative.
`.trim();
