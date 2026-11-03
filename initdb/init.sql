-- /Users/tanmaysinha/Desktop/AI Hackathon/eduai-recommender/initdb/init.sql

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
    profile_pic_url TEXT,
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE topics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) UNIQUE NOT NULL,
    category    VARCHAR(100),
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_category ON topics(category);

CREATE TABLE uploaded_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_url        TEXT NOT NULL,               -- S3/MinIO URL
    file_type       VARCHAR(10) NOT NULL,        -- pdf, pptx, docx, txt
    extracted_text  TEXT,                        -- text extracted by Python service
    extracted_topics JSONB,                      -- array of detected topics/keywords
    processing_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, PROCESSING, DONE, FAILED
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notes_uploader ON uploaded_notes(uploader_id);
CREATE INDEX idx_notes_status ON uploaded_notes(processing_status);

CREATE TABLE course_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
    note_id         UUID REFERENCES uploaded_notes(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    platform        VARCHAR(50) NOT NULL,  -- YOUTUBE, COURSERA, UDEMY, TRYHACKME, etc.
    course_type     VARCHAR(20) NOT NULL,  -- FREE, PAID
    instructor      VARCHAR(200),
    duration        VARCHAR(50),
    rating          DECIMAL(3,2),
    tags            JSONB,                -- ["python", "beginner", "data-science"]
    is_active       BOOLEAN DEFAULT TRUE,
    relevance_score DECIMAL(5,4),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_rec_platform ON course_recommendations(platform);
CREATE INDEX idx_rec_type ON course_recommendations(course_type);
CREATE INDEX idx_rec_topic ON course_recommendations(topic_id);
CREATE INDEX idx_rec_tags ON course_recommendations USING GIN(tags);

CREATE TABLE user_searches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    query       TEXT NOT NULL,
    note_id     UUID REFERENCES uploaded_notes(id) ON DELETE SET NULL,
    results     JSONB,         -- cached result IDs for quick reload
    searched_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_searches_user ON user_searches(user_id);
CREATE INDEX idx_searches_date ON user_searches(searched_at);

CREATE TABLE saved_courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES course_recommendations(id) ON DELETE CASCADE,
    saved_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recommendation_id)
);

CREATE TABLE ai_chat_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  UUID NOT NULL,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message     TEXT NOT NULL,
    model_used  VARCHAR(100),   -- e.g. "gpt-4o", "gemini-1.5-pro", "claude-3-sonnet"
    tokens_used INTEGER,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chat_user ON ai_chat_history(user_id);
CREATE INDEX idx_chat_session ON ai_chat_history(session_id);

CREATE TABLE feedbacks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_email    VARCHAR(150),
    sender_name     VARCHAR(100),
    subject         VARCHAR(300),
    message         TEXT NOT NULL,
    category        VARCHAR(50),  -- BUG, SUGGESTION, COURSE_REQUEST, GENERAL
    status          VARCHAR(30) DEFAULT 'OPEN',  -- OPEN, REVIEWED, CLOSED
    is_email_sent   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_feedback_status ON feedbacks(status);
CREATE INDEX idx_feedback_email ON feedbacks(sender_email);

CREATE TABLE platform_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform    VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150),
    base_url    TEXT,
    topics      JSONB,    -- ["cybersecurity","networking"] — topics this platform covers
    is_active   BOOLEAN DEFAULT TRUE,
    logo_url    TEXT,
    description TEXT
);
