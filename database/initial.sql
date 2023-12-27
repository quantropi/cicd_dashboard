-- Initialize the database
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  github_id VARCHAR(255) UNIQUE NOT NULL,
  access_token VARCHAR(255),
  email VARCHAR(255) NOT NULL
);

-- workflows table
CREATE TABLE workflows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  github_workflow_id VARCHAR(255) NOT NULL,
  repository VARCHAR(255) NOT NULL,
  run_title VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  triggered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- artifacts table
CREATE TABLE artifacts (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id),
  s3_key VARCHAR(255),
  download_url VARCHAR(255)
);

-- notifications table:
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  workflow_id INTEGER REFERENCES workflows(id),
  message TEXT,
  sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);